import type { ProviderAvailability } from "./types.ts";

async function fileExists(path: string): Promise<boolean> {
	try {
		return await Bun.file(path).exists();
	} catch {
		return false;
	}
}

async function hasBailianCodingPlanInConfig(
	configPath: string,
): Promise<boolean> {
	try {
		const text = await Bun.file(configPath).text();
		const parsed = JSON.parse(text) as Record<string, unknown>;
		const providers = parsed["provider"] as Record<string, unknown> | undefined;
		const bailian = providers?.["bailian-coding-plan"] as
			| Record<string, unknown>
			| undefined;
		const options = bailian?.["options"] as Record<string, unknown> | undefined;
		return Boolean(options?.["apiKey"]);
	} catch {
		return false;
	}
}

async function hasBailianCodingPlan(): Promise<boolean> {
	const home = process.env["HOME"] ?? "";
	if (!home) {
		return false;
	}

	const envKey = process.env["DASHSCOPE_API_KEY"];
	if (envKey && envKey.length > 0) {
		return true;
	}

	const configHome = process.env["XDG_CONFIG_HOME"] ?? `${home}/.config`;
	const configPaths = [
		`${configHome}/opencode/opencode.jsonc`,
		`${configHome}/opencode/opencode.json`,
		`${home}/.opencode/opencode.jsonc`,
		`${home}/.opencode/opencode.json`,
	];

	for (const configPath of configPaths) {
		if (
			(await fileExists(configPath)) &&
			(await hasBailianCodingPlanInConfig(configPath))
		) {
			return true;
		}
	}

	return false;
}

async function hasGitHubCopilot(): Promise<boolean> {
	const home = process.env["HOME"] ?? "";
	if (!home) {
		return false;
	}

	const configHome = process.env["XDG_CONFIG_HOME"] ?? `${home}/.config`;
	const copilotPaths = [
		`${configHome}/github-copilot/hosts.json`,
		`${configHome}/github-copilot/apps.json`,
	];

	for (const path of copilotPaths) {
		if (await fileExists(path)) {
			return true;
		}
	}

	const envVars = ["GITHUB_TOKEN", "GH_TOKEN", "GITHUB_COPILOT_TOKEN"];
	for (const envVar of envVars) {
		if (process.env[envVar]) {
			return true;
		}
	}

	return false;
}

export async function detectProviders(): Promise<ProviderAvailability> {
	const [bailianCodingPlan, githubCopilot] = await Promise.all([
		hasBailianCodingPlan(),
		hasGitHubCopilot(),
	]);
	return { bailianCodingPlan, githubCopilot };
}
