import { tool } from "@opencode-ai/plugin";

interface GitHubCodeSearchResult {
	total_count: number;
	items: Array<{
		name: string;
		path: string;
		html_url: string;
		repository: {
			full_name: string;
		};
	}>;
}

const _getGitHubToken = () => {
	return process.env.GITHUB_TOKEN;
};

const _searchCode = async (
	token: string,
	query: string,
	owner?: string,
	repo?: string,
) => {
	let searchQuery = query;
	if (owner && repo) {
		searchQuery = `${query} repo:${owner}/${repo}`;
	} else if (owner) {
		searchQuery = `${query} user:${owner}`;
	}

	const params = new URLSearchParams({
		q: searchQuery,
		per_page: "20",
	});

	const response = await fetch(`https://api.github.com/search/code?${params}`, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28",
		},
	});
	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`GitHub API error: ${response.status} ${response.statusText} - ${errorText}`,
		);
	}

	return (await response.json()) as GitHubCodeSearchResult;
};

const _formatResults = (results: GitHubCodeSearchResult) => {
	if (results.total_count === 0) {
		return "No code results found";
	}

	const resultsText = results.items
		.map((item) => {
			return `File: ${item.path}
  Repository: ${item.repository.full_name}
  URL: ${item.html_url}`;
		})
		.join("\n\n");

	return `Found ${results.total_count} results (showing first ${results.items.length}):\n\n${resultsText}`;
};

export const githubSearchCodeTool = tool({
	description:
		"Search for code in GitHub repositories. Requires GITHUB_TOKEN environment variable.",
	args: {
		query: tool.schema
			.string()
			.describe(
				"Search query (e.g., 'function auth', 'class:User', 'extension:ts')",
			),
		owner: tool.schema
			.string()
			.optional()
			.describe("Limit search to repositories owned by this user/organization"),
		repo: tool.schema
			.string()
			.optional()
			.describe("Limit search to a specific repository (requires owner)"),
	},
	async execute(args) {
		const token = _getGitHubToken();
		if (!token) {
			return "Error: GITHUB_TOKEN environment variable not set";
		}

		try {
			const results = await _searchCode(
				token,
				args.query,
				args.owner,
				args.repo,
			);
			return _formatResults(results);
		} catch (error) {
			return `Error: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
});
