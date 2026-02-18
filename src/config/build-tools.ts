import { C_CPP_TOOLS } from "./build-tools/c-cpp.ts";
import { DOTNET_TOOLS } from "./build-tools/dotnet.ts";
import { FUNCTIONAL_TOOLS } from "./build-tools/functional.ts";
import { GO_TOOLS } from "./build-tools/go.ts";
import { JAVASCRIPT_TOOLS } from "./build-tools/javascript.ts";
import { JVM_TOOLS } from "./build-tools/jvm.ts";
import { MISC_TOOLS } from "./build-tools/misc.ts";
import { PHP_TOOLS } from "./build-tools/php.ts";
import { PYTHON_TOOLS } from "./build-tools/python.ts";
import { RUBY_TOOLS } from "./build-tools/ruby.ts";
import { RUST_TOOLS } from "./build-tools/rust.ts";
import { SWIFT_TOOLS } from "./build-tools/swift.ts";
import type { BuildTool } from "./build-tools/types.ts";

export type { BuildTool } from "./build-tools/types.ts";

export const BUILD_TOOLS: BuildTool[] = [
	...PYTHON_TOOLS,
	...C_CPP_TOOLS,
	...JVM_TOOLS,
	...DOTNET_TOOLS,
	...JAVASCRIPT_TOOLS,
	...RUST_TOOLS,
	...GO_TOOLS,
	...SWIFT_TOOLS,
	...RUBY_TOOLS,
	...PHP_TOOLS,
	...FUNCTIONAL_TOOLS,
	...MISC_TOOLS,
];

export async function detectBuildTool(
	projectPath: string,
): Promise<BuildTool | undefined> {
	try {
		const { exec } = await import("node:child_process");
		const { promisify } = await import("node:util");
		const execAsync = promisify(exec);
		const { stdout } = await execAsync(`ls ${projectPath}`);
		const files = stdout.split("\n");
		const filesLower = files.map((f: string) => f.toLowerCase());

		for (const tool of BUILD_TOOLS) {
			for (const lockFile of tool.lockFiles) {
				if (
					files.includes(lockFile) ||
					filesLower.includes(lockFile.toLowerCase())
				) {
					return tool;
				}
			}
			for (const configFile of tool.configFiles) {
				if (files.includes(configFile)) {
					return tool;
				}
			}
		}

		return undefined;
	} catch (_err) {
		// Return undefined if directory listing fails
		return undefined;
	}
}

export function getLanguageTool(language: string): BuildTool | undefined {
	const langLower = language.toLowerCase();
	return (
		BUILD_TOOLS.find((tool) =>
			tool.languages.some((l) => l.toLowerCase() === langLower),
		) ?? undefined
	);
}
