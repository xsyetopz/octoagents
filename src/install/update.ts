export async function checkForUpdate(): Promise<string | undefined> {
	const Repo = "xsyetopz/octoagents";
	const ApiUrl = `https://api.github.com/repos/${Repo}/releases/latest`;

	type GitHubRelease = {
		tag_name?: string;
	};

	try {
		const response = await fetch(ApiUrl);
		const data = (await response.json()) as GitHubRelease;
		const tagName = data.tag_name ?? undefined;
		return tagName;
	} catch (error) {
		console.warn("Failed to check for updates:", (error as Error).message);
		return undefined;
	}
}
