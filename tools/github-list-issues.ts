import { tool } from "@opencode-ai/plugin";

interface GitHubIssue {
	number: number;
	title: string;
	state: string;
	html_url: string;
	created_at: string;
	user: {
		login: string;
	};
	labels: Array<{ name: string }>;
}

const _getGitHubToken = () => {
	return process.env.GITHUB_TOKEN;
};

const _listIssues = async (
	token: string,
	owner: string,
	repo: string,
	state: "open" | "closed" | "all",
	labels?: string,
) => {
	const params = new URLSearchParams({
		state,
		per_page: "30",
	});
	if (labels) {
		params.append("labels", labels);
	}

	const response = await fetch(
		`https://api.github.com/repos/${owner}/${repo}/issues?${params}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/vnd.github+json",
				"X-GitHub-Api-Version": "2022-11-28",
			},
		},
	);

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`GitHub API error: ${response.status} ${response.statusText} - ${errorText}`,
		);
	}

	return (await response.json()) as GitHubIssue[];
};

const _formatIssues = (issues: GitHubIssue[]) => {
	if (issues.length === 0) {
		return "No issues found";
	}

	return issues
		.map((issue) => {
			const labels = issue.labels.map((l) => l.name).join(", ");
			return `#${issue.number} - ${issue.title}
  State: ${issue.state}
  Author: ${issue.user.login}
  ${labels ? `Labels: ${labels}` : ""}
  URL: ${issue.html_url}`;
		})
		.join("\n\n");
};

export const githubListIssuesTool = tool({
	description:
		"List issues from a GitHub repository. Requires GITHUB_TOKEN environment variable.",
	args: {
		owner: tool.schema
			.string()
			.describe("Repository owner (username or organization)"),
		repo: tool.schema.string().describe("Repository name"),
		state: tool.schema
			.enum(["open", "closed", "all"])
			.optional()
			.describe("Filter by issue state (default: open)"),
		labels: tool.schema
			.string()
			.optional()
			.describe("Comma-separated list of label names to filter by"),
	},
	async execute(args) {
		const token = _getGitHubToken();
		if (!token) {
			return "Error: GITHUB_TOKEN environment variable not set";
		}

		try {
			const issues = await _listIssues(
				token,
				args.owner,
				args.repo,
				(args.state as "open" | "closed" | "all") || "open",
				args.labels,
			);
			return _formatIssues(issues);
		} catch (error) {
			return `Error: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
});
