import type { AgentRole } from "./models.ts";
import type { AgentMode, AgentPermission } from "./types.ts";

export interface AgentMeta {
	greekName: string;
	description: string;
	color: string;
	mode: AgentMode;
	permission: AgentPermission;
}

const FULL_ACCESS_BASH: AgentPermission["bash"] = {
	"*": "allow",
	"rm -rf /": "deny",
	"rm -rf ~": "deny",
	"git commit*": "deny",
	"git push*": "deny",
	"git add*": "deny",
};

const TEST_RUNNER_BASH: AgentPermission["bash"] = {
	"npm test*": "allow",
	"npm run test*": "allow",
	"bun test*": "allow",
	"bun run test*": "allow",
	"pnpm test*": "allow",
	"yarn test*": "allow",
	"pytest*": "allow",
	"cargo test*": "allow",
	"go test*": "allow",
	"*": "deny",
};

const FULL_ACCESS_PERMISSION: AgentPermission = {
	read: "allow",
	edit: "allow",
	bash: FULL_ACCESS_BASH,
	task: "allow",
	skill: "allow",
	lsp: "allow",
	webfetch: "allow",
	websearch: "allow",
	codesearch: "allow",
	todoread: "allow",
	todowrite: "allow",
};

const READ_PLAN_PERMISSION: AgentPermission = {
	read: "allow",
	grep: "allow",
	glob: "allow",
	list: "allow",
	edit: "ask",
	bash: "ask",
	task: "allow",
	skill: "allow",
	lsp: "allow",
	webfetch: "allow",
	websearch: "allow",
	codesearch: "allow",
	todoread: "allow",
	todowrite: "allow",
};

const READ_ONLY_PERMISSION: AgentPermission = {
	read: "allow",
	grep: "allow",
	glob: "allow",
	list: "allow",
	lsp: "allow",
	webfetch: "allow",
	websearch: "allow",
	codesearch: "allow",
	edit: "deny",
	bash: "deny",
};

const DOCS_SCOPED_PERMISSION: AgentPermission = {
	read: "allow",
	grep: "allow",
	glob: "allow",
	list: "allow",
	lsp: "allow",
	edit: {
		"docs/**": "allow",
		"*.md": "allow",
		"*": "ask",
	},
	bash: "deny",
};

const TEST_RUNNER_PERMISSION: AgentPermission = {
	read: "allow",
	grep: "allow",
	glob: "allow",
	list: "allow",
	lsp: "allow",
	edit: "deny",
	bash: TEST_RUNNER_BASH,
};

export const AGENT_META: Record<AgentRole, AgentMeta> = {
	build: {
		greekName: "odysseus",
		description: "Primary coding agent — orchestrates, delegates, commits",
		color: "#3B82F6",
		mode: "primary",
		permission: FULL_ACCESS_PERMISSION,
	},
	plan: {
		greekName: "athena",
		description: "Senior solution architect — breaks down goals into steps",
		color: "#8B5CF6",
		mode: "primary",
		permission: READ_PLAN_PERMISSION,
	},
	implement: {
		greekName: "hephaestus",
		description: "Code implementer — writes and edits code to specification",
		color: "#F97316",
		mode: "subagent",
		permission: FULL_ACCESS_PERMISSION,
	},
	review: {
		greekName: "argus",
		description: "Code reviewer — quality, security, correctness analysis",
		color: "#EF4444",
		mode: "subagent",
		permission: READ_ONLY_PERMISSION,
	},
	test: {
		greekName: "orion",
		description: "Test runner — executes tests, analyzes failures",
		color: "#22C55E",
		mode: "subagent",
		permission: TEST_RUNNER_PERMISSION,
	},
	document: {
		greekName: "calliope",
		description: "Document generator — creates and updates documentation",
		color: "#14B8A6",
		mode: "subagent",
		permission: DOCS_SCOPED_PERMISSION,
	},
	explore: {
		greekName: "hermes",
		description: "Virtual hunting dog — tracks down information",
		color: "#EAB308",
		mode: "subagent",
		permission: {
			...READ_ONLY_PERMISSION,
			webfetch: "allow",
			websearch: "allow",
		},
	},
	general: {
		greekName: "prometheus",
		description: "Multi-step delegated tasks",
		color: "#6366F1",
		mode: "subagent",
		permission: FULL_ACCESS_PERMISSION,
	},
};

export const PRIMARY_AGENTS: AgentRole[] = ["build", "plan"];
export const SUBAGENT_ROLES: AgentRole[] = [
	"implement",
	"review",
	"test",
	"document",
	"explore",
	"general",
];
export const ALL_AGENT_ROLES: AgentRole[] = [
	...PRIMARY_AGENTS,
	...SUBAGENT_ROLES,
];
