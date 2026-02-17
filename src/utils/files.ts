import { $ } from "bun";

export async function fileOrDirExists(path: string): Promise<boolean> {
	const file = Bun.file(path);
	if (await file.exists()) {
		return true;
	}

	try {
		await $`test -d ${path}`.quiet();
		return true;
	} catch {
		return false;
	}
}

export async function readTextFile(path: string): Promise<string> {
	try {
		const file = Bun.file(path);
		if (!(await file.exists())) {
			throw new Error(`File not found: ${path}`);
		}
		return await file.text();
	} catch (error) {
		throw new Error(
			`Failed to read file ${path}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

export async function writeTextFile(
	path: string,
	content: string,
): Promise<void> {
	try {
		await Bun.write(path, content);
	} catch (error) {
		throw new Error(
			`Failed to write file ${path}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

export async function backupExistingConfig(configPath: string): Promise<void> {
	const file = Bun.file(configPath);
	if (!(await file.exists())) {
		return;
	}

	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	const backupPath = `${configPath}.backup-${timestamp}`;

	try {
		await Bun.write(backupPath, await file.text());
		console.log(`Backed up existing config to ${backupPath}`);
	} catch (error) {
		throw new Error(
			`Failed to back up config ${configPath}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
}

export function getOpenCodePath(installRoot: string, path: string): string {
	return `${installRoot}/${path}`;
}
