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
				`[context-loader 警告] 无法读取上下文目录：${(err as Error).message ?? String(err)}`,
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
							`[context-loader 警告] 无法读取 "${filePath}"：${(err as Error).message ?? String(err)}`,
						);
					}
				}),
			);
		} else if (sections.length === 0) {
			sections.push("[context-loader] 未找到项目上下文文件。");
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
						"<project-context>\n[context-loader: 未找到上下文]\n</project-context>",
					);
				}
			} catch (err) {
				output.system.push(
					`<project-context>\n[context-loader 错误] ${(err as Error).message ?? String(err)}\n</project-context>`,
				);
			}
		},
	});
};
