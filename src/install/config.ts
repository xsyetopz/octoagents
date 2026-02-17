export function generateOpenCodeConfig(presetAgents: string[]): string {
	const preferredDefault = "orchestrate";
	const defaultAgent = presetAgents.includes(preferredDefault)
		? preferredDefault
		: (presetAgents[0] ?? preferredDefault);
	const agentEntries = presetAgents.map((agent) => {
		const mode = agent === defaultAgent ? "primary" : "subagent";
		return `"${agent}": { "mode": "${mode}" }`;
	});
	return `{
  "$schema": "https://opencode.ai/config.json",
  "default_agent": "${defaultAgent}",
  "agent": {
    ${["build", "plan", "explore", "general"].map((agent) => `"${agent}": { "disable": true }`).join(",\n    ")},
    ${agentEntries.join(",\n    ")}
  }
}
`;
}
