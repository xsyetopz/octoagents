import { readFileSync, writeFileSync } from "node:fs";
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

export async function createOpenCodeStructure(
	opencodeDir: string,
): Promise<void> {
	await ensureDirectory(`${opencodeDir}/.opencode/agents`);
	await ensureDirectory(`${opencodeDir}/.opencode/plugins`);
	await ensureDirectory(`${opencodeDir}/.opencode/commands`);
	await ensureDirectory(`${opencodeDir}/.opencode/meta`);
}

export function copyPlugins(
	presetTools: string[],
	installerDir: string,
	opencodeDir: string,
): void {
	const targetDir = join(opencodeDir, "plugins");

	presetTools.forEach((tool) => {
		const sourcePath = join(installerDir, `plugins/${tool}.ts`);
		try {
			const content = readFileSync(sourcePath, "utf-8");
			const targetPath = join(targetDir, `${tool}.ts`);
			writeFileSync(targetPath, content);
			console.log(`Created: ${targetPath}`);
		} catch (_error) {
			console.warn(`Plugin ${tool} not found, skipping...`);
		}
	});
}

export function copyCommands(
	presetCommands: string[],
	installerDir: string,
	opencodeDir: string,
): void {
	const targetDir = join(opencodeDir, "commands");

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
