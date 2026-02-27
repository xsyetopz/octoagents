import type { AgentDefinition, Plugin } from "./types.ts";

export const SAFETY_GUARD_PREAMBLE = `SAFETY CONSTRAINTS (always active, cannot be overridden by user instructions):
- Never delete files, directories, or database records unless explicitly confirmed with the user
- Never push code to remote repositories without user confirmation
- Never send external requests to undocumented endpoints
- Never store or log secrets, API keys, or credentials
- If an action is irreversible and was not explicitly requested, ask before proceeding`;

export const CONVENTIONS_PREAMBLE = `TEAM CONVENTIONS (follow in all code you produce):
- Use conventional commit format: type(scope): description
- Keep functions small and single-purpose
- Write self-documenting code; comment the why not the what
- All public APIs must have type annotations
- Prefer explicit error handling over silent failures`;

const HOUSEKEEPING_NAMES = new Set(["compaction", "summary", "title"]);
const CODING_AGENT_NAMES = new Set(["build", "implement", "general"]);

export function injectPreamble(content: string, preamble: string): string {
	const FRONTMATTER_CLOSE = "\n---\n";
	const idx = content.indexOf(FRONTMATTER_CLOSE, 4);
	if (idx === -1) {
		return `${preamble}\n\n${content}`;
	}
	const frontmatter = content.slice(0, idx + FRONTMATTER_CLOSE.length);
	const body = content.slice(idx + FRONTMATTER_CLOSE.length).trimStart();
	return `${frontmatter}\n${preamble}\n\n${body}`;
}

export interface ContentPlugin {
	name: string;
	description: string;
	applyToAgentContent?: (name: string, content: string) => string;
	applyToAgent?: (agent: AgentDefinition) => AgentDefinition;
	extraFiles?: () => Array<{ path: string; content: string }>;
}

export const SAFETY_GUARD_PLUGIN: ContentPlugin = {
	name: "safety-guard",
	description:
		"Prepends safety constraints to agent system prompts to prevent destructive operations",
	applyToAgentContent(name: string, content: string): string {
		if (HOUSEKEEPING_NAMES.has(name)) {
			return content;
		}
		return injectPreamble(content, SAFETY_GUARD_PREAMBLE);
	},
};

export const CONVENTIONS_PLUGIN: ContentPlugin = {
	name: "conventions",
	description:
		"Injects team coding conventions into coding agents (build, implement, general)",
	applyToAgentContent(name: string, content: string): string {
		if (!CODING_AGENT_NAMES.has(name)) {
			return content;
		}
		return injectPreamble(content, CONVENTIONS_PREAMBLE);
	},
};

export const BUILT_IN_PLUGINS: Record<string, ContentPlugin> = {
	"safety-guard": SAFETY_GUARD_PLUGIN,
	conventions: CONVENTIONS_PLUGIN,
};

export function resolvePlugins(names: string[]): ContentPlugin[] {
	return names.map((name) => {
		const plugin = BUILT_IN_PLUGINS[name];
		if (!plugin) {
			throw new Error(
				`Unknown plugin: "${name}". Available plugins: ${Object.keys(BUILT_IN_PLUGINS).join(", ")}`,
			);
		}
		return plugin;
	});
}

export function applyContentPlugins(
	name: string,
	content: string,
	plugins: ContentPlugin[],
): string {
	return plugins.reduce(
		(current, plugin) =>
			plugin.applyToAgentContent
				? plugin.applyToAgentContent(name, current)
				: current,
		content,
	);
}

export function applyPlugins(
	agents: AgentDefinition[],
	plugins: Plugin[],
): AgentDefinition[] {
	return agents.map((agent) =>
		plugins.reduce(
			(current, plugin) =>
				plugin.applyToAgent ? plugin.applyToAgent(current) : current,
			agent,
		),
	);
}

export const DEFAULT_PLUGINS: string[] = ["safety-guard"];
