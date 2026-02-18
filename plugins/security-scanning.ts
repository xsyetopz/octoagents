import { exec } from "node:child_process";
import { constants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { tool } from "@opencode-ai/plugin";

const execAsync = promisify(exec);

async function _checkSemgrep(): Promise<boolean> {
	try {
		await execAsync("which semgrep");
		return true;
	} catch (_error) {
		console.debug("Semgrep not found in PATH");
		return false;
	}
}

async function _installSemgrep(): Promise<void> {
	console.log("Installing semgrep...");
	try {
		await execAsync("brew install semgrep");
		console.log("Semgrep installed successfully");
	} catch (error) {
		console.error(
			`Failed to install semgrep via brew: ${error instanceof Error ? error.message : String(error)}`,
		);
		console.log(
			"Please install manually: https://semgrep.dev/docs/getting-started/",
		);
	}
}

async function _executeSemgrepScan(
	args: { rules?: string; config?: string },
	context: { directory: string },
): Promise<unknown> {
	const hasSemgrep = await _checkSemgrep();
	if (!hasSemgrep) {
		await _installSemgrep();
	}

	try {
		const rules = args.rules || "auto";
		const config = args.config || "";

		let command = `cd ${context.directory as string} && semgrep --json`;

		if (config) {
			command += ` --config ${config}`;
		} else if (rules === "auto") {
			command += " --config auto";
		} else {
			command += ` --config ${rules}`;
		}

		const result = await execAsync(command);
		const output = result.stdout;

		if (!output) {
			return {
				findings_count: 0,
				findings: [],
			};
		}

		const findings = JSON.parse(output);

		return {
			findings_count: findings.results?.length || 0,
			findings: findings.results || [],
			errors: findings.errors || [],
		};
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

async function _checkNpmAudit(
	findings: Array<{ file: string; issue: string; severity: string }>,
	directory: string,
): Promise<void> {
	try {
		const auditResult = await execAsync(`cd ${directory} && npm audit --json`);
		const audit = JSON.parse(auditResult.stdout);

		if (audit.vulnerabilities) {
			for (const [name, vuln] of Object.entries(audit.vulnerabilities)) {
				const v = vuln as { severity: string; via: unknown[] };
				findings.push({
					file: "package.json",
					issue: `Vulnerable dependency: ${name} (${v.severity})`,
					severity: v.severity,
				});
			}
		}
	} catch (auditError) {
		console.debug(
			`npm audit failed: ${auditError instanceof Error ? auditError.message : String(auditError)}`,
		);
	}
}

async function _checkHardcodedSecrets(
	findings: Array<{ file: string; issue: string; severity: string }>,
	directory: string,
): Promise<void> {
	const secretPatterns = [
		/api[_-]?key\s*[=:]\s*['"][^'"]+['"]/gi,
		/secret[_-]?key\s*[=:]\s*['"][^'"]+['"]/gi,
		/password\s*[=:]\s*['"][^'"]+['"]/gi,
		/token\s*[=:]\s*['"][^'"]+['"]/gi,
	];

	const { glob } = await import("glob");
	const files = await glob("**/*.{ts,js,py,go,rs,java,rb,php,env}", {
		cwd: directory,
	});

	for (const file of files) {
		if (file.includes("node_modules") || file.includes(".git")) {
			continue;
		}

		try {
			const filePath = join(directory, file);
			const content = await readFile(filePath, "utf-8");
			const lines = content.split("\n");

			for (let i = 0; i < lines.length; i++) {
				_checkLineForSecrets(lines[i], file, i, secretPatterns, findings);
			}
		} catch (readError) {
			console.debug(
				`Cannot read file ${file}: ${readError instanceof Error ? readError.message : String(readError)}`,
			);
		}
	}
}

function _checkLineForSecrets(
	line: string,
	file: string,
	lineNum: number,
	patterns: RegExp[],
	findings: Array<{ file: string; issue: string; severity: string }>,
): void {
	for (const pattern of patterns) {
		if (pattern.test(line)) {
			findings.push({
				file: `${file}:${lineNum + 1}`,
				issue: "Possible hardcoded secret detected",
				severity: "high",
			});
		}
		pattern.lastIndex = 0;
	}
}

async function _executeDependencyCheck(
	_args: Record<string, unknown>,
	context: { directory: string },
): Promise<unknown> {
	const findings: Array<{
		file: string;
		issue: string;
		severity: string;
	}> = [];

	try {
		const pkgPath = join(context.directory, "package.json");
		try {
			await access(pkgPath, constants.F_OK);
			await _checkNpmAudit(findings, context.directory);
		} catch (_accessErr) {
			console.debug("No package.json found for dependency check");
		}

		await _checkHardcodedSecrets(findings, context.directory);

		return {
			findings_count: findings.length,
			findings: findings.slice(0, 100),
		};
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

async function _executeSecurityHeaders(
	args: { url: string },
	_context: Record<string, unknown>,
): Promise<unknown> {
	try {
		const response = await fetch(args.url, { method: "HEAD" });

		const securityHeaders = {
			"content-security-policy": response.headers.get(
				"content-security-policy",
			),
			"strict-transport-security": response.headers.get(
				"strict-transport-security",
			),
			"x-frame-options": response.headers.get("x-frame-options"),
			"x-content-type-options": response.headers.get("x-content-type-options"),
			"x-xss-protection": response.headers.get("x-xss-protection"),
			"referrer-policy": response.headers.get("referrer-policy"),
			"permissions-policy": response.headers.get("permissions-policy"),
		};

		const missing = Object.entries(securityHeaders)
			.filter(([_, value]) => !value)
			.map(([key, _]) => key);

		return {
			url: args.url,
			headers: securityHeaders,
			missing_headers: missing,
			security_score: ((7 - missing.length) / 7) * 100,
		};
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

async function _executePermissionCheck(
	args: { target: string },
	context: { directory: string },
): Promise<unknown> {
	const issues: Array<{
		file: string;
		permissions: string;
		issue: string;
	}> = [];

	try {
		const { glob } = await import("glob");
		const files = await glob(args.target, { cwd: context.directory });

		for (const file of files) {
			const filePath = join(context.directory, file);
			await _checkFilePermissions(filePath, file, issues);
		}
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : String(error),
		};
	}

	return {
		issues_count: issues.length,
		issues,
	};
}

async function _checkFilePermissions(
	filePath: string,
	file: string,
	issues: Array<{ file: string; permissions: string; issue: string }>,
): Promise<void> {
	try {
		const { stat } = await import("node:fs/promises");
		const stats = await stat(filePath);
		const perms = (stats.mode & 0o777).toString(8);

		if (perms.endsWith("6") || perms.endsWith("7")) {
			issues.push({
				file,
				permissions: perms,
				issue: "World-writable file detected",
			});
		}

		const isScript = file.endsWith(".sh") || file.endsWith(".exe");
		const isExecutable = perms.startsWith("7") || perms.includes("5");
		if (!isScript && isExecutable) {
			issues.push({
				file,
				permissions: perms,
				issue: "Unexpected executable permissions",
			});
		}
	} catch (statError) {
		console.debug(
			`Cannot stat file ${filePath}: ${statError instanceof Error ? statError.message : String(statError)}`,
		);
	}
}

function _createSemgrepScanTool() {
	return {
		description:
			"Run Semgrep static analysis to detect security vulnerabilities, bugs, and code quality issues",
		args: {
			rules: tool.schema
				.string()
				.optional()
				.describe(
					'Rule set to use (e.g., "auto", "p/security-audit", "p/owasp-top-ten")',
				),
			config: tool.schema
				.string()
				.optional()
				.describe("Path to custom Semgrep config file"),
		},
		async execute(
			args: Record<string, unknown>,
			context: Record<string, unknown>,
		) {
			try {
				const result = await _executeSemgrepScan(
					args as never,
					context as never,
				);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

function _createDependencyCheckTool() {
	return {
		description:
			"Check for vulnerable dependencies and hardcoded secrets in code",
		args: {},
		async execute(
			_args: Record<string, unknown>,
			context: Record<string, unknown>,
		) {
			try {
				const result = await _executeDependencyCheck(_args, context as never);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

function _createSecurityHeadersTool() {
	return {
		description:
			"Check HTTP security headers for a URL to identify missing security configurations",
		args: {
			url: tool.schema
				.string()
				.describe("URL to check (must be publicly accessible)"),
		},
		async execute(
			args: Record<string, unknown>,
			context: Record<string, unknown>,
		) {
			try {
				const result = await _executeSecurityHeaders(
					args as never,
					context as never,
				);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

function _createPermissionCheckTool() {
	return {
		description:
			"Check file permissions for security issues (world-writable, unexpected executables)",
		args: {
			target: tool.schema
				.string()
				.default("**/*")
				.describe('File pattern to check (e.g., "**/*.sh", "src/**")'),
		},
		async execute(
			args: Record<string, unknown>,
			context: Record<string, unknown>,
		) {
			try {
				const result = await _executePermissionCheck(
					args as never,
					context as never,
				);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

// biome-ignore lint/style/noDefaultExport: OpenCode plugin loader expects default export
export default function securityScanning(_ctx: Record<string, unknown>) {
	return {
		tool: {
			"security.semgrep-scan": _createSemgrepScanTool(),
			"security.dependency-check": _createDependencyCheckTool(),
			"security.headers-check": _createSecurityHeadersTool(),
			"security.permission-check": _createPermissionCheckTool(),
		},
	};
}
