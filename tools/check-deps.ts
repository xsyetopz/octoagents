import { exec } from "node:child_process";
import { promisify } from "node:util";
import { tool } from "@opencode-ai/plugin";

const execAsync = promisify(exec);

const _checkDependencies = async (cwd?: string) => {
	try {
		const command = cwd ? `cd ${cwd} && npm audit` : "npm audit";
		const { stdout } = await execAsync(command);
		return stdout;
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
