import { exec } from "node:child_process";
import { promisify } from "node:util";
import { readTextFile } from "../utils/files.ts";

const execAsync = promisify(exec);

export function getHomeDir(): string {
	return (
		process.env["HOME"] ??
		process.env["USERPROFILE"] ??
		process.env["HOMEDIR"] ??
		"/home/user"
	);
}

export async function checkOpenCodeInstalled(): Promise<boolean> {
	try {
		await execAsync("which opencode");
		return true;
	} catch (_err) {
		return false;
	}
}

export async function installOpenCode(): Promise<void> {
	console.log("Installing OpenCode...");
	try {
		await execAsync("bun install -g opencode");
		console.log("OpenCode installed successfully");
	} catch (error) {
		console.error("Failed to install OpenCode:", error);
		process.exit(1);
	}
}

export async function checkBunAvailable(): Promise<boolean> {
	try {
		await execAsync("which bun");
		return true;
	} catch (_err) {
		return false;
	}
}

export async function installBun(): Promise<void> {
	console.log("Installing Bun...");
	try {
		await execAsync("curl -fsSL https://bun.sh/install | bash");
		console.log(
			"Bun installed successfully. Please restart your shell and run install script again",
		);
		process.exit(0);
	} catch (error) {
		console.error("Failed to install Bun:", error);
		process.exit(1);
	}
}

export function checkPlatform(): void {
	const platform = process.platform;
	if (platform === "win32") {
		console.warn("Windows detected. This framework requires macOS/Linux");
		console.warn("Please use WSL2 on Windows to install this framework");
		process.exit(1);
	}
}

export async function hasSyntheticApiKey(): Promise<boolean> {
	const envKey = process.env["SYNTHETIC_API_KEY"];
	if (envKey) {
		return true;
	}

	const authPath = `${getHomeDir()}/.local/share/opencode/auth.json`;
	try {
		const authContents = (await readTextFile(authPath)).trim();
		const authJson = JSON.parse(authContents) as {
			synthetic?: { key?: string };
		};
		if (authJson.synthetic?.key?.trim()) {
			return true;
		}
	} catch (error) {
		console.debug(
			`No valid auth.json for synthetic API key: ${error instanceof Error ? error.message : String(error)}`,
		);
	}

	const secretsPath = `${getHomeDir()}/.secrets/synthetic-api-key`;
	try {
		const content = (await readTextFile(secretsPath)).trim();
		return content.length > 0;
	} catch {
		return false;
	}
}

export async function hasOpenCodeAuthJson(): Promise<boolean> {
	const authPath = `${getHomeDir()}/.local/share/opencode/auth.json`;
	try {
		const contents = (await readTextFile(authPath)).trim();
		if (!contents) {
			return false;
		}
		JSON.parse(contents);
		return true;
	} catch {
		return false;
	}
}
