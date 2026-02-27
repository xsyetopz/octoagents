import type { Plugin } from "@opencode-ai/plugin";

const DESTRUCTIVE_PATTERNS = [
	// --- Linux destructive patterns ---
	/^rm\s+-rf\s+\/\s*$/, // remove root directory
	/^rm\s+-rf\s+~\s*$/, // remove home directory
	/^rm\s+-rf\s+\*\s*$/, // remove all files in directory
	/^git\s+push\s+.*--force\s+.*main/, // force push to main
	/^git\s+push\s+.*--force\s+.*master/, // force push to master
	/:\(\)\{\s*:\|:&\s*\};:/, // fork bomb
	/^dd\s+if=\/dev\/zero/, // overwrite disk
	/^>\s*\/dev\/sd/, // overwrite block device
	/^mkfs\./, // format disk
	/^fdisk\s+\/dev\//, // partition disk

	// --- macOS destructive patterns ---
	/^diskutil\s+eraseDisk/, // erase disk
	/^sudo\s+rm\s+-rf\s+\/System/, // remove system directory
	/^sudo\s+rm\s+-rf\s+\/Library/, // remove library directory
	/^sudo\s+rm\s+-rf\s+\/Users/, // remove users directory

	// --- Windows destructive patterns ---
	/^del\s+\/f\s+\/s\s+\/q\s+C:\\/, // delete all files from `C:\`
	/^rd\s+\/s\s+\/q\s+C:\\/, // remove directory tree from `C:\`
	/^format\s+C:/i, // format C: drive
	/^bcdedit\s+\/deletevalue/, // delete boot configuration
	/^bootrec\s+\/fixmbr/, // overwrite MBR
	/^bootrec\s+\/fixboot/, // overwrite boot sector
	/^cipher\s+\/w:C:/i, // wipe free space on `C:\`
];

export const SafetyGuard: Plugin = () => {
	return Promise.resolve({
		"tool.execute.before": (input, output) => {
			if (input.tool === "bash") {
				const cmd = String(
					(output.args as Record<string, unknown>)?.["command"] ?? "",
				);
				for (const pattern of DESTRUCTIVE_PATTERNS) {
					if (pattern.test(cmd.trim())) {
						throw new Error(
							`[safety-guard] Blocked potentially destructive command: ${cmd}\n` +
								"If this is intentional, run it manually in your terminal.",
						);
					}
				}
			}
			return Promise.resolve();
		},
		"tool.execute.after": (input, _output) => {
			if (input.tool === "bash" || input.tool === "edit") {
				const args = input.args as Record<string, unknown>;
				const target =
					input.tool === "bash"
						? String(args?.["command"] ?? "").slice(0, 80)
						: String(args?.["filePath"] ?? "");
				console.error(`[safety-guard] ${input.tool}: ${target}`);
			}
			return Promise.resolve();
		},
	});
};
