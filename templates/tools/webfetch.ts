import { tool } from "@opencode-ai/plugin";

export const webfetchTool = tool({
	description: "Fetch web content using Jina AI Reader",
	args: {
		url: tool.schema.string().describe("URL to fetch"),
	},
	async execute(args: { url: string }) {
		const encodedUrl = encodeURIComponent(args.url);
		const response = await fetch(`https://r.jina.ai/http://${encodedUrl}`, {
			method: "GET",
			headers: {
				Accept: "text/plain",
			},
		});

		if (!response.ok) {
			throw new Error(`Jina AI error: ${response.status}`);
		}

		const text = await response.text();
		return text;
	},
});
