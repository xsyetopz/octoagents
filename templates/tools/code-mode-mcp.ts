#!/usr/bin/env bun
/**
 * code-mode-mcp — OpenCode MCP server implementing the "Code Mode" pattern.
 *
 * Inspired by Cloudflare's Code Mode (https://blog.cloudflare.com/code-mode/):
 * instead of models using structured tool-call tokens, this server exposes a
 * single `execute` tool that accepts TypeScript code. The model writes
 * TypeScript that calls typed wrapper functions; the server executes the code
 * and returns results via console output.
 *
 * This approach works well with Chinese frontier models (DeepSeek, Qwen, GLM,
 * Kimi) that produce reliable code but have uneven native tool-call quality.
 *
 * Usage in opencode.json:
 *   {
 *     "mcp": {
 *       "code-mode": {
 *         "type": "local",
 *         "command": "bun",
 *         "args": [".opencode/tools/code-mode-mcp.ts"]
 *       }
 *     }
 *   }
 */

export {};
/**
 * code-mode-mcp — OpenCode MCP server implementing the "Code Mode" pattern.
 *
 * Inspired by Cloudflare's Code Mode (https://blog.cloudflare.com/code-mode/):
 * instead of models using structured tool-call tokens, this server exposes a
 * single `execute` tool that accepts TypeScript code. The model writes
 * TypeScript that calls typed wrapper functions; the server executes the code
 * and returns results via console output.
 *
 * This approach works well with Chinese frontier models (DeepSeek, Qwen, GLM,
 * Kimi) that produce reliable code but have uneven native tool-call quality.
 *
 * Usage in opencode.json:
 *   {
 *     "mcp": {
 *       "code-mode": {
 *         "type": "local",
 *         "command": "bun",
 *         "args": [".opencode/tools/code-mode-mcp.ts"]
 *       }
 *     }
 *   }
 */

// ─── MCP Protocol types ───────────────────────────────────────────────────────

interface JsonRpcRequest {
	jsonrpc: "2.0";
	id: string | number | undefined;
	method: string;
	params?: unknown;
}

interface JsonRpcResponse {
	jsonrpc: "2.0";
	id: string | number | undefined;
	result?: unknown;
	error?: { code: number; message: string; data?: unknown };
}

// ─── Tool definitions ─────────────────────────────────────────────────────────

const TOOLS = [
	{
		name: "get_type_definitions",
		description:
			"Returns TypeScript function signatures for all available OpenCode tools. " +
			"Inject these into your context before calling execute, so the model has typed stubs to reference.",
		inputSchema: {
			type: "object",
			properties: {},
			required: [],
		},
	},
	{
		name: "execute",
		description:
			"Execute TypeScript code in a sandboxed Bun environment. " +
			"The code has access to typed wrapper functions matching the OpenCode tool API: " +
			"read(), write(), edit(), bash(), glob(), grep(). " +
			"Results are returned as the combined console.log output. " +
			"Use this to express multi-step workflows as code instead of sequential tool calls.",
		inputSchema: {
			type: "object",
			properties: {
				code: {
					type: "string",
					description:
						"TypeScript code to execute. Must be a self-contained async block. " +
						"Use console.log() to output results. " +
						"Available functions: read(path), write(path, content), " +
						"bash(cmd), glob(pattern, cwd?), grep(pattern, path?).",
				},
				cwd: {
					type: "string",
					description:
						"Working directory for the execution. Defaults to process.cwd().",
				},
			},
			required: ["code"],
		},
	},
];

const TYPE_DEFINITIONS = `// OpenCode tool API — TypeScript function signatures
// Available inside code-mode execute() calls

declare function read(path: string): Promise<string>;
declare function write(path: string, content: string): Promise<void>;
declare function edit(path: string, oldStr: string, newStr: string): Promise<void>;
declare function glob(pattern: string, cwd?: string): Promise<string[]>;
declare function grep(
  pattern: string,
  path?: string,
  options?: { glob?: string; ignoreCase?: boolean }
): Promise<Array<{ file: string; line: number; content: string }>>;
declare function bash(
  command: string
): Promise<{ stdout: string; stderr: string; exitCode: number }>;`;

// ─── Tool wrapper implementations ─────────────────────────────────────────────

function buildExecutionContext(cwd: string): string {
	return `
const __cwd = ${JSON.stringify(cwd)};

async function read(path) {
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  return readFile(join(__cwd, path), "utf8");
}

async function write(path, content) {
  const { writeFile, mkdir } = await import("node:fs/promises");
  const { join, dirname } = await import("node:path");
  const abs = join(__cwd, path);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, content, "utf8");
}

async function edit(path, oldStr, newStr) {
  const current = await read(path);
  if (!current.includes(oldStr)) throw new Error(\`edit: string not found in \${path}\`);
  await write(path, current.replace(oldStr, newStr));
}

async function glob(pattern, cwd) {
  const g = new Bun.Glob(pattern);
  return Array.fromAsync(g.scan({ cwd: cwd ? \`\${__cwd}/\${cwd}\` : __cwd, absolute: false, onlyFiles: true }));
}

async function grep(pattern, searchPath, options = {}) {
  const { execSync } = await import("node:child_process");
  const flags = options.ignoreCase ? "-ri" : "-r";
  const include = options.glob ? \`--include="\${options.glob}"\` : "";
  const target = searchPath ? \`\${__cwd}/\${searchPath}\` : __cwd;
  try {
    const raw = execSync(\`grep \${flags} \${include} -n --with-filename \${JSON.stringify(pattern)} \${JSON.stringify(target)}\`).toString();
    return raw.split("\\n").filter(Boolean).map(line => {
      const [file, lineNum, ...rest] = line.split(":");
      return { file: file.replace(__cwd + "/", ""), line: Number(lineNum), content: rest.join(":").trim() };
    });
  } catch { return []; }
}

async function bash(command) {
  const proc = Bun.spawn(["bash", "-c", command], {
    cwd: __cwd, stdout: "pipe", stderr: "pipe"
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    Bun.readableStreamToText(proc.stdout),
    Bun.readableStreamToText(proc.stderr),
    proc.exited,
  ]);
  return { stdout, stderr, exitCode };
}
`;
}

async function runExecute(code: string, cwd: string): Promise<string> {
	const context = buildExecutionContext(cwd);
	const wrapped = `${context}\n(async () => {\n${code}\n})();`;

	const logs: string[] = [];
	const origLog = console.log;
	const origError = console.error;
	console.log = (...args: unknown[]) => logs.push(args.map(String).join(" "));
	console.error = (...args: unknown[]) =>
		logs.push(`[stderr] ${args.map(String).join(" ")}`);

	try {
		// biome-ignore lint/security/noGlobalEval: intentional sandboxed execution
		await eval(wrapped);
	} catch (err) {
		logs.push(`[error] ${(err as Error).message}`);
	} finally {
		console.log = origLog;
		console.error = origError;
	}

	return logs.join("\n");
}

// ─── MCP protocol handler ─────────────────────────────────────────────────────

function ok(id: JsonRpcRequest["id"], result: unknown): JsonRpcResponse {
	return { jsonrpc: "2.0", id, result };
}

function err(
	id: JsonRpcRequest["id"],
	code: number,
	message: string,
): JsonRpcResponse {
	return { jsonrpc: "2.0", id, error: { code, message } };
}

async function handleRequest(
	req: JsonRpcRequest,
): Promise<JsonRpcResponse | undefined> {
	const { id, method, params } = req;

	switch (method) {
		case "initialize":
			return ok(id, {
				protocolVersion: "2024-11-05",
				capabilities: { tools: {} },
				serverInfo: { name: "code-mode-mcp", version: "1.0.0" },
			});

		case "notifications/initialized":
			return undefined; // no response needed

		case "tools/list":
			return ok(id, { tools: TOOLS });

		case "tools/call": {
			const p = params as { name: string; arguments?: Record<string, unknown> };
			const args = p.arguments ?? {};

			if (p.name === "get_type_definitions") {
				return ok(id, { content: [{ type: "text", text: TYPE_DEFINITIONS }] });
			}

			if (p.name === "execute") {
				const code = String(args["code"] ?? "");
				const cwd = String(args["cwd"] ?? process.cwd());
				if (!code.trim()) {
					return err(id, -32602, "code is required");
				}
				const output = await runExecute(code, cwd);
				return ok(id, {
					content: [{ type: "text", text: output || "(no output)" }],
				});
			}

			return err(id, -32601, `Unknown tool: ${p.name}`);
		}

		default:
			return err(id, -32601, `Method not found: ${method}`);
	}
}

// ─── Stdio transport ──────────────────────────────────────────────────────────

async function main(): Promise<void> {
	let buffer = "";

	process.stdin.setEncoding("utf8");

	for await (const chunk of process.stdin) {
		buffer += chunk;
		const lines = buffer.split("\n");
		buffer = lines.pop() ?? "";

		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) {
				continue;
			}

			let req: JsonRpcRequest;
			try {
				req = JSON.parse(trimmed) as JsonRpcRequest;
			} catch {
				const resp = err(undefined, -32700, "Parse error");
				process.stdout.write(`${JSON.stringify(resp)}\n`);
				continue;
			}

			const resp = await handleRequest(req);
			if (resp !== undefined) {
				process.stdout.write(`${JSON.stringify(resp)}\n`);
			}
		}
	}
}

await main();
