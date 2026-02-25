#!/usr/bin/env bun
import { createInterface } from "node:readline";
import { detectProviders } from "./detect.ts";
import { install } from "./install.ts";
import { BUILT_IN_PLUGINS, DEFAULT_PLUGINS } from "./plugins.ts";
import type {
	InstallOptions,
	InstallScope,
	ProviderAvailability,
} from "./types.ts";

type ProviderTier = "chutes" | "copilot" | "free";

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
	if (next === "chutes" || next === "copilot" || next === "free") {
		state.provider = next;
		return i + 1;
	}
	throw new Error(
		`--provider requires "chutes", "copilot", or "free", got: ${String(next)}`,
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
		plugins: [...DEFAULT_PLUGINS],
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
		chutes: tier === "chutes",
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
	const answer = await promptLine(
		`Install to:\n  1) Current project  (.opencode/)\n  2) Global            (${defaultConfig})\n\n> `,
	);
	return answer === "2" ? "global" : "project";
}

async function promptProvider(): Promise<ProviderAvailability> {
	const answer = await promptLine(
		"Provider (used to select models):\n  1) Chutes AI       (CHUTES_API_KEY)\n  2) GitHub Copilot\n  3) Free built-ins\n\n> ",
	);
	return tierToProviders(
		answer === "1" ? "chutes" : answer === "2" ? "copilot" : "free",
	);
}

function printHelp(): void {
	const availablePlugins = Object.entries(BUILT_IN_PLUGINS)
		.map(([name, p]) => `    ${name.padEnd(20)} ${p.description}`)
		.join("\n");

	console.log(`OpenCode Agentic Framework Installer

Usage:
  install                         Prompt for location and provider
  install --scope project         Install to current project (.opencode/)
  install --scope global          Install to global config (respects XDG_CONFIG_HOME, defaults to ~/.config/opencode/)
  install --provider chutes       Use Chutes AI models (recommended)
  install --provider copilot      Use GitHub Copilot models
  install --provider free         Use free OpenCode built-in models
  install --clean                 Remove existing framework files and reinstall
  install --dry-run               Preview what would be written without writing
  install --no-overrides          Skip built-in agent overrides
  install --plugins <names>       Comma-separated plugin list (default: safety-guard)
  install --no-plugins            Disable all plugins

Provider auto-detection (runs when --provider is not set):
  Checks CHUTES_API_KEY env var and $XDG_CONFIG_HOME/opencode/opencode.json (or ~/.config/opencode/opencode.json).
  Falls back to free OpenCode models if no provider is detected.

Available plugins:
${availablePlugins}

Generated files:
  .opencode/
    agents/       11 agent .md files (7 overrides + 4 custom)
    commands/     9 command .md files
    skills/       8 skill directories
    plugins/      5 runtime plugin .ts files
    tools/        2 tool .ts files
    context/      CONTEXT.md template (edit to describe your project)`);
}

async function resolveProviders(
	provider: ProviderTier | undefined,
): Promise<ProviderAvailability> {
	if (provider) {
		return tierToProviders(provider);
	}
	const detected = await detectProviders();
	if (detected.chutes || detected.githubCopilot) {
		const tier = detected.chutes ? "chutes" : "copilot";
		console.log(`Detected provider: ${tier}`);
		return detected;
	}
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
		const report = await install(options);
		if (!options.dryRun) {
			console.log("\nInstalled successfully.\n");
			console.log("Model assignments:");
			for (const { role, model, tier } of report.agentAssignments) {
				console.log(`  ${role.padEnd(12)} ${model}  [${tier}]`);
			}
			if (report.plugins.length > 0) {
				console.log(`\nPlugins applied: ${report.plugins.join(", ")}`);
			}
		}
	} catch (err) {
		console.error(`Installation failed: ${(err as Error).message}`);
		process.exit(1);
	}
}

await main();
