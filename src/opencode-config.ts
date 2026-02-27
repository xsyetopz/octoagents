import type { InstallScope } from "./types.ts";

export interface OpenCodeConfig {
	$schema: string;
	provider?: Record<string, unknown>;
	mcp?: Record<string, unknown>;
}

export async function resolveConfigPath(scope: InstallScope): Promise<string> {
	const homeDir = process.env["HOME"] ?? "";
	const xdgConfigHome = process.env["XDG_CONFIG_HOME"];
	const configDir =
		typeof xdgConfigHome === "string"
			? xdgConfigHome
			: homeDir
				? `${homeDir}/.config`
				: "";

	const scopePaths =
		scope === "global"
			? configDir
				? [
						`${configDir}/opencode/opencode.jsonc`,
						`${configDir}/opencode/opencode.json`,
					]
				: []
			: [`${process.cwd()}/opencode.jsonc`, `${process.cwd()}/opencode.json`];
	for (const path of scopePaths) {
		if (await Bun.file(path).exists()) {
			return path;
		}
	}

	if (
		scopePaths.length > 0 &&
		typeof scopePaths[0] === "string" &&
		scopePaths[0] !== ""
	) {
		return scopePaths[0];
	}

	throw new Error(
		"Unable to resolve opencode config path: No candidate paths available.",
	);
}

const defaultThinkingOptions = {
	thinking: {
		type: "enabled",
		budgetTokens: 1024,
	},
};

const modelModalities = {
	"text+image": {
		input: ["text", "image"],
		output: ["text"],
	},
};

function createModel(
	name: string,
	options?: Record<string, unknown>,
	modalitiesKey?: keyof typeof modelModalities,
) {
	const model: Record<string, unknown> = { name };
	if (modalitiesKey) {
		model["modalities"] = modelModalities[modalitiesKey];
	}
	if (options) {
		model["options"] = options;
	}
	return model;
}

export function buildBailianProviderConfig(): Record<string, unknown> {
	return {
		"bailian-coding-plan": {
			npm: "@ai-sdk/anthropic",
			name: "Model Studio Coding Plan",
			options: {
				baseURL: "https://coding-intl.dashscope.aliyuncs.com/apps/anthropic/v1",
				apiKey: process.env["DASHSCOPE_API_KEY"] ?? "your-api-key-here",
			},
			models: {
				"qwen3.5-plus": createModel(
					"Qwen3.5 Plus",
					defaultThinkingOptions,
					"text+image",
				),
				"qwen3-max-2026-01-23": createModel(
					"Qwen3 Max 2026-01-23",
					defaultThinkingOptions,
				),
				"qwen3-coder-plus": createModel("Qwen3 Coder Plus"),
				"qwen3-coder-next": createModel("Qwen3 Coder Next"),
				"glm-4.7": createModel("GLM-4.7", defaultThinkingOptions),
				"kimi-k2.5": createModel(
					"Kimi K2.5",
					defaultThinkingOptions,
					"text+image",
				),
				"glm-5": createModel("GLM-5", defaultThinkingOptions),
				"MiniMax-M2.5": createModel("MiniMax M2.5", defaultThinkingOptions),
			},
		},
	};
}

export function buildMcpConfig(): Record<string, unknown> {
	return {
		context7: {
			type: "remote",
			url: "https://mcp.context7.com/mcp",
			headers: {
				CONTEXT7_API_KEY:
					process.env["CONTEXT7_API_KEY"] ?? "your-api-key-here",
			},
			enabled: true,
		},
		octocode: {
			type: "local",
			command: ["bunx", "--bun", "octocode-mcp@latest"],
			environment: {
				GITHUB_TOKEN: process.env["GITHUB_TOKEN"] ?? "your-api-key-here",
			},
			enabled: true,
		},
	};
}

function deepMerge(
	target: Record<string, unknown>,
	source: Record<string, unknown>,
): Record<string, unknown> {
	const result: Record<string, unknown> = { ...target };
	for (const key of Object.keys(source)) {
		if (
			source[key] &&
			typeof source[key] === "object" &&
			!Array.isArray(source[key]) &&
			result[key] &&
			typeof result[key] === "object" &&
			!Array.isArray(result[key])
		) {
			result[key] = deepMerge(
				result[key] as Record<string, unknown>,
				source[key] as Record<string, unknown>,
			);
		} else {
			result[key] = source[key];
		}
	}
	return result;
}

export function buildOpenCodeJsonc(): string {
	const config = {
		$schema: "https://opencode.ai/config.json",
		provider: buildBailianProviderConfig(),
		mcp: buildMcpConfig(),
	};
	return JSON.stringify(config, undefined, 2);
}

export function mergeProviderConfig(
	existing: Record<string, unknown>,
	bailianConfig: Record<string, unknown>,
): Record<string, unknown> {
	const existingProvider =
		(existing["provider"] as Record<string, unknown>) ?? {};
	const existingBailian = existingProvider["bailian-coding-plan"] as
		| Record<string, unknown>
		| undefined;
	if (existingBailian) {
		const existingModels =
			(existingBailian["models"] as Record<string, unknown>) ?? {};
		const newModels = (bailianConfig as Record<string, unknown>)[
			"models"
		] as Record<string, unknown>;
		const mergedModels = deepMerge(existingModels, newModels);

		const mergedProvider = {
			...existingProvider,
			"bailian-coding-plan": {
				...existingBailian,
				models: mergedModels,
			},
		};

		return { ...existing, provider: mergedProvider };
	}

	const mergedProvider = {
		...existingProvider,
		"bailian-coding-plan": (bailianConfig as Record<string, unknown>)[
			"bailian-coding-plan"
		],
	};

	return { ...existing, provider: mergedProvider };
}

export function mergeMcpConfig(
	existing: Record<string, unknown>,
	mcpConfig: Record<string, unknown>,
): Record<string, unknown> {
	const existingMcp = (existing["mcp"] as Record<string, unknown>) ?? {};
	if (Object.keys(existingMcp).length > 0) {
		return { ...existing, mcp: deepMerge(existingMcp, mcpConfig) };
	}

	return { ...existing, mcp: mcpConfig };
}

export function parseJsonc(text: string): Record<string, unknown> {
	const cleaned = text
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/\/\/.*$/gm, (match, offset, fullText) => {
			const preceding = fullText.slice(0, offset);
			const quoteCount = (preceding.match(/"/g) || []).length;
			if (quoteCount % 2 === 1) {
				return match;
			}
			return "";
		});
	return JSON.parse(cleaned) as Record<string, unknown>;
}

export function stringifyJsonc(obj: Record<string, unknown>): string {
	return JSON.stringify(obj, undefined, 2);
}
