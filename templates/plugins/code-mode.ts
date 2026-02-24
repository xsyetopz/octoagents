import type { Plugin } from "@opencode-ai/plugin";

/**
 * code-mode plugin
 *
 * Implements Cloudflare's "Code Mode" concept for OpenCode:
 * instead of relying on native tool-call tokens (which vary in quality
 * across model families), this plugin injects a TypeScript API declaration
 * block into the system prompt. Models — particularly Chinese frontier
 * models (DeepSeek, Qwen, GLM, Kimi) that excel at code — can then express
 * multi-step tool workflows as ordinary TypeScript rather than structured
 * JSON tool calls.
 *
 * Reference: https://blog.cloudflare.com/code-mode/
 */

const TOOL_API_TYPES = `<tool-api>
The following TypeScript declarations describe the tools available in this session.
When performing multi-step operations, you may express them as TypeScript pseudocode
using these signatures — the runtime will map function calls to actual tool invocations.

\`\`\`typescript
// File system
declare function read(path: string): Promise<string>;
declare function write(path: string, content: string): Promise<void>;
declare function edit(path: string, oldStr: string, newStr: string): Promise<void>;
declare function glob(pattern: string, cwd?: string): Promise<string[]>;
declare function grep(pattern: string, path?: string, options?: {
  type?: string;
  glob?: string;
  ignoreCase?: boolean;
}): Promise<Array<{ file: string; line: number; content: string }>>;

// Shell execution
declare function bash(command: string, timeout?: number): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
}>;

// Web
declare function webfetch(url: string, prompt: string): Promise<string>;
declare function websearch(query: string): Promise<string>;

// Agent delegation
declare function task(agent: string, prompt: string): Promise<string>;
\`\`\`

When writing code using these declarations:
- Prefer \`Promise.all\` for independent parallel operations
- Capture return values and use them in subsequent calls
- Handle file paths with forward slashes; use relative paths from project root
- Bash commands run in project root by default
</tool-api>`;

export const CodeMode: Plugin = () => {
	return Promise.resolve({
		"experimental.chat.system.transform": (_input, output) => {
			output.system.push(TOOL_API_TYPES);
			return Promise.resolve();
		},
	});
};
