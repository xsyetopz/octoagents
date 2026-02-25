import type { ProviderAvailability } from "./types.ts";

export const MODELS = {
	// CHUTES models (primary)
	CHUTES_GLM5: "chutes/zai-org/GLM-5-TEE",
	CHUTES_GLM47_FLASH: "chutes/zai-org/GLM-4.7-Flash",
	CHUTES_QWEN3_VL: "chutes/Qwen/Qwen3-VL-235B-A22B-Instruct",
	CHUTES_QWEN35: "chutes/Qwen/Qwen3.5-397B-A17B-TEE",
	CHUTES_QWEN3_CODER: "chutes/Qwen/Qwen3-Coder-Next",
	CHUTES_HERMES: "chutes/NousResearch/Hermes-4-405B-FP8-TEE",
	CHUTES_KIMI: "chutes/moonshotai/Kimi-K2.5-TEE",
	CHUTES_DEEPSEEK: "chutes/deepseek-ai/DeepSeek-V3.2-TEE",
	CHUTES_MINIMAX: "chutes/MiniMaxAI/MiniMax-M2.5-TEE",
	// Legacy (deprecated)
	COPILOT_MINI: "github-copilot/gpt-5-mini",
	// Free OpenCode models (fallback)
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
 * Optimal model when CHUTES is available.
 * Assigned per recommendations for agentic coding workflows on Chutes AI.
 */
const OPTIMAL_CHUTES: Record<AgentRole, ModelId> = {
	build: MODELS.CHUTES_QWEN3_CODER, // Core agentic coding - SWE-Bench leader
	plan: MODELS.CHUTES_DEEPSEEK, // Systems-level engineering, long-horizon planning
	general: MODELS.CHUTES_QWEN35, // Strong all-rounder, vision+reasoning
	explore: MODELS.CHUTES_GLM5, // Code understanding, cost-efficient
	compaction: MODELS.FREE_TRINITY, // Housekeeping — always free
	summary: MODELS.FREE_GPT5_NANO, // Housekeeping — always free
	title: MODELS.FREE_GPT5_NANO, // Housekeeping — always free
	review: MODELS.CHUTES_GLM5, // Best reasoning for analysis
	implement: MODELS.CHUTES_QWEN3_CODER, // Strong SWE-bench, complete code
	document: MODELS.CHUTES_GLM47_FLASH, // Fast interactive, coding/generation
	test: MODELS.CHUTES_MINIMAX, // Strong coding/agentic, swarm coordination
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
	tier: "chutes" | "copilot" | "free";
}

/**
 * Resolve model assignment for a role given available providers.
 * Fallback chain: chutes → github-copilot → free (per spec §Fallback Chain)
 */
export function resolveModel(
	role: AgentRole,
	providers: ProviderAvailability,
): ModelAssignment {
	if (HOUSEKEEPING_ROLES.includes(role)) {
		return { model: OPTIMAL_CHUTES[role], tier: "free" };
	}
	if (providers.chutes) {
		return { model: OPTIMAL_CHUTES[role], tier: "chutes" };
	}
	if (providers.githubCopilot) {
		return { model: MODELS.COPILOT_MINI, tier: "copilot" };
	}
	return { model: FREE_FALLBACK[role], tier: "free" };
}
