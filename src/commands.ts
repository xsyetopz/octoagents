import type { CommandDefinition } from "./types.ts";

export const COMMAND_DEFINITIONS: CommandDefinition[] = [
	{
		name: "run-review",
		description: "Perform code review on a file or path",
		agent: "review",
		promptTemplate: `Perform a thorough code review on the following file or path. Check for correctness, security vulnerabilities, performance issues, and style problems. Use the code-review-checklist and security-checklist skills.

Target:`,
	},
	{
		name: "run-tests",
		description: "Execute test suite, analyze results",
		agent: "test",
		promptTemplate: `Run the test suite and analyze the results. If tests fail, identify root causes and suggest fixes.

Scope:`,
	},
	{
		name: "run-implement",
		description: "Implement a feature from a spec or description",
		agent: "implement",
		promptTemplate: `Implement the following feature or change according to the specification. Read existing code first, follow project conventions, and use the refactor-guide skill if modifying existing code.

Specification:`,
	},
	{
		name: "update-docs",
		description: "Generate or update documentation",
		agent: "document",
		promptTemplate: `Generate or update documentation for the following. Use the documentation-standards skill to ensure consistency with project conventions.

Target:`,
	},
	{
		name: "find-deps",
		description: "Analyze dependencies of a module",
		agent: "explore",
		promptTemplate: `Analyze the dependencies of the following module. Map what it imports, what imports it, and identify any circular dependencies or problematic coupling.

Module:`,
	},
	{
		name: "explain-code",
		description: "Explain architecture or code structure",
		agent: "explore",
		promptTemplate: `Explain the architecture and code structure of the following. Describe how it works, key abstractions, data flow, and important patterns.

Target:`,
	},
	{
		name: "plan-feature",
		description: "Break down a feature into implementation tasks",
		agent: "plan",
		promptTemplate: `Break down the following feature into concrete implementation tasks. Produce an ordered plan with dependencies, risks, and effort considerations. Use the project-setup skill if this involves new project configuration.

Feature:`,
	},
	{
		name: "plan-refactor",
		description: "Plan a refactoring with impact analysis",
		agent: "plan",
		promptTemplate: `Plan the following refactoring. Analyze impact, identify all affected files and consumers, outline a safe migration path, and flag risks. Use the refactor-guide skill.

Refactoring:`,
	},
	{
		name: "ship-feature",
		description: "End-to-end: implement, test, review, document, commit",
		agent: "build",
		promptTemplate: `Ship the following feature end-to-end:
1. Implement the feature using @implement
2. Run tests using @test
3. Review the code using @review
4. Update documentation using @document
5. Commit the changes

Feature:`,
	},
];
