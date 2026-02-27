import type { Plugin } from "@opencode-ai/plugin";

const DESTRUCTIVE_PATTERNS = [
	/^rm\s+-rf\s+\/\s*$/,
	/^rm\s+-rf\s+~\s*$/,
	/^rm\s+-rf\s+\*\s*$/,
	/:\(\)\{\s*:\|:&\s*\};:/,
	/^dd\s+if=\/dev\/zero/,
	/^>\s*\/dev\/sd/,
	/^mkfs\./,
	/^fdisk\s+\/dev\//,
	/^diskutil\s+eraseDisk/,
	/^sudo\s+rm\s+-rf\s+\/System/,
	/^sudo\s+rm\s+-rf\s+\/Library/,
	/^sudo\s+rm\s+-rf\s+\/Users/,
	/^del\s+\/f\s+\/s\s+\/q\s+C:\\/,
	/^rd\s+\/s\s+\/q\s+C:\\/,
	/^format\s+C:/i,
	/^bcdedit\s+\/deletevalue/,
	/^bootrec\s+\/fixmbr/,
	/^bootrec\s+\/fixboot/,
	/^cipher\s+\/w:C:/i,
];

const GIT_RESTRICTED_PATTERNS = [
	/^git\s+commit/,
	/^git\s+push/,
	/^git\s+add/,
	/^git\s+reset\s+--hard/,
	/^git\s+push\s+.*--force/,
];

const SECRET_FILE_PATTERNS = [
	/\.env$/i,
	/\.env\./i,
	/\.pem$/i,
	/\.key$/i,
	/private\.key$/i,
	/id_rsa$/i,
	/id_ed25519$/i,
	/\.p12$/i,
	/\.pfx$/i,
	/credentials\.json$/i,
	/secrets\.json$/i,
	/secrets\.ya?ml$/i,
	/service-account\.json$/i,
	/aws_credentials$/i,
	/\.aws\/credentials$/i,
	/\.?_?netrc$/i,
];

const SECRET_OUTPUT_PATTERNS = [
	/\b(api[_-]?key|apikey)\s*[=:]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?/gi,
	/\b(secret[_-]?key|secretkey)\s*[=:]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?/gi,
	/\bAKIA[0-9A-Z]{16}\b/g,
	/\bgh[pousr]_[a-zA-Z0-9]{36}\b/g,
	/-----BEGIN\s+(RSA\s+|OPENSSH\s+|EC\s+)?PRIVATE\s+KEY-----/g,
	/\b(bearer|token)\s+[a-zA-Z0-9_-]+\b/gi,
	/\bpassw?ord?\s*[=:]\s*['"]?[^'"\s]+['"]?/gi,
];

function redactSecrets(text: string): string {
	let result = text;
	for (const pattern of SECRET_OUTPUT_PATTERNS) {
		result = result.replace(pattern, "[已隐藏]");
	}
	return result;
}

function isSecretFile(path: string): boolean {
	return SECRET_FILE_PATTERNS.some((pattern) => pattern.test(path));
}

function checkBashCommand(cmd: string): void {
	const trimmed = cmd.trim();

	for (const pattern of DESTRUCTIVE_PATTERNS) {
		if (pattern.test(trimmed)) {
			throw new Error(
				`[safety-guard] 已阻止潜在的破坏性命令：${cmd}\n` +
					"如确需执行，请在终端中手动运行。",
			);
		}
	}
	for (const pattern of GIT_RESTRICTED_PATTERNS) {
		if (pattern.test(trimmed)) {
			throw new Error(
				`[safety-guard] Git操作必须手动执行：${cmd}\n` +
					"Git commit、push 和 add 操作需要用户明确操作。",
			);
		}
	}
}

function checkFileRead(filePath: string): void {
	if (isSecretFile(filePath)) {
		throw new Error(
			`[safety-guard] 已阻止读取密钥文件：${filePath}\n` +
				"密钥文件禁止被代理读取。请使用环境变量代替。",
		);
	}
}

export const SafetyGuard: Plugin = () => {
	return Promise.resolve({
		"tool.execute.before": (input, output) => {
			const args = output.args as Record<string, unknown>;

			if (input.tool === "bash") {
				checkBashCommand(String(args?.["command"] ?? ""));
			}
			if (input.tool === "read") {
				checkFileRead(String(args?.["filePath"] ?? ""));
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

		"experimental.chat.response.transform": (_input, output) => {
			if (typeof output.response === "string") {
				output.response = redactSecrets(output.response);
			} else if (output.response && typeof output.response === "object") {
				const content = (output.response as Record<string, unknown>).content;
				if (typeof content === "string") {
					(output.response as Record<string, unknown>).content =
						redactSecrets(content);
				}
			}
			return Promise.resolve();
		},
	});
};
