import { $ } from "bun";

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
