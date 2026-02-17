import { tool } from "@opencode-ai/plugin";

async function _checkDependency(toolName: string): Promise<undefined> {
	try {
		await Bun.$`which ${toolName}`.quiet();
	} catch {
		console.log(`Installing ${toolName}...`);
		await Bun.$`brew install ${toolName}`.quiet();
	}
	return undefined;
}

async function _executeToolName(
	_args: Record<string, unknown>,
	_context: Record<string, unknown>,
): Promise<Record<string, unknown>> {
	await _checkDependency("some-tool");
	return {};
}

export function createToolTemplate(
	_ctx: Record<string, unknown>,
): Record<string, unknown> {
	const toolName = "tool.name";
	return {
		tool: {
			[toolName]: {
				description: "[Clear description of what this tool does for the LLM]",
				args: {
					arg1: tool.schema.string().describe("Description of arg1"),
					arg2: tool.schema
						.number()
						.optional()
						.describe("Description of optional arg2"),
				},
				async execute(
					args: Record<string, unknown>,
					context: Record<string, unknown>,
				) {
					try {
						const result = await _executeToolName(args, context);
						return JSON.stringify(result, null, 2);
					} catch (error) {
						return `Error: ${error instanceof Error ? error.message : String(error)}`;
					}
				},
			},
		},
	};
}
