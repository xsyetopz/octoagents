import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";

export async function ensureDirectory(path: string): Promise<void> {
	try {
		await $`mkdir -p ${path}`.quiet();
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
	await ensureDirectory(`${opencodeDir}/plugins`);
	await ensureDirectory(`${opencodeDir}/commands`);
	await ensureDirectory(`${opencodeDir}/meta`);
	await ensureDirectory(`${opencodeDir}/skills`);
}

export function copyPlugins(
	presetTools: string[],
	installerDir: string,
	opencodeDir: string,
): void {
	const targetDir = join(opencodeDir, "plugins");
	ensureDirectorySync(targetDir);

	presetTools.forEach((tool) => {
		const toolsPath = join(installerDir, `tools/${tool}.ts`);
		const pluginsPath = join(installerDir, `plugins/${tool}.ts`);

		let sourcePath = toolsPath;
		try {
			readFileSync(toolsPath, "utf-8");
		} catch {
			sourcePath = pluginsPath;
		}

		try {
			const content = readFileSync(sourcePath, "utf-8");
			const targetPath = join(targetDir, `${tool}.ts`);
			writeFileSync(targetPath, content);
			console.log(`Created: ${targetPath}`);
		} catch (_error) {
			console.warn(`Tool ${tool} not found in tools/ or plugins/, skipping...`);
		}
	});
}

export function copyCommands(
	presetCommands: string[],
	installerDir: string,
	opencodeDir: string,
): void {
	const targetDir = join(opencodeDir, "commands");
	ensureDirectorySync(targetDir);

	presetCommands.forEach((command) => {
		const sourcePath = join(installerDir, `templates/commands/${command}.md`);
		try {
			const content = readFileSync(sourcePath, "utf-8");
			const targetPath = join(targetDir, `${command}.md`);
			writeFileSync(targetPath, content);
			console.log(`Created: ${targetPath}`);
		} catch (_error) {
			console.warn(`Command ${command} not found, skipping...`);
		}
	});
}

export function copyMetaTemplates(
	installerDir: string,
	opencodeDir: string,
): void {
	const sourceDir = join(installerDir, "meta");
	const targetDir = join(opencodeDir, "meta");
	ensureDirectorySync(targetDir);

	const metaFiles = [
		"agent-template.md",
		"command-template.md",
		"tool-template.ts",
	];
	metaFiles.forEach((file) => {
		const sourcePath = join(sourceDir, file);
		const content = readFileSync(sourcePath, "utf-8");
		const targetPath = join(targetDir, file);
		writeFileSync(targetPath, content);
		console.log(`Created: ${targetPath}`);
	});
}

export async function copySkills(
	installerDir: string,
	opencodeDir: string,
): Promise<void> {
	const sourceDir = join(installerDir, "skills");
	const targetDir = join(opencodeDir, "skills");
	ensureDirectorySync(targetDir);

	try {
		await $`cp -r ${sourceDir}/* ${targetDir}/`.quiet();
		console.log(`Created: ${targetDir}/ (skills copied)`);
	} catch (error) {
		console.debug(
			`Failed to copy skills: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
