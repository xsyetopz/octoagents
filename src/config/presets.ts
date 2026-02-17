import type { Preset } from "../types/index.ts";

const AVAILABLE_TOOLS = [
	"code-analysis",
	"development-utilities",
	"external-integration",
	"project-intelligence",
	"security-scanning",
	"web-search",
	"workflow-automation",
];

const AVAILABLE_COMMANDS = [
	"add-documentation",
	"add-feature",
	"assist-migration",
	"audit-security",
	"cleanup-code",
	"create-api-endpoint",
	"fix-bug",
	"generate-api-docs",
	"measure-test-coverage",
	"optimize-performance",
	"refactor-code",
	"review-code",
	"update-readme",
];

export const PRESET_FULL: Preset = {
	name: "full",
	description: "Full framework with everything - jack of all trades",
	agents: [
		"auditor",
		"coder",
		"documenter",
		"explorer",
		"implementer",
		"orchestrator",
		"planner",
		"researcher",
		"reviewer",
		"tester",
	],
	tools: AVAILABLE_TOOLS,
	commands: AVAILABLE_COMMANDS,
};

export const PRESET_STOCK: Preset = {
	name: "stock",
	description: "Recommended for most users - balanced feature set",
	agents: [
		"coder",
		"documenter",
		"explorer",
		"orchestrator",
		"planner",
		"reviewer",
		"tester",
	],
	tools: [
		"code-analysis",
		"project-intelligence",
		"security-scanning",
		"web-search",
		"workflow-automation",
	],
	commands: [
		"add-documentation",
		"add-feature",
		"audit-security",
		"fix-bug",
		"measure-test-coverage",
		"review-code",
	],
};

export const PRESET_MICRO: Preset = {
	name: "micro",
	description: "Speed-optimized for fast execution",
	agents: ["coder", "explorer", "orchestrator", "researcher"],
	tools: [
		"code-analysis",
		"project-intelligence",
		"web-search",
		"workflow-automation",
	],
	commands: [
		"add-documentation",
		"add-feature",
		"fix-bug",
		"measure-test-coverage",
		"review-code",
	],
};

export const PRESET_MINI: Preset = {
	name: "mini",
	description: "Balanced default for everyday use",
	agents: ["coder", "explorer", "orchestrator", "reviewer", "tester"],
	tools: [
		"code-analysis",
		"project-intelligence",
		"security-scanning",
		"web-search",
	],
	commands: [
		"add-documentation",
		"add-feature",
		"audit-security",
		"fix-bug",
		"measure-test-coverage",
		"review-code",
	],
};

export const PRESET_NANO: Preset = {
	name: "nano",
	description: "Lightweight starter with core functionality",
	agents: ["coder", "explorer", "orchestrator"],
	tools: ["code-analysis", "project-intelligence", "web-search"],
	commands: ["add-documentation", "add-feature", "fix-bug", "review-code"],
};

export const PRESET_PICO: Preset = {
	name: "pico",
	description: "Barebones for advanced users who build custom systems",
	agents: ["coder", "orchestrator"],
	tools: ["web-search"],
	commands: ["add-feature", "fix-bug"],
};

export const PRESETS: Preset[] = [
	PRESET_FULL,
	PRESET_STOCK,
	PRESET_MICRO,
	PRESET_MINI,
	PRESET_NANO,
	PRESET_PICO,
];
