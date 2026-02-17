import { readFileSync } from "node:fs";
import { $ } from "bun";

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
		await $`which opencode`.quiet();
		return true;
	} catch {
		return false;
	}
}

export async function installOpenCode(): Promise<void> {
	console.log("Installing OpenCode...");
	try {
		await $`bun install -g opencode`;
		console.log("OpenCode installed successfully");
	} catch (error) {
		console.error("Failed to install OpenCode:", error);
		process.exit(1);
	}
}

export async function checkBunAvailable(): Promise<boolean> {
	try {
		await $`which bun`.quiet();
		return true;
	} catch {
		return false;
	}
}

export async function installBun(): Promise<void> {
	console.log("Installing Bun...");
	try {
		await $`curl -fsSL https://bun.sh/install | bash`;
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

export function hasSyntheticApiKey(): boolean {
	const envKey = process.env["SYNTHETIC_API_KEY"];
	if (envKey) {
		return true;
	}

	const authPath = `${getHomeDir()}/.local/share/opencode/auth.json`;
	try {
		const authContents = readFileSync(authPath, "utf-8").trim();
		if (authContents) {
			const authJson = JSON.parse(authContents) as {
				synthetic?: { key?: string };
			};
			if (authJson.synthetic?.key?.trim()) {
				return true;
			}
		}
	} catch (error) {
		console.warn(
			"No valid auth.json found for synthetic API key detection:",
			error,
		);
	}

	const secretsPath = `${getHomeDir()}/.secrets/synthetic-api-key`;
	try {
		return readFileSync(secretsPath, "utf-8").trim().length > 0;
	} catch {
		return false;
	}
}

export function hasOpenCodeAuthJson(): boolean {
	const authPath = `${getHomeDir()}/.local/share/opencode/auth.json`;
	try {
		const contents = readFileSync(authPath, "utf-8").trim();
		if (!contents) {
			return false;
		}
		JSON.parse(contents);
		return true;
	} catch {
		return false;
	}
}
