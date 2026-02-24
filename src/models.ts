import type { ProviderAvailability } from "./types.ts";

export const MODELS = {
	DEEPSEEK: "synthetic/hf:deepseek-ai/DeepSeek-V3.2",
	MINIMAX: "synthetic/hf:MiniMaxAI/MiniMax-M2.1",
	KIMI: "synthetic/hf:nvidia/Kimi-K2.5-NVFP4",
	QWEN: "synthetic/hf:Qwen/Qwen3.5-397B-A17B",
	GLM: "synthetic/hf:zai-org/GLM-4.7",
	COPILOT_MINI: "github-copilot/gpt-5-mini",
	FREE_BIG_PICKLE: "opencode/big-pickle",
	FREE_GPT5_NANO: "opencode/gpt-5-nano",
	FREE_TRINITY: "opencode/trinity-large-preview-free",
} as const;

export type ModelId = (typeof MODELS)[keyof typeof MODELS];

export type AgentRole =
	| "build"
	| "plan"
	| "general"
	| "explore"
	| "compaction"
	| "summary"
	| "title"
	| "review"
	| "implement"
	| "document"
	| "test";

const HOUSEKEEPING_ROLES: AgentRole[] = ["compaction", "summary", "title"];

/**
 * Optimal model when Synthetic is available.
 * Assigned per spec §Agent Architecture table, based on agent need.
 */
const OPTIMAL_SYNTHETIC: Record<AgentRole, ModelId> = {
	build: MODELS.KIMI, // Best coding benchmark scores, complete implementations
	plan: MODELS.DEEPSEEK, // Best reasoning, thinking-in-tools
	general: MODELS.QWEN, // Strong all-rounder, 262K context
	explore: MODELS.GLM, // Strong code understanding, cost-efficient
	compaction: MODELS.FREE_TRINITY, // Housekeeping — always free
	summary: MODELS.FREE_GPT5_NANO, // Housekeeping — always free
	title: MODELS.FREE_GPT5_NANO, // Housekeeping — always free
	review: MODELS.DEEPSEEK, // Best reasoning for analysis
	implement: MODELS.KIMI, // Strong SWE-bench, complete code, no skipping
	document: MODELS.GLM, // Strong coding/generation, interleaved thinking
	test: MODELS.GLM, // Strong coding/agentic, good tool calling
};

/**
 * Fallback when neither Synthetic nor Copilot is available.
 * Free OpenCode built-in models, matched to agent capability needs.
 */
const FREE_FALLBACK: Record<AgentRole, ModelId> = {
	build: MODELS.FREE_BIG_PICKLE,
	plan: MODELS.FREE_TRINITY,
	general: MODELS.FREE_BIG_PICKLE,
	explore: MODELS.FREE_TRINITY,
	compaction: MODELS.FREE_TRINITY,
	summary: MODELS.FREE_GPT5_NANO,
	title: MODELS.FREE_GPT5_NANO,
	review: MODELS.FREE_TRINITY,
	implement: MODELS.FREE_BIG_PICKLE,
	document: MODELS.FREE_TRINITY,
	test: MODELS.FREE_TRINITY,
};

export interface ModelAssignment {
	model: ModelId;
	tier: "synthetic" | "copilot" | "free";
}

/**
 * Resolve model assignment for a role given available providers.
 * Fallback chain: synthetic → github-copilot → free (per spec §Fallback Chain)
 */
export function resolveModel(
	role: AgentRole,
	providers: ProviderAvailability,
): ModelAssignment {
	if (HOUSEKEEPING_ROLES.includes(role)) {
		return { model: OPTIMAL_SYNTHETIC[role], tier: "free" };
	}
	if (providers.synthetic) {
		return { model: OPTIMAL_SYNTHETIC[role], tier: "synthetic" };
	}
	if (providers.githubCopilot) {
		return { model: MODELS.COPILOT_MINI, tier: "copilot" };
	}
	return { model: FREE_FALLBACK[role], tier: "free" };
}
