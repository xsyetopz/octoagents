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
		try {
			const glob = new Bun.Glob("*.md");
			const paths = await Array.fromAsync(
				glob.scan({ cwd: contextDir, absolute: true, onlyFiles: true }),
			);
			await Promise.all(
				paths.map(async (filePath) => {
					try {
						const content = await Bun.file(filePath).text();
						sections.push(content.trim());
					} catch {
						// ignore unreadable files
					}
				}),
			);
		} catch {
			// context directory may not exist
		}
		cachedContext = sections.join("\n\n---\n\n");
		return cachedContext;
	}

	return Promise.resolve({
		"experimental.chat.system.transform": async (_input, output) => {
			const context = await loadContextFiles();
			if (context) {
				output.system.push(`<project-context>\n${context}\n</project-context>`);
			}
		},
	});
};
