#!/usr/bin/env bun
import { createInterface } from "node:readline";
import { install } from "./install.ts";
import { BUILT_IN_PLUGINS, DEFAULT_PLUGINS } from "./plugins.ts";
import type { InstallOptions, InstallScope } from "./types.ts";

interface ParseState {
	scope: InstallScope | undefined;
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

function parseArgs(
	argv: string[],
): Omit<InstallOptions, "scope"> & { scope: InstallScope | undefined } {
	const args = argv.slice(2);
	const state: ParseState = {
		scope: undefined,
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

function promptScope(): Promise<InstallScope> {
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	return new Promise<InstallScope>((resolve) => {
		rl.question(
			"Install to:\n  1) Current project  (.opencode/)\n  2) Global            (~/.config/opencode/)\n\n> ",
			(answer) => {
				rl.close();
				resolve(answer.trim() === "2" ? "global" : "project");
			},
		);
	});
}

function printHelp(): void {
	const availablePlugins = Object.entries(BUILT_IN_PLUGINS)
		.map(([name, p]) => `    ${name.padEnd(20)} ${p.description}`)
		.join("\n");

	console.log(`OpenCode Agentic Framework Installer

Usage:
  install                         Prompt for install location
  install --scope project         Install to current project (.opencode/)
  install --scope global          Install to ~/.config/opencode/
  install --clean                 Remove existing framework files and reinstall
  install --dry-run               Preview what would be written without writing
  install --no-overrides          Skip built-in agent overrides
  install --plugins <names>       Comma-separated plugin list (default: safety-guard)
  install --no-plugins            Disable all plugins

Available plugins:
${availablePlugins}

Provider detection (automatic):
  - SYNTHETIC_API_KEY or synthetic key in opencode.json → Synthetic models
  - GitHub Copilot credentials → github-copilot/gpt-5-mini fallback
  - Otherwise → free OpenCode built-in models

Generated files:
  .opencode/
    agents/       11 agent .md files (7 overrides + 4 custom)
    commands/     9 command .md files
    skills/       8 skill directories
    plugins/      4 runtime plugin .ts files
    tools/        1 custom tool .ts file
    context/      CONTEXT.md template (edit to describe your project)`);
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
	const options: InstallOptions = { ...parsed, scope };

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
