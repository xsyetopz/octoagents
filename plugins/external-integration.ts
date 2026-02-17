import { homedir } from "node:os";
import { join } from "node:path";
import { tool } from "@opencode-ai/plugin";
import { readTextFile } from "../src/utils/files.ts";

const _getSecret = async (
	fileName: string,
	envVar: string,
): Promise<string | undefined> => {
	const secretsPath = join(homedir(), ".secrets");
	try {
		const content = await readTextFile(join(secretsPath, fileName));
		return content.trim();
	} catch (_error) {
		console.debug(`Secret file ${fileName} not found, using ${envVar} env var`);
		return process.env[envVar];
	}
};

async function _executeHttpRequest(args: {
	url: string;
	method?: string;
	headers?: Record<string, string>;
	body?: string;
}): Promise<unknown> {
	try {
		const method = args.method || "GET";
		const headers = args.headers || {};

		const response = await fetch(args.url, {
			method,
			headers,
			body: args.body,
		});

		const contentType = response.headers.get("content-type") || "";
		let data: unknown;

		if (contentType.includes("application/json")) {
			data = await response.json();
		} else {
			data = await response.text();
		}

		return {
			status: response.status,
			status_text: response.statusText,
			ok: response.ok,
			headers: Object.fromEntries(response.headers.entries()),
			data,
		};
	} catch (error) {
		return {
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

async function _executeGithubApi(args: {
	endpoint: string;
	method?: string;
	body?: string;
}): Promise<unknown> {
	const token = await _getSecret("github-token", "GITHUB_TOKEN");
	if (!token) {
		return {
			error:
				"GitHub token not found in ~/.secrets/github-token or GITHUB_TOKEN environment variable",
		};
	}

	const url = args.endpoint.startsWith("https://")
		? args.endpoint
		: `https://api.github.com${args.endpoint}`;

	return await _executeHttpRequest({
		url,
		method: args.method || "GET",
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28",
		},
		body: args.body,
	});
}

async function _executeSlackWebhook(args: {
	message: string;
	channel?: string;
}): Promise<unknown> {
	const webhookUrl = await _getSecret("slack-webhook-url", "SLACK_WEBHOOK_URL");
	if (!webhookUrl) {
		return {
			error:
				"Slack webhook URL not found in ~/.secrets/slack-webhook-url or SLACK_WEBHOOK_URL environment variable",
		};
	}

	const payload = {
		text: args.message,
		...(args.channel && { channel: args.channel }),
	};

	return await _executeHttpRequest({
		url: webhookUrl,
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});
}

async function _executeDiscordWebhook(args: {
	message: string;
	username?: string;
}): Promise<unknown> {
	const webhookUrl = await _getSecret(
		"discord-webhook-url",
		"DISCORD_WEBHOOK_URL",
	);
	if (!webhookUrl) {
		return {
			error:
				"Discord webhook URL not found in ~/.secrets/discord-webhook-url or DISCORD_WEBHOOK_URL environment variable",
		};
	}

	const payload = {
		content: args.message,
		...(args.username && { username: args.username }),
	};

	return await _executeHttpRequest({
		url: webhookUrl,
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});
}

async function _executeJiraApi(args: {
	endpoint: string;
	method?: string;
	body?: string;
}): Promise<unknown> {
	const jiraUrl = await _getSecret("jira-url", "JIRA_URL");
	const jiraEmail = await _getSecret("jira-email", "JIRA_EMAIL");
	const jiraToken = await _getSecret("jira-api-token", "JIRA_API_TOKEN");

	if (!jiraUrl) {
		return {
			error:
				"Jira credentials not found. Need ~/.secrets/jira-url, jira-email, jira-api-token or JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN environment variables",
		};
	}
	if (!jiraEmail) {
		return {
			error:
				"Jira credentials not found. Need ~/.secrets/jira-url, jira-email, jira-api-token or JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN environment variables",
		};
	}
	if (!jiraToken) {
		return {
			error:
				"Jira credentials not found. Need ~/.secrets/jira-url, jira-email, jira-api-token or JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN environment variables",
		};
	}

	const url = args.endpoint.startsWith("https://")
		? args.endpoint
		: `${jiraUrl}/rest/api/3${args.endpoint}`;

	const auth = Buffer.from(`${jiraEmail}:${jiraToken}`).toString("base64");

	return await _executeHttpRequest({
		url,
		method: args.method || "GET",
		headers: {
			Authorization: `Basic ${auth}`,
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: args.body,
	});
}

function _createHttpRequestTool() {
	return {
		description:
			"Make HTTP requests to external APIs with custom headers and body",
		args: {
			url: tool.schema.string().describe("URL to request"),
			method: tool.schema
				.string()
				.optional()
				.describe("HTTP method (GET, POST, PUT, DELETE, etc.)"),
			headers: tool.schema
				.object()
				.optional()
				.describe("Request headers as key-value pairs"),
			body: tool.schema
				.string()
				.optional()
				.describe("Request body (JSON string)"),
		},
		async execute(args: Record<string, unknown>) {
			try {
				const result = await _executeHttpRequest(args as never);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

function _createGithubApiTool() {
	return {
		description:
			"Interact with GitHub API (repos, issues, PRs, etc.). Requires GitHub token in ~/.secrets/github-token or GITHUB_TOKEN env var",
		args: {
			endpoint: tool.schema
				.string()
				.describe(
					'GitHub API endpoint (e.g., "/repos/owner/repo/issues", "/user")',
				),
			method: tool.schema
				.string()
				.optional()
				.describe("HTTP method (GET, POST, PUT, DELETE, etc.)"),
			body: tool.schema
				.string()
				.optional()
				.describe("Request body (JSON string)"),
		},
		async execute(args: Record<string, unknown>) {
			try {
				const result = await _executeGithubApi(args as never);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

function _createSlackWebhookTool() {
	return {
		description:
			"Send messages to Slack via webhook. Requires webhook URL in ~/.secrets/slack-webhook-url or SLACK_WEBHOOK_URL env var",
		args: {
			message: tool.schema.string().describe("Message to send"),
			channel: tool.schema
				.string()
				.optional()
				.describe("Channel to post to (optional)"),
		},
		async execute(args: Record<string, unknown>) {
			try {
				await _executeSlackWebhook(args as never);
				return "Message sent successfully";
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

function _createDiscordWebhookTool() {
	return {
		description:
			"Send messages to Discord via webhook. Requires webhook URL in ~/.secrets/discord-webhook-url or DISCORD_WEBHOOK_URL env var",
		args: {
			message: tool.schema.string().describe("Message to send"),
			username: tool.schema
				.string()
				.optional()
				.describe("Username to display (optional)"),
		},
		async execute(args: Record<string, unknown>) {
			try {
				const result = await _executeDiscordWebhook(args as never);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

function _createJiraApiTool() {
	return {
		description:
			"Interact with Jira API. Requires Jira URL, email, and token in ~/.secrets/jira-* or JIRA_* env vars",
		args: {
			endpoint: tool.schema
				.string()
				.describe('Jira API endpoint (e.g., "/issue", "/search")'),
			method: tool.schema
				.string()
				.optional()
				.describe("HTTP method (GET, POST, PUT, DELETE, etc.)"),
			body: tool.schema
				.string()
				.optional()
				.describe("Request body (JSON string)"),
		},
		async execute(args: Record<string, unknown>) {
			try {
				const result = await _executeJiraApi(args as never);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

export function externalIntegration(_ctx: Record<string, unknown>) {
	return {
		tool: {
			"external.http-request": _createHttpRequestTool(),
			"external.github-api": _createGithubApiTool(),
			"external.slack-webhook": _createSlackWebhookTool(),
			"external.discord-webhook": _createDiscordWebhookTool(),
			"external.jira-api": _createJiraApiTool(),
		},
	};
}
