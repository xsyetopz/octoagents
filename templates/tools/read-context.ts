import { join } from "node:path";
import { tool } from "@opencode-ai/plugin";

/**
 * read-context tool
 *
 * Reads a named context file from .opencode/context/.
 * Agents can call this to load specific project context sections on demand
 * rather than loading all context upfront.
 *
 * Usage: read-context with file "tech-stack" or "conventions"
 */
// biome-ignore lint/style/noDefaultExport: opencode discovers tools via default export
export default tool({
	description:
		"Read a project context file from .opencode/context/. " +
		"Available files: overview, tech-stack, conventions, structure, agent-notes",
	args: {
		file: tool.schema
			.string()
			.describe(
				"Context file name without extension (e.g. 'tech-stack', 'conventions')",
			),
	},
	async execute(args, context) {
		const contextDir = join(context.directory, ".opencode", "context");
		const filePath = join(contextDir, `${args.file}.md`);
		try {
			const content = await Bun.file(filePath).text();
			return content;
		} catch {
			const available = [
				"overview",
				"tech-stack",
				"conventions",
				"structure",
				"agent-notes",
			];
			throw new Error(
				`Context file "${args.file}" not found at ${filePath}.\n` +
					`Available files: ${available.join(", ")}`,
			);
		}
	},
});
