import { tool } from "@opencode-ai/plugin";
import { $ } from "bun";

const _checkSemgrep = async () => {
	try {
		await $`which semgrep`.quiet();
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
		const output = await $`semgrep --config ${ruleArg} ${path}`.text();
		return output;
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
