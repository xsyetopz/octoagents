import { join } from "node:path";

const TEMPLATES_DIR = join(import.meta.dir, "..", "templates");

export interface TemplateVars {
	model: string;
	[key: string]: string;
}

function substitute(content: string, vars: TemplateVars): string {
	return content.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
		const value = vars[key];
		if (value === undefined) {
			throw new Error(`Template variable "{{${key}}}" has no value`);
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

export function resolveTemplateVars(model: string): TemplateVars {
	return { model };
}

export async function loadTemplateFile(relativePath: string): Promise<string> {
	const path = join(TEMPLATES_DIR, relativePath);
	const file = Bun.file(path);
	if (!(await file.exists())) {
		throw new Error(`Template file not found: ${path}`);
	}
	return file.text();
}
