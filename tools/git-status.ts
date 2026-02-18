import { exec } from "node:child_process";
import { promisify } from "node:util";
import { tool } from "@opencode-ai/plugin";

const execAsync = promisify(exec);

const _getGitStatus = async () => {
	try {
		const statusResult = await execAsync("git status --short");
		const branchResult = await execAsync("git rev-parse --abbrev-ref HEAD");
		return {
			status: statusResult.stdout.trim(),
			branch: branchResult.stdout.trim(),
		};
	} catch (error) {
		throw new Error(
			`Git command failed: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
};

const _formatGitStatus = (status: string, branch: string) => {
	if (!status) {
		return `Branch: ${branch}\nWorking tree clean`;
	}

	const lines = status.split("\n");
	const modified = lines.filter((l) => l.startsWith(" M")).length;
	const added = lines.filter((l) => l.startsWith("A")).length;
	const deleted = lines.filter((l) => l.startsWith(" D")).length;
	const untracked = lines.filter((l) => l.startsWith("??")).length;

	let summary = `Branch: ${branch}\n`;
	if (modified > 0) {
		summary += `Modified: ${modified}\n`;
	}
	if (added > 0) {
		summary += `Added: ${added}\n`;
	}
	if (deleted > 0) {
		summary += `Deleted: ${deleted}\n`;
	}
	if (untracked > 0) {
		summary += `Untracked: ${untracked}\n`;
	}

	return `${summary}\nFull status:\n${status}`;
};

export const gitStatusTool = tool({
	description:
		"Get the current git repository status including branch, modified, added, and deleted files",
	args: {},
	async execute() {
		try {
			const { status, branch } = await _getGitStatus();
			return _formatGitStatus(status, branch);
		} catch (error) {
			return `Error: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
});
