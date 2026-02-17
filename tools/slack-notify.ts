import { tool } from "@opencode-ai/plugin";

const _sendSlackMessage = async (
	webhookUrl: string,
	message: string,
	channel?: string,
) => {
	try {
		const payload: { text: string; channel?: string } = { text: message };
		if (channel) {
			payload.channel = channel;
		}

		const response = await fetch(webhookUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});
		if (!response.ok) {
			throw new Error(`Slack API error: ${response.status}`);
		}

		return true;
	} catch (error) {
		throw new Error(
			`Failed to send Slack message: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
};

export const slackNotifyTool = tool({
	description:
		"Send a notification message to Slack. Requires SLACK_WEBHOOK_URL environment variable.",
	args: {
		message: tool.schema.string().describe("Message to send to Slack"),
		channel: tool.schema
			.string()
			.optional()
			.describe("Slack channel to post to (optional)"),
	},
	async execute(args) {
		const webhookUrl = process.env.SLACK_WEBHOOK_URL;
		if (!webhookUrl) {
			return "Error: SLACK_WEBHOOK_URL environment variable not set";
		}

		try {
			await _sendSlackMessage(webhookUrl, args.message, args.channel);
			return `Message sent to Slack${args.channel ? ` (#${args.channel})` : ""}`;
		} catch (error) {
			return `Error: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
});
