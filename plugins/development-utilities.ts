import { constants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tool } from "@opencode-ai/plugin";

async function _fileOrDirExists(path: string): Promise<boolean> {
	try {
		await access(path, constants.F_OK);
		return true;
	} catch (_err) {
		return false;
	}
}

async function _readTextFile(path: string): Promise<string> {
	try {
		if (!(await _fileOrDirExists(path))) {
			throw new Error(`File not found: ${path}`);
		}
		return await readFile(path, "utf-8");
	} catch (error) {
		throw new Error(
			`Failed to read file ${path}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
}

const TOML_NAME_REGEX = /name\s*=\s*"([^"]+)"/;
const TOML_VERSION_REGEX = /version\s*=\s*"([^"]+)"/;
const GO_MODULE_REGEX = /module\s+(\S+)/;

interface FileStats {
	path: string;
	lines: number;
	size: number;
	extension: string;
}

async function _executeFileStats(
	args: { pattern: string },
	context: { directory: string },
): Promise<unknown> {
	const files: FileStats[] = [];
	const { glob } = await import("glob");
	const matchedFiles = await glob(args.pattern, { cwd: context.directory });

	for (const file of matchedFiles) {
		const filePath = join(context.directory, file);
		try {
			const exists = await _fileOrDirExists(filePath);
			if (exists) {
				const content = await _readTextFile(filePath);
				const lines = content.split("\n").length;
				const extension = file.split(".").pop() || "";

				files.push({
					path: file,
					lines,
					size: content.length,
					extension,
				});
			}
		} catch (error) {
			console.debug(
				`Skipping file ${file}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	const totalLines = files.reduce((sum, f) => sum + f.lines, 0);
	const totalSize = files.reduce((sum, f) => sum + f.size, 0);
	const extensionCounts = files.reduce<Record<string, number>>((acc, f) => {
		acc[f.extension] = (acc[f.extension] || 0) + 1;
		return acc;
	}, {});

	return {
		file_count: files.length,
		total_lines: totalLines,
		total_size_bytes: totalSize,
		by_extension: extensionCounts,
		largest_files: files
			.sort((a, b) => b.lines - a.lines)
			.slice(0, 10)
			.map((f) => ({ path: f.path, lines: f.lines })),
	};
}

async function _executeGitChanges(
	_args: Record<string, unknown>,
	context: { directory: string },
): Promise<unknown> {
	try {
		const { exec } = await import("node:child_process");
		const { promisify } = await import("node:util");
		const execAsync = promisify(exec);

		const statusResult = await execAsync(
			`cd ${context.directory as string} && git status --porcelain`,
		);

		const diffResult = await execAsync(
			`cd ${context.directory as string} && git diff --stat`,
		);

		const status = statusResult.stdout;
		const diff = diffResult.stdout;

		const parsedStatus = status
			.split("\n")
			.filter((line) => line.trim())
			.map((line) => {
				const status = line.substring(0, 2);
				const file = line.substring(3);
				return { status, file };
			});

		return {
			has_changes: parsedStatus.length > 0,
			modified_files: parsedStatus.filter((f) => f.status.includes("M")).length,
			new_files: parsedStatus.filter((f) => f.status.includes("?")).length,
			deleted_files: parsedStatus.filter((f) => f.status.includes("D")).length,
			files: parsedStatus,
			diff,
		};
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

async function _executePackageInfo(
	_args: Record<string, unknown>,
	context: { directory: string },
): Promise<unknown> {
	const packageFiles = [
		"package.json",
		"pyproject.toml",
		"Cargo.toml",
		"go.mod",
		"pom.xml",
		"composer.json",
		"Gemfile",
	];

	const found: string[] = [];
	for (const file of packageFiles) {
		const exists = await _fileOrDirExists(join(context.directory, file));
		if (exists) {
			found.push(file);
		}
	}

	const info: Record<string, unknown> = {};

	for (const file of found) {
		const path = join(context.directory, file);
		const content = await _readTextFile(path);
		_parseManifestFile(file, path, content, info);
	}

	return {
		detected_manifests: found,
		...info,
	};
}

function _parseManifestFile(
	file: string,
	path: string,
	content: string,
	info: Record<string, unknown>,
): void {
	if (file === "package.json") {
		try {
			const pkg = JSON.parse(content);
			info.package_json = {
				name: pkg.name,
				version: pkg.version,
				dependencies: Object.keys(pkg.dependencies || {}),
				devDependencies: Object.keys(pkg.devDependencies || {}),
				scripts: Object.keys(pkg.scripts || {}),
			};
		} catch (error) {
			console.error(
				`Failed to parse package.json at ${path}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	} else if (file === "Cargo.toml") {
		const nameMatch = content.match(TOML_NAME_REGEX);
		const versionMatch = content.match(TOML_VERSION_REGEX);
		info.cargo_toml = {
			name: nameMatch?.[1],
			version: versionMatch?.[1],
		};
	} else if (file === "go.mod") {
		const moduleMatch = content.match(GO_MODULE_REGEX);
		info.go_mod = {
			module: moduleMatch?.[1],
		};
	}
}

async function _executeRunScript(
	args: { command: string; timeout?: number },
	context: { directory: string },
): Promise<unknown> {
	const timeoutMs = args.timeout || 30000;

	try {
		const { exec } = await import("node:child_process");
		const { promisify } = await import("node:util");
		const execAsync = promisify(exec);

		const result = await Promise.race([
			execAsync(`cd ${context.directory as string} && ${args.command}`),
			new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error("Command timeout")), timeoutMs),
			),
		]);

		return {
			command: args.command,
			exit_code: 0,
			output: result.stdout || "",
			errors: result.stderr || "",
			success: true,
		};
	} catch (error) {
		return {
			command: args.command,
			error: error instanceof Error ? error.message : String(error),
			success: false,
		};
	}
}

function _createFileStatsTool() {
	return {
		description:
			"Get statistics about files in the project - counts, sizes, lines of code, and breakdown by extension",
		args: {
			pattern: tool.schema
				.string()
				.default("**/*.{ts,js,py,go,rs,java,rb,php}")
				.describe(
					'File glob pattern to analyze (e.g., "src/**/*.ts", "**/*.py")',
				),
		},
		async execute(
			args: Record<string, unknown>,
			context: Record<string, unknown>,
		) {
			try {
				const result = await _executeFileStats(args as never, context as never);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

function _createGitChangesTool() {
	return {
		description:
			"Check current git status and see what files have been modified, added, or deleted",
		args: {},
		async execute(
			args: Record<string, unknown>,
			context: Record<string, unknown>,
		) {
			try {
				const result = await _executeGitChanges(args, context as never);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

function _createPackageInfoTool() {
	return {
		description:
			"Extract package information from manifest files (package.json, Cargo.toml, go.mod, etc.)",
		args: {},
		async execute(
			_args: Record<string, unknown>,
			context: Record<string, unknown>,
		) {
			try {
				const result = await _executePackageInfo(_args, context as never);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

function _createRunScriptTool() {
	return {
		description:
			"Execute a shell command in the project directory (build scripts, test commands, package manager commands)",
		args: {
			command: tool.schema
				.string()
				.describe("Shell command to run (e.g., 'bun test', 'cargo build')"),
			timeout: tool.schema
				.number()
				.optional()
				.describe("Timeout in milliseconds (default: 30000)"),
		},
		async execute(
			args: Record<string, unknown>,
			context: Record<string, unknown>,
		) {
			try {
				const result = await _executeRunScript(args as never, context as never);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

// biome-ignore lint/style/noDefaultExport: OpenCode plugin loader expects default export
export default function developmentUtilities(_ctx: Record<string, unknown>) {
	return {
		tool: {
			"dev.file-stats": _createFileStatsTool(),
			"dev.git-changes": _createGitChangesTool(),
			"dev.package-info": _createPackageInfoTool(),
			"dev.run-script": _createRunScriptTool(),
		},
	};
}
