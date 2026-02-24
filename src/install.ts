import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import {
	AGENT_META,
	ALL_AGENT_ROLES,
	CUSTOM_SUBAGENT_ROLES,
} from "./agents.ts";
import { COMMAND_DEFINITIONS } from "./commands.ts";
import { buildContextFiles } from "./context.ts";
import { detectProviders } from "./detect.ts";
import {
	type AgentRole,
	type ModelAssignment,
	resolveModel,
} from "./models.ts";
import { applyContentPlugins, resolvePlugins } from "./plugins.ts";
import { renderSkillFile } from "./render.ts";
import { SKILL_DEFINITIONS } from "./skills.ts";
import {
	loadAgentTemplate,
	loadCommandTemplate,
	loadTemplateFile,
	resolveTemplateVars,
} from "./template.ts";
import type { InstallOptions, InstallScope } from "./types.ts";
import {
	validateAgentNames,
	validateCommandNames,
	validateNamespaceConflicts,
	validatePermissionKeys,
	validatePermissionValues,
} from "./validate.ts";

function resolveTargetDir(scope: InstallScope): string {
	if (scope === "global") {
		const home = process.env["HOME"] ?? "";
		if (!home) {
			throw new Error("Cannot determine home directory for global install");
		}
		return `${home}/.config/opencode`;
	}
	return `${process.cwd()}`;
}

async function ensureDir(path: string, dryRun: boolean): Promise<void> {
	if (dryRun) {
		return;
	}
	await mkdir(path, { recursive: true });
}

async function writeFile(
	path: string,
	content: string,
	dryRun: boolean,
): Promise<void> {
	if (dryRun) {
		console.log(`[dry-run] write ${path}`);
		return;
	}
	await Bun.write(path, content);
}

async function removeDir(path: string, dryRun: boolean): Promise<void> {
	if (dryRun) {
		console.log(`[dry-run] remove ${path}`);
		return;
	}
	await rm(path, { recursive: true, force: true });
}


function runValidation(
	agentNames: string[],
	commandNames: string[],
	permissionSets: Array<{ name: string; permission: Record<string, unknown> }>,
): void {
	const errors = [
		...validateAgentNames(agentNames),
		...validateCommandNames(commandNames),
		...validateNamespaceConflicts(agentNames, commandNames),
		...permissionSets.flatMap(({ name, permission }) => [
			...validatePermissionKeys(permission, name),
			...validatePermissionValues(permission, name),
		]),
	];
	if (errors.length > 0) {
		const messages = errors.map((e) => `  [${e.type}] ${e.message}`).join("\n");
		throw new Error(`Validation failed:\n${messages}`);
	}
}

const PLUGIN_FILENAMES = [
	"behavior-guard.ts",
	"code-mode.ts",
	"context-loader.ts",
	"safety-guard.ts",
	"session-logger.ts",
] as const;
const TOOL_FILENAMES = ["code-mode-mcp.ts", "read-context.ts"] as const;

export interface AgentAssignment {
	role: string;
	model: string;
	tier: string;
}

export interface InstallReport {
	agentAssignments: AgentAssignment[];
	filesWritten: number;
	plugins: string[];
}

interface InstallDirs {
	opencodeDir: string;
	agentsDir: string;
	commandsDir: string;
	skillsDir: string;
	contextDir: string;
	pluginsDir: string;
	toolsDir: string;
}

function resolveDirs(scope: InstallOptions["scope"]): InstallDirs {
	const targetDir = resolveTargetDir(scope);
	const opencodeDir = `${targetDir}/.opencode`;
	return {
		opencodeDir,
		agentsDir: `${opencodeDir}/agents`,
		commandsDir: `${opencodeDir}/commands`,
		skillsDir: `${opencodeDir}/skills`,
		contextDir: `${opencodeDir}/context`,
		pluginsDir: `${opencodeDir}/plugins`,
		toolsDir: `${opencodeDir}/tools`,
	};
}

async function writeAgents(
	assignments: Array<{ role: AgentRole; assignment: ModelAssignment }>,
	plugins: ReturnType<typeof resolvePlugins>,
	agentsDir: string,
	dryRun: boolean,
): Promise<number> {
	await Promise.all(
		assignments.map(async ({ role, assignment }) => {
			const vars = resolveTemplateVars(assignment.model);
			const rawContent = await loadAgentTemplate(role, vars);
			const content = applyContentPlugins(role, rawContent, plugins);
			await writeFile(`${agentsDir}/${role}.md`, content, dryRun);
		}),
	);
	return assignments.length;
}

async function writeCommands(
	commandsDir: string,
	dryRun: boolean,
): Promise<number> {
	await Promise.all(
		COMMAND_DEFINITIONS.map(async (command) => {
			const content = await loadCommandTemplate(command.name);
			await writeFile(`${commandsDir}/${command.name}.md`, content, dryRun);
		}),
	);
	return COMMAND_DEFINITIONS.length;
}

async function writeSkills(
	skillsDir: string,
	dryRun: boolean,
): Promise<number> {
	await Promise.all(
		SKILL_DEFINITIONS.map(async (skill) => {
			const skillDir = `${skillsDir}/${skill.name}`;
			await ensureDir(skillDir, dryRun);
			const content = renderSkillFile(skill);
			await writeFile(`${skillDir}/SKILL.md`, content, dryRun);
		}),
	);
	return SKILL_DEFINITIONS.length;
}

async function writeContextFiles(
	contextDir: string,
	dryRun: boolean,
): Promise<number> {
	let count = 0;
	for (const ctxFile of buildContextFiles()) {
		const destPath = join(contextDir, ctxFile.filename);
		const exists = dryRun ? false : await Bun.file(destPath).exists();
		if (!exists) {
			await writeFile(destPath, ctxFile.content, dryRun);
			count++;
		}
	}
	return count;
}

async function writeTemplateFiles(
	filenames: readonly string[],
	subdir: string,
	destDir: string,
	dryRun: boolean,
): Promise<number> {
	await Promise.all(
		filenames.map(async (filename) => {
			const content = await loadTemplateFile(join(subdir, filename));
			await writeFile(join(destDir, filename), content, dryRun);
		}),
	);
	return filenames.length;
}

async function writePluginExtraFiles(
	plugins: ReturnType<typeof resolvePlugins>,
	opencodeDir: string,
	dryRun: boolean,
): Promise<number> {
	let count = 0;
	for (const plugin of plugins) {
		if (plugin.extraFiles) {
			for (const { path, content } of plugin.extraFiles()) {
				await writeFile(`${opencodeDir}/${path}`, content, dryRun);
				count++;
			}
		}
	}
	return count;
}

export async function install(options: InstallOptions): Promise<InstallReport> {
	const { scope, clean, dryRun, noOverrides, plugins: pluginNames } = options;

	const [providers, plugins] = await Promise.all([
		detectProviders(),
		Promise.resolve(resolvePlugins(pluginNames)),
	]);

	const dirs = resolveDirs(scope);
	const {
		opencodeDir,
		agentsDir,
		commandsDir,
		skillsDir,
		contextDir,
		pluginsDir,
		toolsDir,
	} = dirs;

	const agentRoles: AgentRole[] = noOverrides
		? CUSTOM_SUBAGENT_ROLES
		: ALL_AGENT_ROLES;
	const assignments = agentRoles.map((role) => ({
		role,
		assignment: resolveModel(role, providers),
	}));

	runValidation(
		agentRoles.map((r) => r as string),
		COMMAND_DEFINITIONS.map((c) => c.name),
		agentRoles.map((role) => ({
			name: `agent:${role}`,
			permission: AGENT_META[role].permission as Record<string, unknown>,
		})),
	);

	if (clean) {
		await removeDir(opencodeDir, dryRun);
	}

	await Promise.all([
		ensureDir(agentsDir, dryRun),
		ensureDir(commandsDir, dryRun),
		ensureDir(skillsDir, dryRun),
		ensureDir(contextDir, dryRun),
		ensureDir(pluginsDir, dryRun),
		ensureDir(toolsDir, dryRun),
	]);

	const counts = await Promise.all([
		writeAgents(assignments, plugins, agentsDir, dryRun),
		writeCommands(commandsDir, dryRun),
		writeSkills(skillsDir, dryRun),
		writeContextFiles(contextDir, dryRun),
		writeTemplateFiles(PLUGIN_FILENAMES, "plugins", pluginsDir, dryRun),
		writeTemplateFiles(TOOL_FILENAMES, "tools", toolsDir, dryRun),
		writePluginExtraFiles(plugins, opencodeDir, dryRun),
	]);

	const filesWritten = counts.reduce((a, b) => a + b, 0);

	return {
		agentAssignments: assignments.map(({ role, assignment }) => ({
			role,
			model: assignment.model,
			tier: assignment.tier,
		})),
		filesWritten,
		plugins: pluginNames,
	};
}
