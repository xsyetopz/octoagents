#!/usr/bin/env bun
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AGENTS } from "./config/agents.ts";

const installDir = process.argv[2] || `${process.env["HOME"]}/.config/opencode`;
const templatesDir = join(import.meta.dir, "../templates/agents");

console.log(`Generating agents to: ${installDir}/agents`);

mkdirSync(`${installDir}/agents`, { recursive: true });

for (const agent of AGENTS) {
	const templatePath = join(templatesDir, `${agent.name}.md`);
	const outputPath = join(installDir, "agents", `${agent.name}.md`);

	try {
		let template = readFileSync(templatePath, "utf-8");

		template = template
			.replace(/{{description}}/g, agent.description)
			.replace(/{{mode}}/g, agent.mode)
			.replace(/{{model}}/g, agent.model)
			.replace(/{{temperature}}/g, agent.temperature.toString())
			.replace(/{{steps}}/g, agent.steps.toString())
			.replace(/{{color}}/g, agent.color);

		if (agent.top_p !== undefined) {
			template = template
				.replace(/{{#if top_p}}/g, "")
				.replace(/{{\/if}}/g, "")
				.replace(/{{top_p}}/g, agent.top_p.toString());
		} else {
			template = template.replace(/{{#if top_p}}[\s\S]*?{{\/if}}/g, "");
		}

		writeFileSync(outputPath, template);
		console.log(`✓ ${agent.name}`);
	} catch (error) {
		console.error(`✗ ${agent.name}: ${error}`);
	}
}

console.log("\nAgent generation complete!");
