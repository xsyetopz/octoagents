import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { Plugin } from "@opencode-ai/plugin";

/**
 * session-logger plugin
 *
 * Logs session events (compaction, tool use) to `.opencode/logs/`.
 * Useful for auditing agent behavior and debugging.
 */
export const SessionLogger: Plugin = ({ directory }) => {
	const logsDir = join(directory, ".opencode", "logs");

	async function log(event: string, detail: string): Promise<void> {
		const timestamp = new Date().toISOString();
		const entry = `${timestamp} [${event}] ${detail}\n`;
		const logFile = join(
			logsDir,
			`session-${new Date().toISOString().slice(0, 10)}.log`,
		);
		try {
			await mkdir(logsDir, { recursive: true });
			await appendFile(logFile, entry);
		} catch {
			// ignore logging errors
		}
	}

	return Promise.resolve({
		"experimental.session.compacting": async (input, _output) => {
			await log("session.compacting", `id=${input.sessionID}`);
		},

		"tool.execute.after": async (input, _output) => {
			const detail = `tool=${input.tool} session=${input.sessionID}`;
			await log("tool.execute", detail);
		},
	});
};
