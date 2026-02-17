export interface Model {
	provider: string;
	model: string;
}

export interface Preset {
	name: string;
	description: string;
	agents: string[];
	tools: string[];
	commands: string[];
}

export type PermissionValue = "allow" | "deny" | "ask";
export type PermissionPattern = Record<string, PermissionValue>;
export type PermissionRule = PermissionValue | PermissionPattern;

export interface AgentConfig {
	name: string;
	description: string;
	mode: "primary" | "subagent" | "all";
	primaryModel: Model;
	fallbackModel: Model;
	temperature: number;
	steps: number;
	color?: string;
	permission?: PermissionRule;
	subagents?: string[];
}

export interface ToolConfig {
	name: string;
	category: string;
	description: string;
	dependencies?: string[];
}

export interface OpenCodeAgentConfig {
	mode?: string;
	model?: string;
	temperature?: number;
	steps?: number;
	color?: string;
	permission?: PermissionRule;
	subagents?: Record<string, boolean>;
	disable?: boolean;
	description?: string;
	prompt?: string;
}

export interface OpenCodeConfig {
	$schema: string;
	model?: string;
	defaultAgent?: string;
	permission?: PermissionRule;
	subagents?: Record<string, boolean>;
	agent?: Record<string, OpenCodeAgentConfig>;
}
