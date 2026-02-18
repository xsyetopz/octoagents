import { exec } from "node:child_process";
import { constants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { tool } from "@opencode-ai/plugin";

const execAsync = promisify(exec);

async function _fileExists(path: string): Promise<boolean> {
	try {
		await access(path, constants.F_OK);
		return true;
	} catch (_err) {
		return false;
	}
}

async function _readTextFile(path: string): Promise<string> {
	try {
		if (!(await _fileExists(path))) {
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

async function _checkSemgrep(): Promise<void> {
	try {
		await execAsync("which semgrep");
	} catch (_err) {
		console.log("Installing semgrep...");
		await execAsync("brew install semgrep");
	}
}

async function _checkComplexityTool(): Promise<void> {
	try {
		await execAsync("which complexity");
	} catch (_err) {
		console.log("Installing complexity-report...");
		await execAsync("npm install -g complexity-report");
	}
}

const LINTER_SPLIT_REGEX = /\s+/;

function _calculateCyclomaticComplexity(code: string): number {
	const patterns = [
		/\bif\b/g,
		/\belse\b/g,
		/\bwhile\b/g,
		/\bfor\b/g,
		/\bcase\b/g,
		/\bcatch\b/g,
		/&&/g,
		/\|\|/g,
		/\?/g,
	];

	const complexity = patterns.reduce((sum, pattern) => {
		const matches = code.match(pattern);
		return sum + (matches ? matches.length : 0);
	}, 1);

	return complexity;
}

function _getComplexityAssessment(complexity: number): {
	severity: "critical" | "high" | "medium";
	recommendation: string;
} {
	if (complexity > 20) {
		return {
			severity: "critical",
			recommendation: "Critical: Consider refactoring into smaller functions",
		};
	}

	if (complexity > 15) {
		return {
			severity: "high",
			recommendation: "High: Review and simplify control flow",
		};
	}

	return {
		severity: "medium",
		recommendation: "Medium: Monitor complexity",
	};
}

async function _globFiles(pattern: string, cwd: string): Promise<string[]> {
	const { glob } = await import("glob");
	return await glob(pattern, { cwd });
}

async function _executeMetricsComplexity(
	args: { target: string; threshold?: number },
	context: { directory: string },
): Promise<unknown> {
	await _checkComplexityTool();

	const files = await _globFiles(args.target, context.directory);
	const results: unknown[] = [];
	const threshold = args.threshold ?? 10;

	for (const file of files) {
		const filePath = `${context.directory as string}/${file}`;
		const content = await _readTextFile(filePath);
		const complexity = _calculateCyclomaticComplexity(content);
		const lines = content.split("\n").length;

		if (complexity < threshold) {
			continue;
		}

		const assessment = _getComplexityAssessment(complexity);
		results.push({
			file,
			complexity,
			lines,
			...assessment,
		});
	}

	return {
		scanned: files.length,
		threshold,
		high_complexity: results.length,
		files: results,
	};
}

async function _executeMetricsDependencies(
	args: { target: string },
	context: { directory: string },
): Promise<unknown> {
	const files = await _globFiles(args.target, context.directory);
	const dependencies = new Map<string, Set<string>>();

	for (const file of files) {
		const filePath = `${context.directory as string}/${file}`;
		const content = await _readTextFile(filePath);

		const importMatch = content.matchAll(/import\s+.*?from\s+['"](.*?)['"]/g);
		for (const match of importMatch) {
			const dependency = match[1];
			if (!dependencies.has(file)) {
				dependencies.set(file, new Set());
			}
			dependencies.get(file)?.add(dependency);
		}
	}

	const allDependencies = new Set<string>();
	dependencies.forEach((deps) => {
		for (const d of deps) {
			allDependencies.add(d);
		}
	});

	return {
		scanned: files.length,
		total_unique_dependencies: allDependencies.size,
		dependencies_by_file: Object.fromEntries(
			Array.from(dependencies.entries()).map(
				([file, deps]): [string, string[]] => [file, Array.from(deps)],
			),
		),
		top_dependencies: Array.from(allDependencies).reduce<
			Record<string, number>
		>((acc, dep) => {
			acc[dep] = (acc[dep] ?? 0) + 1;
			return acc;
		}, {}),
	};
}

async function _executeAnalysisLinting(
	args: { target: string; linter: string },
	context: { directory: string },
): Promise<unknown> {
	const linter = args.linter.trim().split(LINTER_SPLIT_REGEX)[0];
	if (linter === "semgrep") {
		await _checkSemgrep();
	}

	const command = `cd ${
		context.directory as string
	} && ${args.linter} ${args.target}`;
	try {
		const result = await execAsync(command);
		return {
			command: `${args.linter} ${args.target}`,
			exitCode: 0,
			output: result.stdout,
			errors: result.stderr,
			has_issues: false,
		};
	} catch (error: unknown) {
		const err = error as { stdout?: string; stderr?: string };
		return {
			command: `${args.linter} ${args.target}`,
			exitCode: 1,
			output: err.stdout || "",
			errors: err.stderr || "",
			has_issues: true,
		};
	}
}

function _createComplexityTool() {
	return {
		description:
			"Calculate cyclomatic complexity for code files. Identify complex functions that may need refactoring.",
		args: {
			target: tool.schema
				.string()
				.describe(
					'File pattern to analyze (e.g., "src/**/*.ts", "lib/**/*.js")',
				),
			threshold: tool.schema
				.number()
				.optional()
				.describe("Complexity threshold (default: 10)"),
		},
		async execute(
			args: Record<string, unknown>,
			context: Record<string, unknown>,
		) {
			try {
				const result = await _executeMetricsComplexity(
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

function _createDependenciesTool() {
	return {
		description:
			"Analyze import/dependency patterns in code files. Map out module dependencies and identify usage patterns.",
		args: {
			target: tool.schema
				.string()
				.describe(
					'File pattern to analyze (e.g., "src/**/*.ts", "lib/**/*.js")',
				),
		},
		async execute(
			args: Record<string, unknown>,
			context: Record<string, unknown>,
		) {
			try {
				const result = await _executeMetricsDependencies(
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

function _createLintingTool() {
	return {
		description:
			"Run linter and report issues. Supports eslint, flake8, ruff, and other linters",
		args: {
			target: tool.schema.string().describe("File or directory to lint"),
			linter: tool.schema
				.string()
				.default("eslint")
				.describe("Linter to run (eslint, flake8, ruff, etc.)"),
		},
		async execute(
			args: Record<string, unknown>,
			context: Record<string, unknown>,
		) {
			try {
				const result = await _executeAnalysisLinting(
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

// biome-ignore lint/style/noDefaultExport: OpenCode plugin loader expects default export
export default function codeAnalysisPlugin(_ctx: Record<string, unknown>) {
	return {
		tool: {
			"metrics.complexity": _createComplexityTool(),
			"metrics.dependencies": _createDependenciesTool(),
			"analysis.linting": _createLintingTool(),
		},
	};
}
