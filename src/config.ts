import type { OpenCodeConfig } from "./types.ts";

export function buildOpenCodeConfig(): OpenCodeConfig {
	return {
		$schema: "https://opencode.ai/config.json",
		permission: {
			read: {
				"*": "allow",
				"*.env": "deny",
				"*.env.*": "deny",
				"*.env.example": "allow",
			},
			edit: "ask",
			bash: {
				"git*": "allow",
				"npm*": "allow",
				"rm -rf /": "deny",
				"rm -rf ~": "deny",
				"*": "ask",
			},
			task: "allow",
			skill: "allow",
			lsp: "allow",
			webfetch: "allow",
			websearch: "allow",
			codesearch: "allow",
			todoread: "allow",
			todowrite: "allow",
		},
	};
}
