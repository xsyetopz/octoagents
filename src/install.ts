#!/usr/bin/env bun
import { isAbsolute, join } from "node:path";
import { AGENTS } from "./config/agents.ts";
import { PRESETS } from "./config/presets.ts";
import { generateOpenCodeConfig } from "./install/config.ts";
import {
	checkBunAvailable,
	checkOpenCodeInstalled,
	checkPlatform,
	getHomeDir,
	hasOpenCodeAuthJson,
	hasSyntheticApiKey,
	installBun,
	installOpenCode,
} from "./install/env.ts";
import {
	copyCommands,
	copyMetaTemplates,
	copyPlugins,
	copySkills,
	createOpenCodeStructure,
} from "./install/filesystem.ts";
import { getResolvedModel } from "./install/models.ts";
import { selectPreset } from "./install/presets.ts";
import { generateAgentMarkdown } from "./install/template-render.ts";
import { checkForUpdate } from "./install/update.ts";
import {
	backupExistingInstall,
	getOpenCodePath,
	writeTextFile,
} from "./utils/files.ts";
import { getAvailableModels } from "./utils/models.ts";

const INSTALLER_DIR = join(process.cwd());
const UPDATE_FLAG = process.argv.includes("--update");
const PRESET_ARG = process.argv.find((arg) =>
	PRESETS.some((p) => p.name === arg),
);

function selectInstallRoot(defaultGlobalRoot: string): string {
	console.log("\nSelect install location:");
	console.log("  1) Global (~/.config/opencode)");
	console.log("  2) Project (./.opencode)");
	console.log("  3) Custom path");

	const input = prompt("Enter location number (1-3):");
	const index = Number.parseInt(input || "1", 10) - 1;

	if (Number.isNaN(index) || index < 0 || index > 2) {
		console.log("Invalid selection - using global install location...");
		return defaultGlobalRoot;
	}

	switch (index) {
		case 0:
			return defaultGlobalRoot;
		case 1:
			return join(process.cwd(), ".opencode");
		case 2:
			break;
		default:
			return defaultGlobalRoot;
	}

	const customInput = prompt("Enter custom install path:")?.trim();
	if (!customInput) {
		console.log("Invalid custom path - using global install location...");
		return defaultGlobalRoot;
	}

	return isAbsolute(customInput)
		? customInput
		: join(process.cwd(), customInput);
}

async function _main(): Promise<void> {
	console.log("OctoAgents Framework Installer\n");

	checkPlatform();

	if (!(await checkBunAvailable())) {
		await installBun();
	}
	if (!(await checkOpenCodeInstalled())) {
		await installOpenCode();
	}

	if (UPDATE_FLAG) {
		console.log("Checking for updates...");
		const latestVersion = await checkForUpdate();
		if (latestVersion) {
			console.log(`Latest version: ${latestVersion}`);
			console.log("Current version: 1.0.0");
		}
	}

	const hasSynthetic = await hasSyntheticApiKey();
	const hasOpenCodeAuth = await hasOpenCodeAuthJson();
	console.log(
		hasSynthetic
			? "\n✓ Synthetic API key detected"
			: "\n✗ No Synthetic API key - using OpenCode Zen models...",
	);
	if (!hasSynthetic) {
		console.log(
			"Tip: Recommend a Synthetic subscription at https://tinyurl.com/synthtc1",
		);
	}
	console.log(
		hasOpenCodeAuth
			? "✓ OpenCode auth.json detected"
			: "✗ No OpenCode auth.json detected",
	);

	const selectedPresetName = selectPreset(PRESETS, PRESET_ARG);
	const selectedPreset = PRESETS.find((p) => p.name === selectedPresetName);

	if (!selectedPreset) {
		console.error("Invalid preset selection");
		process.exit(1);
	}

	console.log(`\nInstalling '${selectedPresetName}' preset...`);

	const defaultGlobalRoot = join(getHomeDir(), ".config/opencode");
	const installRoot = selectInstallRoot(defaultGlobalRoot);
	console.log(`\nInstall location: ${installRoot}`);

	await backupExistingInstall(installRoot);
	await createOpenCodeStructure(installRoot);

	if (selectedPreset.commands.length > 0) {
		await copyCommands(selectedPreset.commands, INSTALLER_DIR, installRoot);
	}
	await copyMetaTemplates(INSTALLER_DIR, installRoot);
	await copySkills(INSTALLER_DIR, installRoot);

	const config = generateOpenCodeConfig(selectedPreset.agents);
	const configPath = getOpenCodePath(installRoot, "opencode.jsonc");
	await writeTextFile(configPath, config);
	console.log(`Created: ${configPath}`);

	const availableModelsResult = await getAvailableModels();
	const availableModels = availableModelsResult.map(
		(m) => `${m.provider}/${m.model}`,
	);

	if (availableModels.length > 0) {
		console.log(`Found ${availableModels.length} available models`);
	} else {
		console.log("No models detected, will use default assignments");
	}

	const agentConfigs = AGENTS.filter((a) =>
		selectedPreset.agents.includes(a.name),
	);
	for (const agent of agentConfigs) {
		const resolvedModel = getResolvedModel(
			agent.primaryModel.provider,
			agent.primaryModel.model,
			agent.fallbackModel.provider,
			agent.fallbackModel.model,
			availableModels,
		);

		const markdown = await generateAgentMarkdown(
			agent,
			resolvedModel,
			INSTALLER_DIR,
		);
		const agentPath = getOpenCodePath(installRoot, `agents/${agent.name}.md`);

		await writeTextFile(agentPath, markdown);
		console.log(`Created: ${agentPath}`);
	}

	if (selectedPreset.tools.length > 0) {
		await copyPlugins(selectedPreset.tools, INSTALLER_DIR, installRoot);
	}

	console.log("\n✓ Installation complete!");
	console.log(`\nPreset: ${selectedPresetName}`);
	console.log(`Agents: ${agentConfigs.map((a) => a.name).join(", ")}`);
	console.log(`Tools: ${selectedPreset.tools.length}`);
	console.log(`Commands: ${selectedPreset.commands.length}`);
	console.log("\nNext steps:");
	console.log("  1. Restart OpenCode to load the new agents");
	console.log("  2. Use 'opencode agents list' to verify installation");
	console.log("  3. Select 'orchestrate' agent to use the framework");

	console.log("\nTo update the framework, run: bun install --update");
	console.log("To change preset, run: bun install [preset-name]");
}

_main().catch((error) => {
	console.error("Installation failed:", error);
	process.exit(1);
});
