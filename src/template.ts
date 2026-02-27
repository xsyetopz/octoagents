import { join } from "node:path";

const TEMPLATES_DIR = join(import.meta.dir, "..", "templates");

export interface TemplateVars {
	model: string;
	temperature?: string;
	thinking?: string;
	[key: string]: string | undefined;
}

function substitute(content: string, vars: TemplateVars): string {
	return content.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
		const value = vars[key];
		if (value === undefined) {
			return "";
		}
		return value;
	});
}

export async function loadAgentTemplate(
	name: string,
	vars: TemplateVars,
): Promise<string> {
	const path = join(TEMPLATES_DIR, "agents", `${name}.md`);
	const file = Bun.file(path);
	if (!(await file.exists())) {
		throw new Error(`Agent template not found: ${path}`);
	}
	const content = await file.text();
	return substitute(content, vars);
}

export async function loadCommandTemplate(name: string): Promise<string> {
	const path = join(TEMPLATES_DIR, "commands", `${name}.md`);
	const file = Bun.file(path);
	if (!(await file.exists())) {
		throw new Error(`Command template not found: ${path}`);
	}
	return file.text();
}

export function resolveTemplateVars(
	model: string,
	temperature?: number,
	thinking?: boolean,
): TemplateVars {
	const vars: TemplateVars = { model };
	if (temperature !== undefined) {
		vars.temperature = String(temperature);
	}
	if (thinking) {
		vars.thinking = "enabled";
	}
	return vars;
}

export async function loadTemplateFile(relativePath: string): Promise<string> {
	const path = join(TEMPLATES_DIR, relativePath);
	const file = Bun.file(path);
	if (!(await file.exists())) {
		throw new Error(`Template file not found: ${path}`);
	}
	return file.text();
}
