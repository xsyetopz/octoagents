import { join } from "node:path";
import {
	SHARED_BASH_ALLOWLIST_COMMANDS,
	SHARED_BASH_DENYLIST_COMMANDS,
} from "../config/agent-permissions.ts";
import type { AgentConfig } from "../types/index.ts";
import { readTextFile } from "../utils/files.ts";

const DEFAULT_BASH_INDENT = "    ";

type BashAction = "allow" | "deny";

function _formatBashRules(
	commands: readonly string[],
	indent: string,
	action: BashAction,
): string {
	return commands
		.map((command) => `${indent}"${command}": "${action}"`)
		.join("\n");
}

export async function generateAgentMarkdown(
	agent: AgentConfig,
	resolvedModel: string,
	installerDir: string,
): Promise<string> {
	const templatePath = join(installerDir, `templates/agents/${agent.name}.md`);
	const template = await readTextFile(templatePath);
	const bashAllowlist = _formatBashRules(
		SHARED_BASH_ALLOWLIST_COMMANDS,
		DEFAULT_BASH_INDENT,
		"allow",
	);
	const bashDenylist = _formatBashRules(
		SHARED_BASH_DENYLIST_COMMANDS,
		DEFAULT_BASH_INDENT,
		"deny",
	);

	let result = template
		.replace(/{{description}}/g, agent.description)
		.replace(/{{mode}}/g, agent.mode)
		.replace(/{{model}}/g, resolvedModel)
		.replace(/{{temperature}}/g, agent.temperature?.toString() ?? "")
		.replace(/{{steps}}/g, agent.steps.toString())
		.replace(/{{color}}/g, agent.color ?? "success")
		.replace(/^[ \t]*{{bash_denylist}}[ \t]*$/gm, bashDenylist)
		.replace(/^[ \t]*{{bash_allowlist}}[ \t]*$/gm, bashAllowlist);

	if (agent.top_p !== undefined) {
		result = result.replace(/{{top_p}}/g, agent.top_p.toString());
	} else {
		result = result.replace(/^[ \t]*top_p:[ \t]*{{top_p}}[ \t]*$/gm, "");
	}

	return result;
}
