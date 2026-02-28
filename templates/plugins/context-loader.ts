import { join } from "node:path";
import type { Plugin } from "@opencode-ai/plugin";

export const ContextLoader: Plugin = ({ directory }) => {
	const contextDir = join(directory, ".opencode", "context");

	let cachedContext: string | undefined;

	async function loadContextFiles(): Promise<string> {
		if (cachedContext !== undefined) {
			return cachedContext;
		}
		const sections: string[] = [];
		let paths: string[] = [];
		try {
			const glob = new Bun.Glob("*.md");
			paths = await Array.fromAsync(
				glob.scan({ cwd: contextDir, absolute: true, onlyFiles: true }),
			);
		} catch (err) {
			sections.push(
				`[context-loader WARNING] Failed to read context directory: ${(err as Error).message ?? String(err)}`,
			);
		}

		if (paths.length > 0) {
			await Promise.all(
				paths.map(async (filePath) => {
					try {
						const content = await Bun.file(filePath).text();
						sections.push(content.trim());
					} catch (err) {
						sections.push(
							`[context-loader WARNING] Failed to read "${filePath}": ${(err as Error).message ?? String(err)}`,
						);
					}
				}),
			);
		} else if (sections.length === 0) {
			sections.push("[context-loader] No project context files found.");
		}

		cachedContext = sections.join("\n\n---\n\n");
		return cachedContext;
	}

	return Promise.resolve({
		"experimental.chat.system.transform": async (_input, output) => {
			try {
				const context = await loadContextFiles();
				if (context && context.trim().length > 0) {
					output.system.push(
						`<project-context>\n${context}\n</project-context>`,
					);
				} else {
					output.system.push(
						"<project-context>\n[context-loader: No context found]\n</project-context>",
					);
				}
			} catch (err) {
				output.system.push(
					`<project-context>\n[context-loader ERROR] ${(err as Error).message ?? String(err)}\n</project-context>`,
				);
			}
		},
	});
};
