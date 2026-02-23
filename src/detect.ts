import type { ProviderAvailability } from "./types.ts";

async function fileExists(path: string): Promise<boolean> {
	try {
		return await Bun.file(path).exists();
	} catch {
		return false;
	}
}

async function hasSyntheticInConfig(configPath: string): Promise<boolean> {
	try {
		const text = await Bun.file(configPath).text();
		const parsed = JSON.parse(text) as Record<string, unknown>;
		const providers = parsed["providers"] as
			| Record<string, unknown>
			| undefined;
		const synthetic = providers?.["synthetic"] as
			| Record<string, unknown>
			| undefined;
		return Boolean(synthetic?.["apiKey"]);
	} catch {
		return false;
	}
}

async function hasSyntheticKey(): Promise<boolean> {
	const envKey =
		process.env["SYNTHETIC_API_KEY"] ?? process.env["SYNTHETIC_KEY"] ?? "";
	if (envKey.length > 0) {
		return true;
	}

	const home = process.env["HOME"] ?? "";
	if (!home) {
		return false;
	}

	const configPaths = [
		`${home}/.config/opencode/opencode.json`,
		`${home}/.opencode/opencode.json`,
	];

	for (const configPath of configPaths) {
		if (await fileExists(configPath)) {
			if (await hasSyntheticInConfig(configPath)) {
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

	const copilotPaths = [
		`${home}/.config/github-copilot/hosts.json`,
		`${home}/.config/github-copilot/apps.json`,
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
	const [synthetic, githubCopilot] = await Promise.all([
		hasSyntheticKey(),
		hasGitHubCopilot(),
	]);
	return { synthetic, githubCopilot };
}
