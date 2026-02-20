export interface CommandConfig {
	name: string;
	description: string;
	agent: string;
	content: string;
}

function _createCommand(
	name: string,
	description: string,
	agent: string,
	content: string,
): CommandConfig {
	return { name, description, agent, content };
}

export const COMMANDS: CommandConfig[] = [
	_createCommand(
		"add-documentation",
		"Add documentation to the codebase",
		"documenter",
		"Write or update documentation as requested.",
	),
	_createCommand(
		"add-feature",
		"Add a new feature to the codebase",
		"coder",
		"Implement the requested feature in the codebase.",
	),
	_createCommand(
		"unslop",
		"Remove AI slop from the codebase",
		"refactorer",
		"Identify and remove AI slop from the codebase.",
	),
];
