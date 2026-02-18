import { mkdirSync } from "node:fs";
import { cp, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { readTextFile, writeTextFile } from "../utils/files.ts";

export async function ensureDirectory(path: string): Promise<void> {
	try {
		await mkdir(path, { recursive: true });
	} catch (error) {
		console.warn(
			`Failed to create directory ${path}: ${(error as Error).message}`,
		);
	}
}

export function ensureDirectorySync(path: string): void {
	try {
		mkdirSync(path, { recursive: true });
	} catch (error) {
		console.warn(
			`Failed to create directory ${path}: ${(error as Error).message}`,
		);
	}
}

export async function createOpenCodeStructure(
	opencodeDir: string,
): Promise<void> {
	await ensureDirectory(`${opencodeDir}/agents`);
	await ensureDirectory(`${opencodeDir}/tools`);
	await ensureDirectory(`${opencodeDir}/plugins`);
	await ensureDirectory(`${opencodeDir}/commands`);
	await ensureDirectory(`${opencodeDir}/meta`);
	await ensureDirectory(`${opencodeDir}/skills`);
}

export async function copyTools(
	presetTools: string[],
	installerDir: string,
	opencodeDir: string,
): Promise<void> {
	const targetDir = join(opencodeDir, "tools");
	ensureDirectorySync(targetDir);

	for (const tool of presetTools) {
		const toolsPath = join(installerDir, `tools/${tool}.ts`);
		const { access } = await import("node:fs/promises");
		const { constants } = await import("node:fs");
		try {
			await access(toolsPath, constants.F_OK);
		} catch (_err) {
			console.warn(`Tool ${tool} not found in tools/, skipping...`);
			continue;
		}

		try {
			const content = await readTextFile(toolsPath);
			const targetPath = join(targetDir, `${tool}.ts`);
			await writeTextFile(targetPath, content);
			console.log(`Created: ${targetPath}`);
		} catch (_error) {
			console.warn(`Tool ${tool} failed to copy, skipping...`);
		}
	}
}

export async function copyPlugins(
	presetPlugins: string[],
	installerDir: string,
	opencodeDir: string,
): Promise<void> {
	const targetDir = join(opencodeDir, "plugins");
	ensureDirectorySync(targetDir);

	for (const plugin of presetPlugins) {
		const pluginsPath = join(installerDir, `plugins/${plugin}.ts`);
		const { access } = await import("node:fs/promises");
		const { constants } = await import("node:fs");
		try {
			await access(pluginsPath, constants.F_OK);
		} catch (_err) {
			console.warn(`Plugin ${plugin} not found in plugins/, skipping...`);
			continue;
		}

		try {
			const content = await readTextFile(pluginsPath);
			const targetPath = join(targetDir, `${plugin}.ts`);
			await writeTextFile(targetPath, content);
			console.log(`Created: ${targetPath}`);
		} catch (_error) {
			console.warn(`Plugin ${plugin} failed to copy, skipping...`);
		}
	}
}

export async function copyCommands(
	presetCommands: string[],
	installerDir: string,
	opencodeDir: string,
): Promise<void> {
	const targetDir = join(opencodeDir, "commands");
	ensureDirectorySync(targetDir);

	for (const command of presetCommands) {
		const sourcePath = join(installerDir, `templates/commands/${command}.md`);
		try {
			const content = await readTextFile(sourcePath);
			const targetPath = join(targetDir, `${command}.md`);
			await writeTextFile(targetPath, content);
			console.log(`Created: ${targetPath}`);
		} catch (_error) {
			console.warn(`Command ${command} not found, skipping...`);
		}
	}
}

export async function copyMetaTemplates(
	installerDir: string,
	opencodeDir: string,
): Promise<void> {
	const sourceDir = join(installerDir, "meta");
	const targetDir = join(opencodeDir, "meta");
	ensureDirectorySync(targetDir);

	const metaFiles = [
		"agent-template.md",
		"command-template.md",
		"tool-template.ts",
	];
	for (const file of metaFiles) {
		const sourcePath = join(sourceDir, file);
		try {
			const content = await readTextFile(sourcePath);
			const targetPath = join(targetDir, file);
			await writeTextFile(targetPath, content);
			console.log(`Created: ${targetPath}`);
		} catch (_error) {
			console.warn(`Meta template ${file} not found, skipping...`);
		}
	}
}

export async function copySkills(
	installerDir: string,
	opencodeDir: string,
): Promise<void> {
	const sourceDir = join(installerDir, "skills");
	const targetDir = join(opencodeDir, "skills");
	ensureDirectorySync(targetDir);

	try {
		await cp(sourceDir, targetDir, { recursive: true, force: true });
		console.log(`Created: ${targetDir}/ (skills copied)`);
	} catch (error) {
		console.debug(
			`Failed to copy skills: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
