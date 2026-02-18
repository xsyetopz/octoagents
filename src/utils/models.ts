import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export interface ParsedModel {
	provider: string;
	model: string;
}

export async function getAvailableModels(): Promise<ParsedModel[]> {
	try {
		const { stdout } = await execAsync("opencode models");
		const models: ParsedModel[] = [];

		const lines = stdout.split("\n");
		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("krystian@")) {
				continue;
			}

			const parts = trimmed.split("/");
			if (parts.length >= 2 && parts[0]) {
				models.push({
					provider: parts[0],
					model: parts.slice(1).join("/"),
				});
			}
		}

		return models;
	} catch (error) {
		console.warn("Failed to get available models:", error);
		return [];
	}
}

export function isModelAvailable(
	available: ParsedModel[],
	provider: string,
	model: string,
): boolean {
	const fullModel = `${provider}/${model}`;
	return available.some((m) => `${m.provider}/${m.model}` === fullModel);
}

export function findBestModel(
	available: ParsedModel[],
	preferred: { provider: string; model: string },
	fallbacks: { provider: string; model: string }[],
): { provider: string; model: string } | undefined {
	if (isModelAvailable(available, preferred.provider, preferred.model)) {
		return preferred;
	}

	for (const fallback of fallbacks) {
		if (isModelAvailable(available, fallback.provider, fallback.model)) {
			return fallback;
		}
	}

	return undefined;
}
