import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { tool } from "@opencode-ai/plugin";

interface SearchResult {
	url: string;
	title: string;
	text: string;
	published?: string;
}

interface SearchResponse {
	results: SearchResult[];
}

const _getSecret = (fileName: string, envVar: string) => {
	const secretsPath = join(homedir(), ".secrets");
	try {
		return readFileSync(join(secretsPath, fileName), "utf8").trim();
	} catch {
		return process.env[envVar];
	}
};

const _getApiKey = () => _getSecret("synthetic-api-key", "SYNTHETIC_API_KEY");

const _searchWeb = async (apiKey: string, query: string) => {
	const response = await fetch("https://api.synthetic.new/v2/search", {
		method: "POST",
		headers: {
			// biome-ignore lint/style/useNamingConvention: standard HTTP header name
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ query }),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`Error searching: ${response.status} ${response.statusText} - ${errorText}`,
		);
	}

	return (await response.json()) as SearchResponse;
};

const _formatResults = (query: string, results: SearchResult[]) => {
	if (!results || results.length === 0) {
		return "No results found for this query.";
	}

	const formattedResults = results
		.map((result, index) => {
			return `${index + 1}. **${result.title}**
   URL: ${result.url}
   ${result.text}
   ${result.published ? `Published: ${result.published}` : ""}`;
		})
		.join("\n\n");

	return `Search results for "${query}":\n\n${formattedResults}`;
};

export const webSearchTool = tool({
	description:
		"Search the web for any information using Synthetic's web search API",
	args: {
		query: tool.schema
			.string()
			.describe("The search query to look up on the web"),
	},
	async execute(args) {
		const apiKey = _getApiKey();
		if (!apiKey) {
			return "Error: Synthetic API key not found in ~/.secrets/synthetic-api-key or SYNTHETIC_API_KEY environment variable";
		}

		try {
			const data = await _searchWeb(apiKey, args.query);
			return _formatResults(args.query, data.results);
		} catch (error) {
			return `Error: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
});
