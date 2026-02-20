type AgentMode = "primary" | "subagent" | "all";

export interface AgentConfig {
	name: string;
	description: string;
	mode: AgentMode;
	model: string;
	temperature: number;
	top_p?: number;
	steps: number;
	color: string;
}

function _createAgent(
	name: string,
	description: string,
	model: string,
	temperature: number,
	steps: number,
	color: string,
	options?: { top_p?: number; mode?: AgentMode },
): AgentConfig {
	return {
		name,
		description,
		mode: options?.mode ?? "subagent",
		model,
		temperature,
		...(options?.top_p !== undefined && { top_p: options.top_p }),
		steps,
		color,
	};
}

const DEEPSEEK_AI_DEEPSEEK_V3_2 = "synthetic/hf:deepseek-ai/DeepSeek-V3.2";
const NVIDIA_KIMI_K2_5_NVFP4 = "synthetic/hf:nvidia/Kimi-K2.5-NVFP4";

export const AGENTS: AgentConfig[] = [
	_createAgent(
		"orchestrate",
		"Coordinates work by delegating to specialized agents",
		NVIDIA_KIMI_K2_5_NVFP4,
		0.3,
		20,
		"#0d6efd",
		{ mode: "primary" },
	),
	_createAgent(
		"build",
		"Write new features and implementations",
		DEEPSEEK_AI_DEEPSEEK_V3_2,
		0.2,
		8,
		"#198754",
		{ top_p: 0.9 },
	),
	_createAgent(
		"review",
		"Code review, security analysis, quality checks",
		"opencode/glm-5-free",
		0.1,
		6,
		"#ffc107",
		{ top_p: 0.85 },
	),
	_createAgent(
		"test",
		"Write and run tests",
		DEEPSEEK_AI_DEEPSEEK_V3_2,
		0.2,
		7,
		"#0dcaf0",
		{ top_p: 0.8 },
	),
	_createAgent(
		"explore",
		"Navigate and understand codebase structure",
		NVIDIA_KIMI_K2_5_NVFP4,
		0.3,
		6,
		"#6c757d",
	),
	_createAgent(
		"implement",
		"Complex multi-file features with verification",
		DEEPSEEK_AI_DEEPSEEK_V3_2,
		0.3,
		10,
		"#6610f2",
	),
	_createAgent(
		"debug",
		"Find and fix bugs",
		DEEPSEEK_AI_DEEPSEEK_V3_2,
		0.1,
		8,
		"#dc3545",
	),
	_createAgent(
		"refactor",
		"Restructure and improve existing code",
		NVIDIA_KIMI_K2_5_NVFP4,
		0.2,
		8,
		"#fd7e14",
	),
	_createAgent(
		"document",
		"Write documentation and explanatory content",
		"synthetic/hf:MiniMaxAI/MiniMax-M2.1",
		0.35,
		6,
		"#20c997",
	),
	_createAgent(
		"audit",
		"Deep security audits and vulnerability analysis",
		NVIDIA_KIMI_K2_5_NVFP4,
		0.1,
		8,
		"#6f42c1",
		{ top_p: 0.75 },
	),
	_createAgent(
		"research",
		"Web searches and external documentation lookup",
		DEEPSEEK_AI_DEEPSEEK_V3_2,
		0.4,
		6,
		"#0dcaf0",
	),
];
