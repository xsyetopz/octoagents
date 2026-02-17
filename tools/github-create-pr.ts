import { tool } from "@opencode-ai/plugin";

interface GitHubPullRequest {
	number: number;
	title: string;
	html_url: string;
	state: string;
}

const _getGitHubToken = () => {
	return process.env.GITHUB_TOKEN;
};

const _createPullRequest = async (
	token: string,
	owner: string,
	repo: string,
	title: string,
	head: string,
	base: string,
	body?: string,
) => {
	const response = await fetch(
		`https://api.github.com/repos/${owner}/${repo}/pulls`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/vnd.github+json",
				"X-GitHub-Api-Version": "2022-11-28",
			},
			body: JSON.stringify({
				title,
				head,
				base,
				body: body || "",
			}),
		},
	);
	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`GitHub API error: ${response.status} ${response.statusText} - ${errorText}`,
		);
	}

	return (await response.json()) as GitHubPullRequest;
};

export const githubCreatePrTool = tool({
	description:
		"Create a new GitHub pull request. Requires GITHUB_TOKEN environment variable.",
	args: {
		owner: tool.schema
			.string()
			.describe("Repository owner (username or organization)"),
		repo: tool.schema.string().describe("Repository name"),
		title: tool.schema.string().describe("Pull request title"),
		head: tool.schema
			.string()
			.describe("Branch name containing the changes (source branch)"),
		base: tool.schema
			.string()
			.describe(
				"Branch name you want to merge into (target branch, e.g., main)",
			),
		body: tool.schema.string().optional().describe("Pull request description"),
	},
	async execute(args) {
		const token = _getGitHubToken();
		if (!token) {
			return "Error: GITHUB_TOKEN environment variable not set";
		}

		try {
			const pr = await _createPullRequest(
				token,
				args.owner,
				args.repo,
				args.title,
				args.head,
				args.base,
				args.body,
			);
			return `Created PR #${pr.number}: ${pr.title}\nURL: ${pr.html_url}`;
		} catch (error) {
			return `Error: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
});
