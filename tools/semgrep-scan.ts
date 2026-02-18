import { exec } from "node:child_process";
import { promisify } from "node:util";
import { tool } from "@opencode-ai/plugin";

const execAsync = promisify(exec);

const _checkSemgrep = async () => {
	try {
		await execAsync("which semgrep");
		return true;
	} catch {
		return false;
	}
};

const _runSemgrep = async (path: string, rules?: string) => {
	const hasSemgrep = await _checkSemgrep();
	if (!hasSemgrep) {
		throw new Error(
			"Semgrep is not installed. Install with: brew install semgrep",
		);
	}

	try {
		const ruleArg = rules || "auto";
		const { stdout } = await execAsync(`semgrep --config ${ruleArg} ${path}`);
		return stdout;
	} catch (error) {
		const errorOutput = error instanceof Error ? error.message : String(error);
		return errorOutput;
	}
};

export const semgrepScanTool = tool({
	description:
		"Run Semgrep security and code quality scanner on specified files or directories",
	args: {
		path: tool.schema.string().describe("Path to scan (file or directory)"),
		rules: tool.schema
			.string()
			.optional()
			.describe(
				"Semgrep rules to use (default: auto). Examples: 'p/security-audit', 'p/owasp-top-ten'",
			),
	},
	async execute(args) {
		try {
			const output = await _runSemgrep(args.path, args.rules);
			return `Semgrep Scan Results:\n\n${output}`;
		} catch (error) {
			return `Error: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
});
