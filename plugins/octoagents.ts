import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, "../templates");

function _findOpenCodeDir(): string {
	const projectLocal = join(process.cwd(), ".opencode");
	if (existsSync(projectLocal)) {
		return projectLocal;
	}

	const globalDir = join(homedir(), ".config/opencode");
	if (existsSync(globalDir)) {
		return globalDir;
	}

	return globalDir;
}

function _getAgentsDir(): string {
	return join(_findOpenCodeDir(), "agents");
}

function _getCommandsDir(): string {
	return join(_findOpenCodeDir(), "commands");
}

function _getToolsDir(): string {
	return join(_findOpenCodeDir(), "tools");
}

function _loadTemplate(
	category: "agents" | "commands" | "tools",
	name: string,
): string {
	const mdPath = join(TEMPLATES_DIR, category, `${name}.md`);
	if (existsSync(mdPath)) {
		return readFileSync(mdPath, "utf-8");
	}

	const tsPath = join(TEMPLATES_DIR, category, `${name}.ts`);
	if (existsSync(tsPath)) {
		return readFileSync(tsPath, "utf-8");
	}

	const txtPath = join(TEMPLATES_DIR, category, `${name}.ts.txt`);
	if (existsSync(txtPath)) {
		return readFileSync(txtPath, "utf-8");
	}

	throw new Error(`Template not found: ${mdPath}, ${tsPath}, or ${txtPath}`);
}

function _substituteTemplate(
	template: string,
	vars: Record<string, string>,
): string {
	let output = template;
	for (const [key, value] of Object.entries(vars)) {
		output = output.replace(new RegExp(`{{${key}}}`, "g"), value);
	}
	output = output.replace(/{{#if \w+}}[\s\S]*?{{\/if}}/g, "");
	return output;
}

function _listAgents(): string[] {
	const agentsDir = _getAgentsDir();
	if (!existsSync(agentsDir)) {
		return [];
	}
	return readdirSync(agentsDir)
		.filter((f) => f.endsWith(".md"))
		.map((f) => f.replace(".md", ""));
}

function _getAgentContent(name: string): string | null {
	const agentPath = join(_getAgentsDir(), `${name}.md`);
	if (!existsSync(agentPath)) {
		return null;
	}
	return readFileSync(agentPath, "utf-8");
}

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---/;
const DESCRIPTION_REGEX = /description:\s*"(.*)"/;
const MODE_REGEX = /mode:\s*(\S+)/;
const MODEL_REGEX = /model:\s*(\S+)/;
const TEMPERATURE_PATTERN = /temperature:\s*(\S+)/;
const STEPS_REGEX = /steps:\s*(\d+)/;
const COLOR_REGEX = /color:\s*"(.*)"/;
const TOP_P_REGEX = /top_p:\s*(\S+)/;

function _parseAgentFrontmatter(content: string): Record<string, unknown> {
	const match = content.match(FRONTMATTER_REGEX);
	if (!match) {
		return {};
	}

	const frontmatter: Record<string, unknown> = {};
	const yamlContent = match[1];

	const descMatch = yamlContent.match(DESCRIPTION_REGEX);
	if (descMatch) {
		frontmatter.description = descMatch[1];
	}

	const modeMatch = yamlContent.match(MODE_REGEX);
	if (modeMatch) {
		frontmatter.mode = modeMatch[1];
	}

	const modelMatch = yamlContent.match(MODEL_REGEX);
	if (modelMatch) {
		frontmatter.model = modelMatch[1];
	}

	const tempMatch = yamlContent.match(TEMPERATURE_PATTERN);
	if (tempMatch) {
		frontmatter.temperature = Number.parseFloat(tempMatch[1]);
	}

	const stepsMatch = yamlContent.match(STEPS_REGEX);
	if (stepsMatch) {
		frontmatter.steps = Number.parseInt(stepsMatch[1], 10);
	}

	const colorMatch = yamlContent.match(COLOR_REGEX);
	if (colorMatch) {
		frontmatter.color = colorMatch[1];
	}

	const topPMatch = yamlContent.match(TOP_P_REGEX);
	if (topPMatch) {
		frontmatter.top_p = Number.parseFloat(topPMatch[1]);
	}

	return frontmatter;
}

const _octoListTool = {
	description: "List all installed OctoAgents",
	parameters: {
		type: "object",
		properties: {},
		required: [],
	},
	execute(): string {
		const agents = _listAgents();
		if (agents.length === 0) {
			return "No agents installed. Run install.sh to install OctoAgents.";
		}
		return `Installed agents (${agents.length}):\n${agents.map((a) => `  - ${a}`).join("\n")}`;
	},
};

const _octoShowTool = {
	description: "Show agent configuration and details",
	parameters: {
		type: "object",
		properties: {
			agent: {
				type: "string",
				description: "Agent name to show",
			},
			format: {
				type: "string",
				enum: ["full", "config"],
				description:
					"Output format: 'full' (entire markdown) or 'config' (frontmatter only)",
			},
		},
		required: ["agent"],
	},
	execute(args: { agent: string; format?: string }): string {
		const { agent, format = "full" } = args;
		const content = _getAgentContent(agent);

		if (content === null) {
			const available = _listAgents();
			return `Agent '${agent}' not found.\n\nAvailable agents:\n${available.map((a) => `  - ${a}`).join("\n")}`;
		}

		if (format === "config") {
			const config = _parseAgentFrontmatter(content);
			return `Configuration for ${agent}:\n${JSON.stringify(config, null, 2)}`;
		}

		return content;
	},
};

const AGENTSMD_RULES_REGEX =
	/^# Global Agent Rules[\s\S]*?<rules priority="absolute" override="all">/;

const _octoCreateAgentTool = {
	description: "Create a new OpenCode agent",
	parameters: {
		type: "object",
		properties: {
			name: {
				type: "string",
				description: "Agent name (lowercase-with-dashes)",
			},
			description: {
				type: "string",
				description: "Brief description of agent's purpose",
			},
			mode: {
				type: "string",
				enum: ["primary", "subagent"],
				description: "Agent mode (primary or subagent)",
			},
			model: {
				type: "string",
				description: "Model identifier (run 'opencode models' to see options)",
			},
			temperature: {
				type: "number",
				description: "Temperature (0.0-1.0, default 0.2)",
			},
			top_p: {
				type: "number",
				description: "Top-p sampling (optional)",
			},
			steps: {
				type: "number",
				description: "Max steps (default 8)",
			},
			color: {
				type: "string",
				description: "UI color hex code (default #198754)",
			},
			permissions: {
				type: "object",
				description: "Permission rules { read, write, edit, bash, etc }",
			},
		},
		required: ["name", "description", "mode", "model"],
	},
	execute(args: {
		name: string;
		description: string;
		mode: string;
		model: string;
		temperature?: number;
		top_p?: number;
		steps?: number;
		color?: string;
		permissions?: Record<string, Record<string, string>>;
	}): string {
		const {
			name,
			description,
			mode,
			model,
			temperature = 0.2,
			top_p,
			steps = 8,
			color = "#198754",
			permissions = {},
		} = args;

		const agentsDir = _getAgentsDir();
		mkdirSync(agentsDir, { recursive: true });

		const agentPath = join(agentsDir, `${name}.md`);
		if (existsSync(agentPath)) {
			return `Agent '${name}' already exists at: ${agentPath}\n\nUse 'octo:show' to view it or choose a different name.`;
		}

		const defaultPerms = {
			read: { "*": "allow" },
			grep: { "*": "allow" },
			glob: { "*": "allow" },
			edit: { "*": "deny" },
			write: { "*": "deny" },
			patch: { "*": "deny" },
			bash: { "*": "ask" },
		};

		const mergedPerms = { ...defaultPerms, ...permissions };

		const permYaml = Object.entries(mergedPerms)
			.map(([key, val]) => {
				const rules = Object.entries(val)
					.map(([pattern, action]) => `    "${pattern}": "${action}"`)
					.join("\n");
				return `  ${key}:\n${rules}`;
			})
			.join("\n");

		const template = _loadTemplate("agents", "generic");
		const agentsmdPath = join(__dirname, "../AGENTS.md");
		let agentsmdRules = existsSync(agentsmdPath)
			? readFileSync(agentsmdPath, "utf-8")
			: "";
		agentsmdRules = agentsmdRules.replace(AGENTSMD_RULES_REGEX, "").trim();

		const vars: Record<string, string> = {
			agentsmdRules,
			description,
			mode,
			model,
			temperature: temperature.toString(),
			steps: steps.toString(),
			color,
			permissionYaml: permYaml,
			title: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " "),
			roleDescription: "Define the agent's responsibilities and scope here.",
			processSteps:
				"1. Understand the request\n2. Plan your approach\n3. Execute systematically\n4. Verify results",
		};

		if (top_p !== undefined) {
			vars.top_p = top_p.toString();
		}

		const content = _substituteTemplate(template, vars);

		writeFileSync(agentPath, content);
		return `Created agent '${name}' at: ${agentPath}\n\nLocation: ${_findOpenCodeDir()}\n\nRestart OpenCode to load the new agent.`;
	},
};

const _octoCreateCommandTool = {
	description: "Create a new OpenCode slash command",
	parameters: {
		type: "object",
		properties: {
			name: {
				type: "string",
				description: "Command name (lowercase-with-dashes)",
			},
			description: {
				type: "string",
				description: "Brief description of command's purpose",
			},
			agent: {
				type: "string",
				description: "Agent to execute this command (e.g., 'build', 'review')",
			},
			content: {
				type: "string",
				description: "Command content/instructions (markdown format)",
			},
		},
		required: ["name", "description", "agent", "content"],
	},
	execute(args: {
		name: string;
		description: string;
		agent: string;
		content: string;
	}): string {
		const { name, description, agent, content } = args;

		const commandsDir = _getCommandsDir();
		mkdirSync(commandsDir, { recursive: true });

		const commandPath = join(commandsDir, `${name}.md`);
		if (existsSync(commandPath)) {
			return `Command '${name}' already exists at: ${commandPath}\n\nChoose a different name.`;
		}

		const template = _loadTemplate("commands", "generic");
		const commandContent = _substituteTemplate(template, {
			description,
			agent,
			content,
		});

		writeFileSync(commandPath, commandContent);
		return `Created command '${name}' at: ${commandPath}\n\nLocation: ${_findOpenCodeDir()}\n\nRestart OpenCode to load the new command.`;
	},
};

const _octoCreateToolTool = {
	description: "Create a new OpenCode tool (TypeScript)",
	parameters: {
		type: "object",
		properties: {
			name: {
				type: "string",
				description: "Tool name (camelCase for TypeScript)",
			},
			description: {
				type: "string",
				description: "Brief description of tool's purpose",
			},
			parameters: {
				type: "object",
				description:
					"Tool parameters schema { paramName: { type: 'string'|'number'|'boolean', description: '...' } }",
			},
			implementation: {
				type: "string",
				description:
					"Tool implementation code (TypeScript function body, without function wrapper)",
			},
		},
		required: ["name", "description"],
	},
	execute(args: {
		name: string;
		description: string;
		parameters?: Record<
			string,
			{ type: string; description?: string; optional?: boolean }
		>;
		implementation?: string;
	}): string {
		const { name, description, parameters = {}, implementation } = args;

		const toolsDir = _getToolsDir();
		mkdirSync(toolsDir, { recursive: true });

		const toolPath = join(toolsDir, `${name}.ts`);
		if (existsSync(toolPath)) {
			return `Tool '${name}' already exists at: ${toolPath}\n\nChoose a different name.`;
		}

		const paramEntries = Object.entries(parameters);
		const argsSchema =
			paramEntries.length > 0
				? `\n\targs: {\n${paramEntries
						.map(
							([key, val]) =>
								`\t\t${key}: tool.schema.${val.type}()${val.description ? `.describe("${val.description}")` : ""}${val.optional ? "" : ""}`,
						)
						.join(",\n")},\n\t},`
				: "";

		const executeBody =
			implementation ||
			`\t\t// TODO: Implement tool logic here\n\t\treturn "Tool ${name} executed";`;

		const template = _loadTemplate("tools", "generic");
		const toolContent = _substituteTemplate(template, {
			name,
			description,
			argsSchema,
			implementation: executeBody,
		});

		writeFileSync(toolPath, toolContent);
		return `Created tool '${name}' at: ${toolPath}\n\nLocation: ${_findOpenCodeDir()}\n\nRemember to:\n1. Implement the tool logic\n2. Export the tool in the plugin\n3. Restart OpenCode to load it`;
	},
};

// biome-ignore lint/style/noDefaultExport: OpenCode expects default export for plugins
export default {
	name: "octoagents",
	description: "OctoAgents framework plugin for AI agent management",
	tools: {
		"octo:list": _octoListTool,
		"octo:show": _octoShowTool,
		"octo:create:agent": _octoCreateAgentTool,
		"octo:create:command": _octoCreateCommandTool,
		"octo:create:tool": _octoCreateToolTool,
	},
};
