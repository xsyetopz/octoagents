import { $ } from "bun";

function getHomeDir(): string {
	return (
		process.env["HOME"] ??
		process.env["USERPROFILE"] ??
		process.env["HOMEDIR"] ??
		"/home/user"
	);
}

const OPENCODE_DIR = `${getHomeDir()}/.config/opencode`;

export async function backupExistingInstall(): Promise<void> {
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	const backupDir = `${OPENCODE_DIR}/.opencode.backup-${timestamp}`;
	const opencodeDir = `${OPENCODE_DIR}/.opencode`;

	try {
		await $`test -d ${opencodeDir}`.quiet();
		await $`mv ${opencodeDir} ${backupDir}`;
		console.log(`Backed up existing .opencode to ${backupDir}`);
	} catch {
		console.log("No existing .opencode directory found, skipping backup...");
	}
}

export function getOpenCodePath(path: string): string {
	return `${OPENCODE_DIR}/.opencode/${path}`;
}
