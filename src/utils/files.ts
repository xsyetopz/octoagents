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

export async function backupExistingInstall(
	installRoot: string,
): Promise<void> {
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	const backupDir = `${installRoot}.backup-${timestamp}`;

	try {
		await $`test -d ${installRoot}`.quiet();
		await $`mv ${installRoot} ${backupDir}`;
		console.log(`Backed up existing install to ${backupDir}`);
	} catch {
		console.log("No existing install directory found, skipping backup...");
	}
}

export function getOpenCodePath(installRoot: string, path: string): string {
	return `${installRoot}/${path}`;
}
