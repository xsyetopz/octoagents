type AgentMode = "primary" | "subagent" | "all";

export interface AgentConfig {
	name: string;
	description: string;
	mode: AgentMode;
	model: string;
	temperature?: number;
	top_p?: number;
	steps: number;
	color: string;
}

function _createAgent(
	name: string,
	description: string,
	model: string,
	steps: number,
	color: string,
	temperature?: number,
	options?: { top_p?: number; mode?: AgentMode },
): AgentConfig {
	const agent: AgentConfig = {
		name,
		description,
		mode: options?.mode ?? "subagent",
		model,
		steps,
		color,
	};

	if (temperature !== undefined) {
		agent.temperature = temperature;
	}
	if (options?.top_p !== undefined) {
		agent.top_p = options.top_p;
	}

	return agent;
}

const DEEPSEEK_AI_DEEPSEEK_V3_2 = "synthetic/hf:deepseek-ai/DeepSeek-V3.2";
const NVIDIA_KIMI_K2_5_NVFP4 = "synthetic/hf:nvidia/Kimi-K2.5-NVFP4";
const OPENCODE_GLM_5_FREE = "opencode/glm-5-free";
const GITHUB_COPILOT_GPT_5_MINI = "github-copilot/gpt-5-mini";

export const AGENTS: AgentConfig[] = [
	_createAgent(
		"orchestrate",
		"Coordinates work by delegating to specialized agents",
		NVIDIA_KIMI_K2_5_NVFP4,
		30,
		"#0d6efd",
		0.6,
		{ mode: "primary", top_p: 0.95 },
	),
	_createAgent(
		"build",
		"Write new features and implementations",
		DEEPSEEK_AI_DEEPSEEK_V3_2,
		18,
		"#198754",
	),
	_createAgent(
		"review",
		"Code review, security analysis, quality checks",
		OPENCODE_GLM_5_FREE,
		16,
		"#ffc107",
		0.7,
		{ top_p: 1.0 },
	),
	_createAgent(
		"test",
		"Write and run tests",
		DEEPSEEK_AI_DEEPSEEK_V3_2,
		17,
		"#0dcaf0",
	),
	_createAgent(
		"explore",
		"Navigate and understand codebase structure",
		NVIDIA_KIMI_K2_5_NVFP4,
		16,
		"#6c757d",
		0.6,
		{ top_p: 0.95 },
	),
	_createAgent(
		"implement",
		"Complex multi-file features with verification",
		DEEPSEEK_AI_DEEPSEEK_V3_2,
		20,
		"#6610f2",
	),
	_createAgent(
		"debug",
		"Find and fix bugs",
		DEEPSEEK_AI_DEEPSEEK_V3_2,
		18,
		"#dc3545",
	),
	_createAgent(
		"refactor",
		"Restructure and improve existing code",
		NVIDIA_KIMI_K2_5_NVFP4,
		18,
		"#fd7e14",
		0.6,
		{ top_p: 0.95 },
	),
	_createAgent(
		"document",
		"Write documentation and explanatory content",
		"synthetic/hf:MiniMaxAI/MiniMax-M2.1",
		16,
		"#20c997",
		0.35,
	),
	_createAgent(
		"audit",
		"Deep security audits and vulnerability analysis",
		OPENCODE_GLM_5_FREE,
		18,
		"#6f42c1",
		0.7,
		{ top_p: 1.0 },
	),
	_createAgent(
		"research",
		"Investigate new technologies and approaches",
		DEEPSEEK_AI_DEEPSEEK_V3_2,
		16,
		"#0dcaf0",
	),
	_createAgent(
		"plan",
		"High-level task decomposition and strategy",
		NVIDIA_KIMI_K2_5_NVFP4,
		25,
		"#e83e8c",
		0.6,
		{ mode: "primary", top_p: 0.95 },
	),
	_createAgent(
		"title",
		"Generate concise commit messages and PR titles",
		GITHUB_COPILOT_GPT_5_MINI,
		5,
		"#20c997",
		0.3,
		{ mode: "primary" },
	),
	_createAgent(
		"summary",
		"Summarize code changes and PR descriptions",
		GITHUB_COPILOT_GPT_5_MINI,
		5,
		"#6c757d",
		0.1,
		{ mode: "primary" },
	),
];
