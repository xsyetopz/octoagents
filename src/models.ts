import type { ProviderAvailability } from "./types.ts";

export const MODELS = {
	BAILIAN_GLM5: "bailian-coding-plan/glm-5",
	BAILIAN_GLM47: "bailian-coding-plan/glm-4.7",
	BAILIAN_KIMI_K25: "bailian-coding-plan/kimi-k2.5",
	BAILIAN_MINIMAX: "bailian-coding-plan/MiniMax-M2.5",
	BAILIAN_QWEN35_PLUS: "bailian-coding-plan/qwen3.5-plus",
	BAILIAN_QWEN3_CODER_NEXT: "bailian-coding-plan/qwen3-coder-next",
	BAILIAN_QWEN3_CODER_PLUS: "bailian-coding-plan/qwen3-coder-plus",
	BAILIAN_QWEN3_MAX: "bailian-coding-plan/qwen3-max-2026-01-23",
	COPILOT_GPT5_MINI: "github-copilot/gpt-5-mini",
	FREE_BIG_PICKLE: "opencode/big-pickle",
	FREE_GPT5_NANO: "opencode/gpt-5-nano",
	FREE_TRINITY: "opencode/trinity-large-preview-free",
	FREE_MINIMAX: "opencode/minimax-m2.5-free",
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
	build: { model: MODELS.BAILIAN_KIMI_K25, temperature: 0.7, thinking: true },
	plan: { model: MODELS.BAILIAN_MINIMAX, temperature: 0.8, thinking: true },
	implement: { model: MODELS.BAILIAN_GLM5, temperature: 0.7, thinking: true },
	review: { model: MODELS.BAILIAN_GLM5, temperature: 0.5, thinking: true },
	test: { model: MODELS.BAILIAN_GLM5, temperature: 0.7, thinking: true },
	document: {
		model: MODELS.BAILIAN_KIMI_K25,
		temperature: 1.0,
		thinking: true,
	},
	explore: {
		model: MODELS.BAILIAN_QWEN35_PLUS,
		temperature: 0.8,
		thinking: true,
	},
	general: { model: MODELS.BAILIAN_MINIMAX, temperature: 0.7, thinking: true },
};

const COPILOT_FALLBACK: Record<AgentRole, ModelConfig> = {
	build: { model: MODELS.COPILOT_GPT5_MINI, temperature: 0.7 },
	plan: { model: MODELS.COPILOT_GPT5_MINI, temperature: 0.8 },
	general: { model: MODELS.COPILOT_GPT5_MINI, temperature: 0.7 },
	explore: { model: MODELS.COPILOT_GPT5_MINI, temperature: 0.8 },
	review: { model: MODELS.COPILOT_GPT5_MINI, temperature: 0.7 },
	implement: { model: MODELS.COPILOT_GPT5_MINI, temperature: 0.7 },
	document: { model: MODELS.COPILOT_GPT5_MINI, temperature: 1.0 },
	test: { model: MODELS.COPILOT_GPT5_MINI, temperature: 0.7 },
};

const FREE_FALLBACK: Record<AgentRole, ModelConfig> = {
	build: { model: MODELS.FREE_BIG_PICKLE, temperature: 0.7 },
	plan: { model: MODELS.FREE_TRINITY, temperature: 0.8 },
	general: { model: MODELS.FREE_BIG_PICKLE, temperature: 0.7 },
	explore: { model: MODELS.FREE_TRINITY, temperature: 0.8 },
	review: { model: MODELS.FREE_TRINITY, temperature: 0.7 },
	implement: { model: MODELS.FREE_BIG_PICKLE, temperature: 0.7 },
	document: { model: MODELS.FREE_TRINITY, temperature: 1.0 },
	test: { model: MODELS.FREE_TRINITY, temperature: 0.7 },
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
