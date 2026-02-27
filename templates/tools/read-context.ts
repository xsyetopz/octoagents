import { join } from "node:path";
import { tool } from "@opencode-ai/plugin";

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
