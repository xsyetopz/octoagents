import type { Preset } from "../types/index.ts";

const AVAILABLE_TOOLS = [
	"code-analysis",
	"security-scanning",
	"project-intelligence",
	"workflow-automation",
	"external-integration",
	"development-utilities",
];

const AVAILABLE_COMMANDS = [
	"feature-implementation",
	"bug-fix",
	"refactoring",
	"api-endpoint",
	"code-review",
	"security-audit",
	"test-coverage",
	"performance-optimization",
	"add-documentation",
	"update-readme",
	"create-api-docs",
	"dependency-update",
	"code-cleanup",
	"migration-assistance",
];

export const PRESET_FULL: Preset = {
	name: "full",
	description: "Full framework with everything - jack of all trades",
	agents: [
		"orchestrate",
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
	tools: AVAILABLE_TOOLS,
	commands: AVAILABLE_COMMANDS,
};

export const PRESET_STOCK: Preset = {
	name: "stock",
	description: "Recommended for most users - balanced feature set",
	agents: [
		"orchestrate",
		"coder",
		"reviewer",
		"tester",
		"explorer",
		"planner",
		"documenter",
	],
	tools: [
		"code-analysis",
		"security-scanning",
		"project-intelligence",
		"workflow-automation",
	],
	commands: [
		"feature-implementation",
		"bug-fix",
		"code-review",
		"security-audit",
		"test-coverage",
		"add-documentation",
		"dependency-update",
	],
};

export const PRESET_MICRO: Preset = {
	name: "micro",
	description: "Speed-optimized for fast execution",
	agents: ["orchestrate", "coder", "explorer", "researcher"],
	tools: ["code-analysis", "project-intelligence", "workflow-automation"],
	commands: [
		"feature-implementation",
		"bug-fix",
		"code-review",
		"test-coverage",
		"add-documentation",
	],
};

export const PRESET_MINI: Preset = {
	name: "mini",
	description: "Balanced default for everyday use",
	agents: ["orchestrate", "coder", "reviewer", "tester", "explorer"],
	tools: ["code-analysis", "security-scanning", "project-intelligence"],
	commands: [
		"feature-implementation",
		"bug-fix",
		"code-review",
		"security-audit",
		"test-coverage",
		"add-documentation",
		"dependency-update",
	],
};

export const PRESET_NANO: Preset = {
	name: "nano",
	description: "Lightweight starter with core functionality",
	agents: ["orchestrate", "coder", "explorer"],
	tools: ["code-analysis", "project-intelligence"],
	commands: [
		"feature-implementation",
		"bug-fix",
		"code-review",
		"add-documentation",
	],
};

export const PRESET_PICO: Preset = {
	name: "pico",
	description: "Barebones for advanced users who build custom systems",
	agents: ["orchestrate", "coder"],
	tools: [],
	commands: ["feature-implementation", "bug-fix"],
};

export const PRESETS: Preset[] = [
	PRESET_FULL,
	PRESET_STOCK,
	PRESET_MICRO,
	PRESET_MINI,
	PRESET_NANO,
	PRESET_PICO,
];
