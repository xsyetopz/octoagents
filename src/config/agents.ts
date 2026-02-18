import type { AgentConfig } from "../types/index.ts";

export const ORCHESTRATOR: AgentConfig = {
	name: "orchestrator",
	description: "Primary orchestrator that delegates to specialist agents",
	mode: "primary",
	primaryModel: {
		provider: "synthetic",
		model: "hf:moonshotai/Kimi-K2.5",
	},
	fallbackModel: {
		provider: "opencode",
		model: "kimi-k2.5-free",
	},
	temperature: 0.3,
	steps: 50,
	color: "#0d6efd",
	subagents: [
		"coder",
		"reviewer",
		"tester",
		"explorer",
		"researcher",
		"implementer",
		"planner",
		"documenter",
		"auditor",
	],
};

export const CODER: AgentConfig = {
	name: "coder",
	description: "Specialized in writing, modifying, and refactoring code",
	mode: "subagent",
	primaryModel: {
		provider: "synthetic",
		model: "hf:Qwen/Qwen2.5-Coder-32B-Instruct",
	},
	fallbackModel: {
		provider: "opencode",
		model: "big-pickle",
	},
	temperature: 0.2,
	steps: 30,
	color: "#198754",
};

export const REVIEWER: AgentConfig = {
	name: "reviewer",
	description:
		"Specialized in code review, security analysis, and quality assessment",
	mode: "subagent",
	primaryModel: {
		provider: "synthetic",
		model: "hf:zai-org/GLM-4.7",
	},
	fallbackModel: {
		provider: "opencode",
		model: "big-pickle",
	},
	temperature: 0.1,
	steps: 20,
	color: "#ffc107",
};

export const TESTER: AgentConfig = {
	name: "tester",
	description: "Specialized in writing, running, and analyzing tests",
	mode: "subagent",
	primaryModel: {
		provider: "synthetic",
		model: "hf:meta-llama/Llama-3.3-70B-Instruct",
	},
	fallbackModel: {
		provider: "opencode",
		model: "big-pickle",
	},
	temperature: 0.2,
	steps: 25,
	color: "#0dcaf0",
};

export const EXPLORER: AgentConfig = {
	name: "explorer",
	description: "Fast, read-only codebase exploration and analysis",
	mode: "subagent",
	primaryModel: {
		provider: "synthetic",
		model: "hf:MiniMaxAI/MiniMax-M2.5",
	},
	fallbackModel: {
		provider: "opencode",
		model: "minimax-m2.5-free",
	},
	temperature: 0.3,
	steps: 20,
	color: "#198754",
};

export const RESEARCHER: AgentConfig = {
	name: "researcher",
	description: "Fast, parallel spammable researcher for information gathering",
	mode: "subagent",
	primaryModel: {
		provider: "synthetic",
		model: "hf:MiniMaxAI/MiniMax-M2.5",
	},
	fallbackModel: {
		provider: "opencode",
		model: "minimax-m2.5-free",
	},
	temperature: 0.4,
	steps: 20,
	color: "#198754",
};

export const IMPLEMENTER: AgentConfig = {
	name: "implementer",
	description: "Implementation specialist with reliable tool calls",
	mode: "subagent",
	primaryModel: {
		provider: "synthetic",
		model: "hf:Qwen/Qwen2.5-Coder-32B-Instruct",
	},
	fallbackModel: {
		provider: "opencode",
		model: "big-pickle",
	},
	temperature: 0.2,
	steps: 30,
	color: "#198754",
};

export const PLANNER: AgentConfig = {
	name: "planner",
	description: "Architecture design and technical planning specialist",
	mode: "subagent",
	primaryModel: {
		provider: "synthetic",
		model: "hf:deepseek-ai/DeepSeek-V3.2",
	},
	fallbackModel: {
		provider: "opencode",
		model: "gpt-5-nano",
	},
	temperature: 0.5,
	steps: 25,
	color: "#0d6efd",
};

export const DOCUMENTER: AgentConfig = {
	name: "documenter",
	description: "Documentation and comments specialist",
	mode: "subagent",
	primaryModel: {
		provider: "synthetic",
		model: "hf:moonshotai/Kimi-K2.5",
	},
	fallbackModel: {
		provider: "opencode",
		model: "kimi-k2.5-free",
	},
	temperature: 0.4,
	steps: 20,
	color: "#0dcaf0",
};

export const AUDITOR: AgentConfig = {
	name: "auditor",
	description: "Thorough security audit and vulnerability specialist",
	mode: "subagent",
	primaryModel: {
		provider: "synthetic",
		model: "hf:zai-org/GLM-4.7",
	},
	fallbackModel: {
		provider: "opencode",
		model: "big-pickle",
	},
	temperature: 0.1,
	steps: 20,
	color: "#dc3545",
};

export const AGENTS: AgentConfig[] = [
	ORCHESTRATOR,
	CODER,
	REVIEWER,
	TESTER,
	EXPLORER,
	RESEARCHER,
	IMPLEMENTER,
	PLANNER,
	DOCUMENTER,
	AUDITOR,
];
