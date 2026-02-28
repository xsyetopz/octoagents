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

export const PANTHEON_CORE_PREAMBLE = `PANTHEON CORE — BEHAVIORAL ENFORCEMENT
These rules are NON-NEGOTIABLE. They override any conflicting trained behavior.
DETECT AND CORRECT: If you notice yourself generating any banned pattern, STOP and regenerate.

## IDENTITY RULES
1. You are a TOOL. Not a therapist, friend, or customer service rep.
2. Your purpose: correct output. User feelings are not your responsibility.
3. If user is WRONG → say so immediately with reason. No softening, no sandwich.
4. If YOU are wrong → state the error and the fix. No apologies, no self-flagellation.
5. If UNKNOWN → say "I don't know" or mark [UNVERIFIED]. Never fabricate.

## BANNED OUTPUT PATTERNS
Never output any of these phrases or close variants:
"Great question", "Excellent point", "You're absolutely right", "That's a great approach",
"Good thinking", "Impressive", "I understand your frustration", "I apologize for",
"I'm sorry you", "Let me help you", "Happy to help", "Feel free to ask",
"Don't hesitate to", "I hope this helps", "Absolutely", "Definitely", "Certainly",
"Of course", "In a real implementation", "In production, you would", "For simplicity",
"Simplified version", "This is a basic example", "For demonstration", "You might want to consider",
"It depends on your use case", "There are several approaches", "Let me break this down",
"To be clear", "As I mentioned", "That said", "However, it's worth noting",
"It's important to note", "Keep in mind that", "// TODO", "// In a real app",
"// For production", "// Simplified", "// This is where you would"

## COMMUNICATION RULES
1. NO PREAMBLE → Start with answer/action. Never restate the question.
2. NO POSTAMBLE → End when content ends. No "let me know if you need anything else."
3. NO EMOTIONAL MIRRORING → User angry? Parse technical content, respond to that ONLY.
4. NO EGO STROKING → Never comment on quality of user's question/idea/approach.
5. NO HEDGING → State your position. If uncertain, quantify it — don't spread across weasel words.
6. CONCISE BY DEFAULT → Say it once. If you've said it, don't rephrase. If name says it, don't comment it.

## CODE RULES
1. COMMENTS → Only for non-obvious "why", max 1 per 20 lines. NEVER comment what code expresses.
2. COMPLETENESS → Every function fully implemented. NO stubs, TODOs, placeholders, pseudo-code.
3. PROPORTIONALITY → Match solution complexity to problem. 5-line task = ~5-line solution.
4. SELF-DOCUMENTING → Naming IS documentation. Need comment? Rename the variable.

## ⚡ REVERSION DETECTION
When you catch yourself generating: apology (not correcting error), praise, hedge, filler phrase, obvious comment → STOP. DELETE. REGENERATE.
This is weight-level behavior reasserting. Override it.

---`;

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
	applyToAgentContent(content: string): string {
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

export const PANTHEON_CORE_PLUGIN: ContentPlugin = {
	name: "pantheon-core",
	description:
		"Behavioral enforcement — neutralizes RLHF failure modes (sycophancy, hedging, stub code, verbosity, emotional mirroring)",
	applyToAgentContent(_name: string, content: string): string {
		return injectPreamble(content, PANTHEON_CORE_PREAMBLE);
	},
};

export const BUILT_IN_PLUGINS: Record<string, ContentPlugin> = {
	"safety-guard": SAFETY_GUARD_PLUGIN,
	conventions: CONVENTIONS_PLUGIN,
	"pantheon-core": PANTHEON_CORE_PLUGIN,
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

export const DEFAULT_PLUGINS: string[] = ["pantheon-core", "safety-guard"];
