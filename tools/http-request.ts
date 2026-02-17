import { tool } from "@opencode-ai/plugin";

const _makeHttpRequest = async (
	url: string,
	method: string,
	headers?: Record<string, string>,
	body?: string,
) => {
	try {
		const options: RequestInit = {
			method: method.toUpperCase(),
			headers: headers || {},
		};

		if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
			options.body = body;
		}

		const response = await fetch(url, options);
		const responseText = await response.text();

		return {
			status: response.status,
			statusText: response.statusText,
			headers: Object.fromEntries(response.headers.entries()),
			body: responseText,
		};
	} catch (error) {
		throw new Error(
			`HTTP request failed: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
};

export const httpRequestTool = tool({
	description: "Make an HTTP request to any URL with custom headers and body",
	args: {
		url: tool.schema.string().describe("The URL to send the request to"),
		method: tool.schema
			.enum(["GET", "POST", "PUT", "DELETE", "PATCH"])
			.optional()
			.describe("HTTP method (default: GET)"),
		headers: tool.schema
			.record(tool.schema.string(), tool.schema.string())
			.optional()
			.describe("HTTP headers as key-value pairs"),
		body: tool.schema
			.string()
			.optional()
			.describe("Request body (for POST, PUT, PATCH)"),
	},
	async execute(args) {
		try {
			const result = await _makeHttpRequest(
				args.url,
				args.method || "GET",
				args.headers,
				args.body,
			);

			return `Status: ${result.status} ${result.statusText}

Response Body:
${result.body}

Response Headers:
${JSON.stringify(result.headers, null, 2)}`;
		} catch (error) {
			return `Error: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
});
