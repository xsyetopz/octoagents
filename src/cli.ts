#!/usr/bin/env bun
import { createInterface } from "node:readline";
import { detectProviders } from "./detect.ts";
import { install } from "./install.ts";
import type {
	InstallOptions,
	InstallScope,
	ProviderAvailability,
} from "./types.ts";

type ProviderTier = "bailian" | "copilot" | "free";

interface ParseState {
	scope: InstallScope | undefined;
	provider: ProviderTier | undefined;
	clean: boolean;
	dryRun: boolean;
	noOverrides: boolean;
	plugins: string[];
}

type ArgHandler = (args: string[], i: number, state: ParseState) => number;

function parseScopeArg(args: string[], i: number, state: ParseState): number {
	const next = args[i + 1];
	if (next === "project" || next === "global") {
		state.scope = next;
		return i + 1;
	}
	throw new Error(
		`--scope requires "project" or "global", got: ${String(next)}`,
	);
}

function parseProviderArg(
	args: string[],
	i: number,
	state: ParseState,
): number {
	const next = args[i + 1];
	if (next === "bailian" || next === "copilot" || next === "free") {
		state.provider = next;
		return i + 1;
	}
	throw new Error(
		`--provider requires "bailian", "copilot", or "free", got: ${String(next)}`,
	);
}

function parsePluginsArg(args: string[], i: number, state: ParseState): number {
	const next = args[i + 1];
	if (!next || next.startsWith("--")) {
		throw new Error(
			"--plugins requires a comma-separated list of plugin names",
		);
	}
	state.plugins = next
		.split(",")
		.map((p) => p.trim())
		.filter((p) => p.length > 0);
	return i + 1;
}

const FLAG_HANDLERS: Record<string, ArgHandler> = {
	"--scope": parseScopeArg,
	"--provider": parseProviderArg,
	"--plugins": parsePluginsArg,
	"--clean": (_a, i, s) => {
		s.clean = true;
		return i;
	},
	"--dry-run": (_a, i, s) => {
		s.dryRun = true;
		return i;
	},
	"--no-overrides": (_a, i, s) => {
		s.noOverrides = true;
		return i;
	},
	"--no-plugins": (_a, i, s) => {
		s.plugins = [];
		return i;
	},
	"--help": () => {
		printHelp();
		process.exit(0);
	},
	"-h": () => {
		printHelp();
		process.exit(0);
	},
};

function parseArgs(argv: string[]): Omit<
	InstallOptions,
	"scope" | "providers"
> & {
	scope: InstallScope | undefined;
	provider: ProviderTier | undefined;
} {
	const args = argv.slice(2);
	const state: ParseState = {
		scope: undefined,
		provider: undefined,
		clean: false,
		dryRun: false,
		noOverrides: false,
		plugins: [],
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i] ?? "";
		const handler = FLAG_HANDLERS[arg];
		if (!handler) {
			throw new Error(`Unknown argument: ${arg}`);
		}
		i = handler(args, i, state);
	}

	return state;
}

function tierToProviders(tier: ProviderTier): ProviderAvailability {
	return {
		bailianCodingPlan: tier === "bailian",
		githubCopilot: tier === "copilot",
	};
}

function promptLine(question: string): Promise<string> {
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	return new Promise<string>((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
}

async function promptScope(): Promise<InstallScope> {
	const configHome = process.env["XDG_CONFIG_HOME"];
	const defaultConfig = configHome
		? `${configHome}/opencode`
		: "~/.config/opencode";

	console.log("\nSelect installation scope:");
	console.log("  [1] Project  - Current workspace only (.opencode/)");
	console.log(`  [2] Global   - All projects (${defaultConfig})`);
	console.log();

	const answer = await promptLine("> ");
	return answer === "2" ? "global" : "project";
}

async function promptProvider(): Promise<ProviderAvailability> {
	console.log("\nSelect provider:");
	console.log("  [1] Bailian Coding Plan  - DASHSCOPE_API_KEY (recommended)");
	console.log("  [2] GitHub Copilot       - GitHub credentials");
	console.log("  [3] OpenCode Zen (Free)  - No API key needed");
	console.log();

	const answer = await promptLine("> ");
	const tier = answer === "1" ? "bailian" : answer === "2" ? "copilot" : "free";
	return tierToProviders(tier);
}

function printHelp(): void {
	console.log(`OpenCode Agentic Framework Installer

Usage:
  install                         Interactive installation
  install --scope project         Install to current project (.opencode/)
  install --scope global          Install to ~/.config/opencode/
  install --provider bailian      Use Bailian Coding Plan models
  install --provider copilot      Use GitHub Copilot models
  install --provider free         Use free OpenCode Zen models
  install --clean                 Remove existing and reinstall
  install --dry-run               Preview without writing
  install --no-overrides          Skip agent overrides

`);
}

async function resolveProviders(
	provider: ProviderTier | undefined,
): Promise<ProviderAvailability> {
	if (provider) {
		return tierToProviders(provider);
	}

	const detected = await detectProviders();
	if (detected.bailianCodingPlan) {
		console.log("\nDetected: Bailian Coding Plan (DASHSCOPE_API_KEY found)");
		return detected;
	}
	if (detected.githubCopilot) {
		console.log("\nDetected: GitHub Copilot (credentials found)");
		return detected;
	}

	console.log("\nNo provider detected.");
	return promptProvider();
}

async function main(): Promise<void> {
	let parsed: ReturnType<typeof parseArgs>;
	try {
		parsed = parseArgs(process.argv);
	} catch (err) {
		console.error(`Error: ${(err as Error).message}`);
		console.error("Run with --help for usage information.");
		process.exit(1);
	}

	const scope = parsed.scope ?? (await promptScope());
	const providers = await resolveProviders(parsed.provider);

	const options: InstallOptions = { ...parsed, scope, providers };

	try {
		console.log("\nInstalling...");
		const report = await install(options);

		if (!parsed.dryRun) {
			console.log("\nInstalled successfully.\n");
			console.log("Model assignments:");
			for (const { role, model, tier } of report.agentAssignments) {
				console.log(`  ${role.padEnd(12)} ${model.padEnd(45)} [${tier}]`);
			}
		}
	} catch (err) {
		console.error(`Installation failed: ${(err as Error).message}`);
		process.exit(1);
	}
}

await main();
