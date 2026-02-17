import { tool } from "@opencode-ai/plugin";
import { $ } from "bun";

const _checkDependencies = async (cwd?: string) => {
	try {
		const command = cwd ? $`cd ${cwd} && bun audit` : $`bun audit`;
		const output = await command.text();
		return output;
	} catch (error) {
		const errorOutput = error instanceof Error ? error.message : String(error);
		return errorOutput;
	}
};

export const checkDependenciesTool = tool({
	description:
		"Check for known security vulnerabilities in project dependencies using bun audit",
	args: {
		cwd: tool.schema
			.string()
			.optional()
			.describe("Working directory (defaults to current directory)"),
	},
	async execute(args) {
		try {
			const output = await _checkDependencies(args.cwd);
			return `Dependency Security Audit:\n\n${output}`;
		} catch (error) {
			return `Error: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
});
