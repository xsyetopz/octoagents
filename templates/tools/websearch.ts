import { tool } from "@opencode-ai/plugin";

export const websearchTool = tool({
	description: "Search web using Synthetic API",
	args: {
		query: tool.schema.string().describe("Search query"),
	},
	async execute(args: { query: string }) {
		const apiKey = process.env.SYNTHETIC_API_KEY;
		if (!apiKey) {
			throw new Error("SYNTHETIC_API_KEY not set");
		}

		const response = await fetch("https://api.synthetic.new/v2/search", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ query: args.query }),
		});
		if (!response.ok) {
			throw new Error(`Synthetic API error: ${response.status}`);
		}

		const data = (await response.json()) as {
			results: Array<{
				url: string;
				title: string;
				text: string;
				published?: string;
			}>;
		};
		return data.results
			.map(
				(r) =>
					`[${r.title}](${r.url})\n${r.text.substring(0, 200)}${r.text.length > 200 ? "..." : ""}`,
			)
			.join("\n\n");
	},
});
