#!/usr/bin/env bun
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AGENTS } from "./config/agents.ts";
import { COMMANDS } from "./config/commands.ts";
import { SKILLS } from "./config/skills.ts";

const installDir = process.argv[2] || `${process.env["HOME"]}/.config/opencode`;

function renderTemplate(
	templatePath: string,
	replacements: Record<string, string>,
	conditionals?: Record<string, boolean>,
) {
	let template = readFileSync(templatePath, "utf-8");
	for (const [key, value] of Object.entries(replacements)) {
		template = template.replace(new RegExp(`{{${key}}}`, "g"), value);
	}
	if (conditionals) {
		for (const [key, present] of Object.entries(conditionals)) {
			if (present) {
				template = template.replace(new RegExp(`{{#if ${key}}}`, "g"), "");
				template = template.replace(new RegExp(`{{/${"if"}}}`, "g"), "");
			} else {
				template = template.replace(
					new RegExp(`{{#if ${key}}}[sS]*?{{/${"if"}}}`, "g"),
					"",
				);
			}
		}
	}
	return template;
}

function generateFiles<T>(
	items: T[],
	templatePath: string,
	outputDir: string,
	getReplacements: (item: T) => Record<string, string>,
	getConditionals?: (item: T) => Record<string, boolean>,
	skip?: (item: T) => boolean,
	logPrefix = "",
) {
	mkdirSync(outputDir, { recursive: true });
	for (const item of items) {
		if (skip?.(item)) {
			continue;
		}
		const name = (item as { name: string }).name;
		const outputPath = join(outputDir, `${name}.md`);
		try {
			const template = renderTemplate(
				templatePath,
				getReplacements(item),
				getConditionals ? getConditionals(item) : undefined,
			);
			writeFileSync(outputPath, template);
			console.log(`✓ ${logPrefix}${name}`);
		} catch (error) {
			console.error(`✗ ${logPrefix}${name}: ${error}`);
		}
	}
}

const agentsDir = join(installDir, "agents");
const agentsTemplateDir = join(import.meta.dir, "../templates/agents");
console.log(`Generating agents to: ${agentsDir}`);
for (const agent of AGENTS) {
	const templatePath = join(agentsTemplateDir, `${agent.name}.md`);
	const outputDir = agentsDir;
	generateFiles(
		[agent],
		templatePath,
		outputDir,
		(agent) => {
			const replacements: Record<string, string> = {
				description: agent.description,
				mode: agent.mode,
				model: agent.model,
				color: agent.color,
			};
			if (agent.temperature !== undefined) {
				replacements["temperature"] = agent.temperature.toString();
			}
			if (agent.steps !== undefined) {
				replacements["steps"] = agent.steps.toString();
			}
			if (agent.top_p !== undefined) {
				replacements["top_p"] = agent.top_p.toString();
			}
			return replacements;
		},
		(agent) => ({
			temperature: agent.temperature !== undefined,
			steps: agent.steps !== undefined,
			top_p: agent.top_p !== undefined,
		}),
		undefined,
		"",
	);
}

const commandsDir = join(installDir, "commands");
const commandTemplatePath = join(
	import.meta.dir,
	"../templates/commands/generic.md",
);
generateFiles(
	COMMANDS,
	commandTemplatePath,
	commandsDir,
	(command) => ({
		description: command.description,
		agent: command.agent,
		content: command.content,
	}),
	undefined,
	undefined,
	"command: ",
);

const skillsDir = join(installDir, "skills");
const skillTemplatePath = join(
	import.meta.dir,
	"../templates/skills/generic/SKILL.md",
);
generateFiles(
	SKILLS,
	skillTemplatePath,
	skillsDir,
	(skill) => ({
		title: skill.title,
		description: skill.description,
		category: skill.category,
		example: skill.example,
		references: skill.references,
	}),
	undefined,
	(skill) => skill.name === "generic",
	"skill: ",
);

console.log("\nAgent generation complete!\n");
