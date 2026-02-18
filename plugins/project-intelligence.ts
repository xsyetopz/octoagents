import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { tool } from "@opencode-ai/plugin";

interface DirectoryInfo {
	path: string;
	files: number;
	directories: number;
	totalSize: number;
}

function _scanDirectory(
	dirPath: string,
	maxDepth = 3,
	currentDepth = 0,
): DirectoryInfo {
	const info: DirectoryInfo = {
		path: dirPath,
		files: 0,
		directories: 0,
		totalSize: 0,
	};

	if (currentDepth >= maxDepth) {
		return info;
	}

	try {
		const entries = readdirSync(dirPath);
		for (const entry of entries) {
			if (entry.startsWith(".") || entry === "node_modules") {
				continue;
			}

			_processEntry(entry, dirPath, maxDepth, currentDepth, info);
		}
	} catch (dirError) {
		console.debug(
			`Cannot read directory ${dirPath}: ${dirError instanceof Error ? dirError.message : String(dirError)}`,
		);
	}
	return info;
}

function _processEntry(
	entry: string,
	dirPath: string,
	maxDepth: number,
	currentDepth: number,
	info: DirectoryInfo,
): void {
	const fullPath = join(dirPath, entry);
	try {
		const stat = statSync(fullPath);
		if (stat.isDirectory()) {
			info.directories++;
			const subInfo = _scanDirectory(fullPath, maxDepth, currentDepth + 1);
			info.files += subInfo.files;
			info.directories += subInfo.directories;
			info.totalSize += subInfo.totalSize;
		} else if (stat.isFile()) {
			info.files++;
			info.totalSize += stat.size;
		}
	} catch (accessError) {
		console.debug(
			`Cannot access ${fullPath}: ${accessError instanceof Error ? accessError.message : String(accessError)}`,
		);
	}
}

async function _executeProjectStructure(
	_args: { maxDepth?: number },
	context: { directory: string },
): Promise<unknown> {
	const maxDepth = _args.maxDepth || 3;
	const rootInfo = _scanDirectory(context.directory, maxDepth);

	const fileCategories = {
		package_managers: [
			"package.json",
			"pyproject.toml",
			"Cargo.toml",
			"go.mod",
			"pom.xml",
			"composer.json",
			"Gemfile",
		],
		build_tools: [
			"Makefile",
			"CMakeLists.txt",
			"build.gradle",
			"webpack.config.js",
			"vite.config.ts",
			"tsup.config.ts",
		],
		config_files: [
			".gitignore",
			".editorconfig",
			"tsconfig.json",
			"biome.json",
			".eslintrc",
			".prettierrc",
		],
	};

	const detectedFiles = {
		package_managers: [] as string[],
		build_tools: [] as string[],
		config_files: [] as string[],
	};

	for (const [category, files] of Object.entries(fileCategories)) {
		for (const file of files) {
			try {
				const { access } = await import("node:fs/promises");
				const { constants } = await import("node:fs");
				await access(join(context.directory, file), constants.F_OK);
				detectedFiles[category as keyof typeof detectedFiles].push(file);
			} catch (_err) {
				console.debug(`File not found: ${file}`);
			}
		}
	}

	return {
		total_files: rootInfo.files,
		total_directories: rootInfo.directories,
		total_size_bytes: rootInfo.totalSize,
		detected: detectedFiles,
	};
}

async function _executeCodeSearch(
	args: { pattern: string; filePattern?: string },
	context: { directory: string },
): Promise<unknown> {
	const filePattern = args.filePattern || "**/*.{ts,js,py,go,rs,java,rb,php}";
	const { glob } = await import("glob");
	const files = await glob(filePattern, { cwd: context.directory });
	const matches: Array<{ file: string; line: number; content: string }> = [];

	const regex = new RegExp(args.pattern, "gi");

	for (const file of files) {
		const filePath = join(context.directory, file);
		try {
			const { readFile } = await import("node:fs/promises");
			const content = await readFile(filePath, "utf-8");
			const lines = content.split("\n");

			for (let i = 0; i < lines.length; i++) {
				if (regex.test(lines[i])) {
					matches.push({
						file,
						line: i + 1,
						content: lines[i].trim(),
					});
				}
				regex.lastIndex = 0;
			}
		} catch (readErr) {
			console.debug(
				`Cannot read file ${filePath}: ${readErr instanceof Error ? readErr.message : String(readErr)}`,
			);
		}
	}

	return {
		pattern: args.pattern,
		match_count: matches.length,
		files_searched: matches.reduce((acc, m) => {
			if (!acc.includes(m.file)) {
				acc.push(m.file);
			}
			return acc;
		}, [] as string[]).length,
		matches: matches.slice(0, 50),
	};
}

async function _executeTechStack(
	_args: Record<string, unknown>,
	context: { directory: string },
): Promise<unknown> {
	const stack: Record<string, unknown> = {};

	try {
		const { readFile } = await import("node:fs/promises");
		const pkgContent = await readFile(
			join(context.directory, "package.json"),
			"utf-8",
		);
		const pkg = JSON.parse(pkgContent);
		const allDeps = {
			...pkg.dependencies,
			...pkg.devDependencies,
		};

		const frameworks = {
			react: "React",
			vue: "Vue.js",
			angular: "Angular",
			svelte: "Svelte",
			next: "Next.js",
			nuxt: "Nuxt.js",
			express: "Express",
			fastify: "Fastify",
			koa: "Koa",
		};

		const detectedFrameworks: string[] = [];
		for (const [key, name] of Object.entries(frameworks)) {
			if (allDeps[key]) {
				detectedFrameworks.push(name);
			}
		}

		stack.javascript = {
			runtime: pkg.engines?.node ? `Node ${pkg.engines.node}` : "Node.js",
			frameworks: detectedFrameworks,
			package_manager: await (async () => {
				const { access } = await import("node:fs/promises");
				const { constants } = await import("node:fs");
				try {
					await access(
						join(context.directory, "pnpm-lock.yaml"),
						constants.F_OK,
					);
					return "pnpm";
				} catch (_err) {
					// Continue to next check
				}
				try {
					await access(join(context.directory, "yarn.lock"), constants.F_OK);
					return "yarn";
				} catch (_err) {
					// Continue to next check
				}
				try {
					await access(join(context.directory, "bun.lockb"), constants.F_OK);
					return "bun";
				} catch (_err) {
					// Continue to npm default
				}
				return "npm";
			})(),
		};
	} catch (_pkgErr) {
		console.debug("No package.json found");
	}

	try {
		const { readFile } = await import("node:fs/promises");
		await readFile(join(context.directory, "pyproject.toml"), "utf-8");
		stack.python = {
			package_manager: "pip/poetry",
		};
	} catch (_pyErr) {
		console.debug("No pyproject.toml found");
	}

	try {
		const { readFile } = await import("node:fs/promises");
		await readFile(join(context.directory, "Cargo.toml"), "utf-8");
		stack.rust = {
			package_manager: "cargo",
		};
	} catch (_rustErr) {
		console.debug("No Cargo.toml found");
	}

	try {
		const { readFile } = await import("node:fs/promises");
		await readFile(join(context.directory, "go.mod"), "utf-8");
		stack.go = {
			package_manager: "go modules",
		};
	} catch (_goErr) {
		console.debug("No go.mod found");
	}

	return {
		detected: Object.keys(stack),
		details: stack,
	};
}

async function _executeDocumentation(
	_args: Record<string, unknown>,
	context: { directory: string },
): Promise<unknown> {
	const docFiles = [
		"README.md",
		"CONTRIBUTING.md",
		"LICENSE",
		"CHANGELOG.md",
		"docs/README.md",
		"API.md",
	];

	const found: Array<{ file: string; size: number; lines: number }> = [];

	for (const file of docFiles) {
		try {
			const filePath = join(context.directory, file);
			const { readFile, stat } = await import("node:fs/promises");
			const stats = await stat(filePath);
			const content = await readFile(filePath, "utf-8");
			found.push({
				file,
				size: stats.size,
				lines: content.split("\n").length,
			});
		} catch (_docErr) {
			console.debug(`Documentation file not found: ${file}`);
		}
	}

	return {
		documentation_files: found,
		has_readme: found.some((f) => f.file === "README.md"),
		has_contributing: found.some((f) => f.file === "CONTRIBUTING.md"),
		has_license: found.some((f) => f.file === "LICENSE"),
	};
}

function _createProjectStructureTool() {
	return {
		description:
			"Analyze project structure - count files, directories, detect package managers, build tools, and config files",
		args: {
			maxDepth: tool.schema
				.number()
				.optional()
				.describe("Maximum directory depth to scan (default: 3)"),
		},
		async execute(
			args: Record<string, unknown>,
			context: Record<string, unknown>,
		) {
			try {
				const result = await _executeProjectStructure(
					args as never,
					context as never,
				);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

function _createCodeSearchTool() {
	return {
		description:
			"Search for code patterns across the project using regex. Find function definitions, imports, TODOs, etc.",
		args: {
			pattern: tool.schema
				.string()
				.describe("Regex pattern to search for in code"),
			filePattern: tool.schema
				.string()
				.optional()
				.describe(
					'File glob pattern to search in (default: "**/*.{ts,js,py,go,rs,java,rb,php}")',
				),
		},
		async execute(
			args: Record<string, unknown>,
			context: Record<string, unknown>,
		) {
			try {
				const result = await _executeCodeSearch(
					args as never,
					context as never,
				);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

function _createTechStackTool() {
	return {
		description:
			"Detect technology stack - languages, frameworks, package managers, and tooling used in the project",
		args: {},
		async execute(
			_args: Record<string, unknown>,
			context: Record<string, unknown>,
		) {
			try {
				const result = await _executeTechStack(_args, context as never);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

function _createDocumentationTool() {
	return {
		description:
			"Inventory project documentation - README, CONTRIBUTING, LICENSE, CHANGELOG, and docs directory",
		args: {},
		async execute(
			_args: Record<string, unknown>,
			context: Record<string, unknown>,
		) {
			try {
				const result = await _executeDocumentation(_args, context as never);
				return JSON.stringify(result, null, 2);
			} catch (error) {
				return `Error: ${error instanceof Error ? error.message : String(error)}`;
			}
		},
	};
}

// biome-ignore lint/style/noDefaultExport: OpenCode plugin loader expects default export
export default function projectIntelligence(_ctx: Record<string, unknown>) {
	return {
		tool: {
			"project.structure": _createProjectStructureTool(),
			"project.code-search": _createCodeSearchTool(),
			"project.tech-stack": _createTechStackTool(),
			"project.documentation": _createDocumentationTool(),
		},
	};
}
