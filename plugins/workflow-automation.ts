import { join } from "node:path";
import { tool } from "@opencode-ai/plugin";
import { readTextFile, writeTextFile } from "../src/utils/files.ts";

const BRANCH_INDICATOR_REGEX = /^\* /;
const FILENAME_WITH_EXT_REGEX = /^(.*)\.(.+)$/;
const LAST_PATH_COMPONENT_REGEX = /[^/]+$/;
const FILENAME_BEFORE_EXT_REGEX = /^(.*)\./;

async function _executeGitCommit(
	args: { message: string; files?: string },
	context: { directory: string },
): Promise<unknown> {
	try {
		const files = args.files || ".";

		await Bun.$`cd ${context.directory as string} && git add ${files}`;
		const result =
			await Bun.$`cd ${context.directory as string} && git commit -m ${args.message}`;

		return {
			success: result.exitCode === 0,
			message: args.message,
			output: result.stdout.toString(),
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

async function _executeGitBranch(
	args: { action: string; branch?: string },
	context: { directory: string },
): Promise<unknown> {
	try {
		switch (args.action) {
			case "create":
			case "switch":
				return await _executeBranchCreateOrSwitch(args, context);
			case "list":
				return await _executeBranchList(context);
			default:
				return { error: `Unknown action: ${args.action}` };
		}
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

async function _executeBranchCreateOrSwitch(
	args: { action: string; branch?: string },
	context: { directory: string },
): Promise<unknown> {
	if (!args.branch) {
		return { error: `Branch name is required for ${args.action} action` };
	}

	const checkoutArg = args.action === "create" ? "-b" : "";
	const result = await Bun.$`cd ${
		context.directory as string
	} && git checkout ${checkoutArg} ${args.branch}`;

	return {
		success: result.exitCode === 0,
		output: result.stdout.toString() || "",
	};
}

async function _executeBranchList(context: {
	directory: string;
}): Promise<unknown> {
	const result = await Bun.$`cd ${context.directory as string} && git branch`;
	const branches = result.stdout
		.toString()
		.split("\n")
		.filter((b) => b.trim())
		.map((b) => b.trim().replace(BRANCH_INDICATOR_REGEX, ""));
	return { branches };
}

async function _executeFileTemplate(
	args: { template: string; output: string; vars?: Record<string, string> },
	context: { directory: string },
): Promise<unknown> {
	try {
		const templatePath = join(context.directory, args.template);
		let content = await readTextFile(templatePath);

		if (args.vars) {
			for (const [key, value] of Object.entries(args.vars)) {
				const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
				content = content.replace(regex, value);
			}
		}

		const outputPath = join(context.directory, args.output);
		await writeTextFile(outputPath, content);

		return {
			success: true,
			output: args.output,
			variables_replaced: Object.keys(args.vars || {}).length,
		};
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

async function _executeBatchRename(
	args: { pattern: string; replacement: string; dryRun?: boolean },
	context: { directory: string },
): Promise<unknown> {
	try {
		const globber = new Bun.Glob(args.pattern);
		const renamed: Array<{ from: string; to: string }> = [];

		for await (const file of globber.scan({ cwd: context.directory })) {
			const match = file.match(FILENAME_WITH_EXT_REGEX);
			if (!match) {
				continue;
			}

			const newName = file.replace(
				LAST_PATH_COMPONENT_REGEX,
				file
					.split("/")
					.pop()
					?.replace(FILENAME_BEFORE_EXT_REGEX, `${args.replacement}.`) || "",
			);

			if (file !== newName) {
				renamed.push({ from: file, to: newName });

				if (!args.dryRun) {
					const oldPath = join(context.directory, file);
					const newPath = join(context.directory, newName);
					await Bun.$`mv ${oldPath} ${newPath}`;
				}
			}
		}

		return {
			files_renamed: renamed.length,
			dry_run: args.dryRun,
			renamed,
		};
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

async function _executeGitCommand(
	directory: string,
	command: string,
): Promise<{ exitCode: number; stdout: string }> {
	const result = await Bun.$`cd ${directory} && ${command}`.quiet();
	return {
		exitCode: result.exitCode,
		stdout: result.stdout.toString().trim(),
	};
}

async function _checkFileExists(
	directory: string,
	file: string,
): Promise<boolean> {
	try {
		const result = await Bun.$`cd ${directory} && test -e ${file}`.quiet();
		return result.exitCode === 0;
	} catch {
		return false;
	}
}

async function _detectCiConfigs(directory: string): Promise<string[]> {
	const ciFiles = [
		".github/workflows",
		".gitlab-ci.yml",
		".circleci/config.yml",
		"azure-pipelines.yml",
		".travis.yml",
		"Jenkinsfile",
	];

	const detectedCi: string[] = [];
	for (const file of ciFiles) {
		if (await _checkFileExists(directory, file)) {
			detectedCi.push(file);
		}
	}

	return detectedCi;
}

async function _executeCiStatus(
	_args: Record<string, unknown>,
	context: { directory: string },
): Promise<unknown> {
	try {
		const repoCheck = await _executeGitCommand(
			context.directory,
			"git rev-parse --git-dir",
		);
		if (repoCheck.exitCode !== 0) {
			return { error: "Not a git repository" };
		}

		const branchResult = await _executeGitCommand(
			context.directory,
			"git branch --show-current",
		);
		const branch = branchResult.stdout;

		const remoteResult = await _executeGitCommand(
			context.directory,
			"git remote get-url origin",
		);
		const remote = remoteResult.stdout;

		const detectedCi = await _detectCiConfigs(context.directory);

		return {
			branch,
			remote,
			ci_configs: detectedCi,
			has_ci: detectedCi.length > 0,
		};
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

function _createGitCommitTool() {
	return {
		description: "Commit changes to git with a message",
		args: {
			message: tool.schema.string().describe("Commit message"),
			files: tool.schema
				.string()
				.optional()
				.describe('Files to commit (default: "." for all)'),
		},
		async execute(
			args: Record<string, unknown>,
			context: Record<string, unknown>,
		) {
			try {
				const result = await _executeGitCommit(args as never, context as never);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

function _createGitBranchTool() {
	return {
		description:
			'Manage git branches (create, switch, list). Actions: "create", "switch", "list"',
		args: {
			action: tool.schema
				.string()
				.describe('Action to perform: "create", "switch", or "list"'),
			branch: tool.schema
				.string()
				.optional()
				.describe("Branch name (required for create/switch)"),
		},
		async execute(
			args: Record<string, unknown>,
			context: Record<string, unknown>,
		) {
			try {
				const result = await _executeGitBranch(args as never, context as never);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

function _createFileTemplateTool() {
	return {
		description:
			"Generate file from template with variable substitution ({{var}} syntax)",
		args: {
			template: tool.schema
				.string()
				.describe("Path to template file (relative to project)"),
			output: tool.schema
				.string()
				.describe("Output file path (relative to project)"),
			vars: tool.schema
				.object()
				.optional()
				.describe("Variables to replace in template (key-value pairs)"),
		},
		async execute(
			args: Record<string, unknown>,
			context: Record<string, unknown>,
		) {
			try {
				const result = await _executeFileTemplate(
					args as never,
					context as never,
				);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

function _createBatchRenameTool() {
	return {
		description: "Rename multiple files matching a pattern",
		args: {
			pattern: tool.schema
				.string()
				.describe('File pattern to match (e.g., "src/**/*.old.js")'),
			replacement: tool.schema
				.string()
				.describe("New name pattern (replaces filename before extension)"),
			dryRun: tool.schema
				.boolean()
				.optional()
				.describe("Preview changes without renaming (default: false)"),
		},
		async execute(
			args: Record<string, unknown>,
			context: Record<string, unknown>,
		) {
			try {
				const result = await _executeBatchRename(
					args as never,
					context as never,
				);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

function _createCiStatusTool() {
	return {
		description:
			"Check CI/CD configuration status - detect CI systems, current branch, and remote",
		args: {},
		async execute(
			_args: Record<string, unknown>,
			context: Record<string, unknown>,
		) {
			try {
				const result = await _executeCiStatus(_args, context as never);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

// biome-ignore lint/style/noDefaultExport: OpenCode plugin loader expects default export
export default function workflowAutomation(_ctx: Record<string, unknown>) {
	return {
		tool: {
			"workflow.git-commit": _createGitCommitTool(),
			"workflow.git-branch": _createGitBranchTool(),
			"workflow.file-template": _createFileTemplateTool(),
			"workflow.batch-rename": _createBatchRenameTool(),
			"workflow.ci-status": _createCiStatusTool(),
		},
	};
}
