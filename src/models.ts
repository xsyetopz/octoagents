import type { ProviderAvailability } from "./types.ts";

export const MODELS = {
	BAILIAN_GLM_5: "bailian-coding-plan/glm-5",
	BAILIAN_KIMI_K2_5: "bailian-coding-plan/kimi-k2.5",
	BAILIAN_MINIMAX_M2_5: "bailian-coding-plan/MiniMax-M2.5",
	BAILIAN_QWEN3_5_PLUS: "bailian-coding-plan/qwen3.5-plus",
	COPILOT_GPT_5_MINI: "github-copilot/gpt-5-mini",
	OPENCODE_BIG_PICKLE: "opencode/big-pickle",
	OPENCODE_GPT_5_NANO: "opencode/gpt-5-nano",
	OPENCODE_TRINITY_LARGE_PREVIEW_FREE: "opencode/trinity-large-preview-free",
	OPENCODE_MINIMAX_M2_5_FREE: "opencode/minimax-m2.5-free",
} as const;

export type ModelId = (typeof MODELS)[keyof typeof MODELS];

export type AgentRole =
	| "build"
	| "plan"
	| "general"
	| "explore"
	| "review"
	| "implement"
	| "document"
	| "test";

interface ModelConfig {
	model: ModelId;
	temperature?: number;
	thinking?: boolean;
}

const BAILIAN_OPTIMAL: Record<AgentRole, ModelConfig> = {
	build: {
		model: MODELS.BAILIAN_QWEN3_5_PLUS, // NOTE: swap back to "KIMI_K2_5" when Alibaba fixes command invocation doom-loop
		temperature: 0.7,
		thinking: true,
	},
	plan: {
		model: MODELS.BAILIAN_MINIMAX_M2_5,
		temperature: 0.8,
		thinking: true,
	},
	implement: { model: MODELS.BAILIAN_GLM_5, temperature: 0.7, thinking: true },
	review: { model: MODELS.BAILIAN_GLM_5, temperature: 0.5, thinking: true },
	test: { model: MODELS.BAILIAN_GLM_5, temperature: 0.7, thinking: true },
	document: {
		model: MODELS.BAILIAN_QWEN3_5_PLUS, // NOTE: swap back to "KIMI_K2_5" when Alibaba fixes command invocation doom-loop
		temperature: 1.0,
		thinking: true,
	},
	explore: {
		model: MODELS.BAILIAN_QWEN3_5_PLUS,
		temperature: 0.8,
		thinking: true,
	},
	general: {
		model: MODELS.BAILIAN_MINIMAX_M2_5,
		temperature: 0.7,
		thinking: true,
	},
};

const COPILOT_FALLBACK: Record<AgentRole, ModelConfig> = {
	build: { model: MODELS.COPILOT_GPT_5_MINI, temperature: 0.7 },
	plan: { model: MODELS.COPILOT_GPT_5_MINI, temperature: 0.8 },
	general: { model: MODELS.COPILOT_GPT_5_MINI, temperature: 0.7 },
	explore: { model: MODELS.COPILOT_GPT_5_MINI, temperature: 0.8 },
	review: { model: MODELS.COPILOT_GPT_5_MINI, temperature: 0.7 },
	implement: { model: MODELS.COPILOT_GPT_5_MINI, temperature: 0.7 },
	document: { model: MODELS.COPILOT_GPT_5_MINI, temperature: 1.0 },
	test: { model: MODELS.COPILOT_GPT_5_MINI, temperature: 0.7 },
};

const FREE_FALLBACK: Record<AgentRole, ModelConfig> = {
	build: { model: MODELS.OPENCODE_BIG_PICKLE, temperature: 0.7 },
	plan: { model: MODELS.OPENCODE_TRINITY_LARGE_PREVIEW_FREE, temperature: 0.8 },
	general: { model: MODELS.OPENCODE_BIG_PICKLE, temperature: 0.7 },
	explore: {
		model: MODELS.OPENCODE_TRINITY_LARGE_PREVIEW_FREE,
		temperature: 0.8,
	},
	review: {
		model: MODELS.OPENCODE_TRINITY_LARGE_PREVIEW_FREE,
		temperature: 0.7,
	},
	implement: { model: MODELS.OPENCODE_BIG_PICKLE, temperature: 0.7 },
	document: {
		model: MODELS.OPENCODE_TRINITY_LARGE_PREVIEW_FREE,
		temperature: 1.0,
	},
	test: { model: MODELS.OPENCODE_TRINITY_LARGE_PREVIEW_FREE, temperature: 0.7 },
};

export interface ModelAssignment {
	model: ModelId;
	tier: "bailian" | "copilot" | "free";
	temperature?: number;
	thinking?: boolean;
}

function assignModelFromConfig(
	role: AgentRole,
	configMap: Record<AgentRole, ModelConfig>,
	tier: ModelAssignment["tier"],
): ModelAssignment {
	const config = configMap[role];
	const assignment: ModelAssignment = { model: config.model, tier };
	if (config.temperature !== undefined) {
		assignment.temperature = config.temperature;
	}
	if ("thinking" in config && config.thinking !== undefined) {
		assignment.thinking = config.thinking;
	}
	return assignment;
}

export function resolveModel(
	role: AgentRole,
	providers: ProviderAvailability,
): ModelAssignment {
	if (providers.bailianCodingPlan) {
		return assignModelFromConfig(role, BAILIAN_OPTIMAL, "bailian");
	}
	if (providers.githubCopilot) {
		return assignModelFromConfig(role, COPILOT_FALLBACK, "copilot");
	}
	return assignModelFromConfig(role, FREE_FALLBACK, "free");
}
