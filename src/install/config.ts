export function generateOpenCodeConfig(presetAgents: string[]): string {
	return `{
  "$schema": "https://opencode.ai/config.json",
  "default_agent": "orchestrate",
  "agent": {
    ${["build", "plan", "explore", "general"].map((agent) => `"${agent}": { "disable": true }`).join(",\n    ")},
    ${presetAgents.map((agent) => `"${agent}": { "mode": "subagent" }`).join(",\n    ")}
  }
}
`;
}
