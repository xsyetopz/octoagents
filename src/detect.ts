import type { ProviderAvailability } from "./types.ts";

async function fileExists(path: string): Promise<boolean> {
	try {
		return await Bun.file(path).exists();
	} catch {
		return false;
	}
}

async function hasChutesInConfig(configPath: string): Promise<boolean> {
	try {
		const text = await Bun.file(configPath).text();
		const parsed = JSON.parse(text) as Record<string, unknown>;
		const providers = parsed["providers"] as
			| Record<string, unknown>
			| undefined;
		const chutes = providers?.["chutes"] as Record<string, unknown> | undefined;
		return Boolean(chutes?.["apiKey"]);
	} catch {
		return false;
	}
}

async function hasChutesKey(): Promise<boolean> {
	const envKey = process.env["CHUTES_API_KEY"] ?? "";
	if (envKey.length > 0) {
		return true;
	}

	const home = process.env["HOME"] ?? "";
	if (!home) {
		return false;
	}

	// Respect XDG Base Directory standard: use XDG_CONFIG_HOME if set
	const configHome = process.env["XDG_CONFIG_HOME"] ?? `${home}/.config`;

	const configPaths = [
		`${configHome}/opencode/opencode.json`,
		`${home}/.opencode/opencode.json`,
	];

	for (const configPath of configPaths) {
		if (await fileExists(configPath)) {
			if (await hasChutesInConfig(configPath)) {
				return true;
			}
		}
	}

	return false;
}

async function hasGitHubCopilot(): Promise<boolean> {
	const home = process.env["HOME"] ?? "";
	if (!home) {
		return false;
	}

	// Respect XDG Base Directory standard: use XDG_CONFIG_HOME if set
	const configHome = process.env["XDG_CONFIG_HOME"] ?? `${home}/.config`;

	const copilotPaths = [
		`${configHome}/github-copilot/hosts.json`,
		`${configHome}/github-copilot/apps.json`,
	];

	for (const p of copilotPaths) {
		if (await fileExists(p)) {
			return true;
		}
	}

	const envVars = ["GITHUB_TOKEN", "GH_TOKEN", "GITHUB_COPILOT_TOKEN"];
	return envVars.some((v) => Boolean(process.env[v]));
}

export async function detectProviders(): Promise<ProviderAvailability> {
	const [chutes, githubCopilot] = await Promise.all([
		hasChutesKey(),
		hasGitHubCopilot(),
	]);
	return { chutes, githubCopilot };
}
