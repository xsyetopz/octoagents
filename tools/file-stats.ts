import { stat } from "node:fs/promises";
import { tool } from "@opencode-ai/plugin";

const BYTES_PER_KB = 1024;
const BYTES_PER_MB = 1024 * 1024;
const BYTES_PER_GB = 1024 * 1024 * 1024;

const _getFileStats = async (filePath: string) => {
	try {
		const stats = await stat(filePath);
		return {
			size: stats.size,
			created: stats.birthtime,
			modified: stats.mtime,
			isDirectory: stats.isDirectory(),
			isFile: stats.isFile(),
			permissions: stats.mode.toString(8).slice(-3),
		};
	} catch (error) {
		throw new Error(
			`Failed to get file stats: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
};

const _formatSize = (bytes: number): string => {
	if (bytes < BYTES_PER_KB) {
		return `${bytes} B`;
	}
	if (bytes < BYTES_PER_MB) {
		return `${(bytes / BYTES_PER_KB).toFixed(2)} KB`;
	}
	if (bytes < BYTES_PER_GB) {
		return `${(bytes / BYTES_PER_MB).toFixed(2)} MB`;
	}
	return `${(bytes / BYTES_PER_GB).toFixed(2)} GB`;
};

export const fileStatsTool = tool({
	description: "Get detailed information about a file or directory",
	args: {
		path: tool.schema
			.string()
			.describe("Path to the file or directory to inspect"),
	},
	async execute(args) {
		try {
			const stats = await _getFileStats(args.path);
			const type = stats.isDirectory ? "Directory" : "File";

			return `${type}: ${args.path}
Size: ${_formatSize(stats.size)}
Created: ${stats.created.toISOString()}
Modified: ${stats.modified.toISOString()}
Permissions: ${stats.permissions}`;
		} catch (error) {
			return `Error: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
});
