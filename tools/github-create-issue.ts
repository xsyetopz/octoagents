import { tool } from "@opencode-ai/plugin";

interface GitHubIssue {
	number: number;
	title: string;
	html_url: string;
	state: string;
}

const _getGitHubToken = () => {
	return process.env.GITHUB_TOKEN;
};

const _createIssue = async (
	token: string,
	owner: string,
	repo: string,
	title: string,
	body?: string,
	labels?: string[],
) => {
	const response = await fetch(
		`https://api.github.com/repos/${owner}/${repo}/issues`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/vnd.github+json",
				"X-GitHub-Api-Version": "2022-11-28",
			},
			body: JSON.stringify({
				title,
				body: body || "",
				labels: labels || [],
			}),
		},
	);
	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`GitHub API error: ${response.status} ${response.statusText} - ${errorText}`,
		);
	}

	return (await response.json()) as GitHubIssue;
};

export const githubCreateIssueTool = tool({
	description:
		"Create a new GitHub issue in a repository. Requires GITHUB_TOKEN environment variable.",
	args: {
		owner: tool.schema
			.string()
			.describe("Repository owner (username or organization)"),
		repo: tool.schema.string().describe("Repository name"),
		title: tool.schema.string().describe("Issue title"),
		body: tool.schema.string().optional().describe("Issue description"),
		labels: tool.schema
			.array(tool.schema.string())
			.optional()
			.describe("Labels to add to the issue"),
	},
	async execute(args) {
		const token = _getGitHubToken();
		if (!token) {
			return "Error: GITHUB_TOKEN environment variable not set";
		}

		try {
			const issue = await _createIssue(
				token,
				args.owner,
				args.repo,
				args.title,
				args.body,
				args.labels,
			);
			return `Created issue #${issue.number}: ${issue.title}\nURL: ${issue.html_url}`;
		} catch (error) {
			return `Error: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
});
