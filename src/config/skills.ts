export interface SkillConfig {
	name: string;
	title: string;
	description: string;
	category: string;
	example: string;
	references: string;
}

function _createSkill(
	name: string,
	title: string,
	description: string,
	category: string,
	example: string,
	references: string,
): SkillConfig {
	return { name, title, description, category, example, references };
}

export const SKILLS: SkillConfig[] = [
	_createSkill(
		"bun-file-io",
		"Bun File I/O",
		"Read and write files using Bun APIs.",
		"bun",
		"import { readFileSync } from 'bun';\nconst data = readFileSync('file.txt', 'utf8');",
		"https://bun.sh/docs/api/fs",
	),
];
