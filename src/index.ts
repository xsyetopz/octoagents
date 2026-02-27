// biome-ignore lint/performance/noBarrelFile: intentional public API barrel
export {
	AGENT_META,
	ALL_AGENT_ROLES,
	BUILT_IN_OVERRIDE_ROLES,
	CUSTOM_SUBAGENT_ROLES,
} from "./agents.ts";
export { COMMAND_DEFINITIONS } from "./commands.ts";
export { buildContextFiles } from "./context.ts";
export { detectProviders } from "./detect.ts";
export type { AgentAssignment, InstallReport } from "./install.ts";
export { install } from "./install.ts";
export type { AgentRole, ModelAssignment, ModelId } from "./models.ts";
export { MODELS, resolveModel } from "./models.ts";
export {
	buildBailianProviderConfig,
	buildMcpConfig,
	buildOpenCodeJsonc,
	mergeMcpConfig,
	mergeProviderConfig,
	parseJsonc,
	stringifyJsonc,
} from "./opencode-config.ts";
export type { ContentPlugin } from "./plugins.ts";
export {
	applyContentPlugins,
	BUILT_IN_PLUGINS,
	CONVENTIONS_PLUGIN,
	DEFAULT_PLUGINS,
	injectPreamble,
	resolvePlugins,
	SAFETY_GUARD_PLUGIN,
} from "./plugins.ts";
export { renderAgentFile, renderSkillFile } from "./render.ts";
export { SKILL_DEFINITIONS } from "./skills.ts";
export {
	loadAgentTemplate,
	loadCommandTemplate,
	loadTemplateFile,
	resolveTemplateVars,
} from "./template.ts";
export type {
	AgentDefinition,
	AgentMode,
	AgentPermission,
	CommandDefinition,
	ContextFile,
	InstallOptions,
	InstallScope,
	Permission,
	PermissionPattern,
	PermissionValue,
	Plugin,
	ProviderAvailability,
	SkillDefinition,
} from "./types.ts";
