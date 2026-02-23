export interface ContextFile {
	filename: string;
	content: string;
}

export function buildContextFiles(): ContextFile[] {
	return [
		{
			filename: "overview.md",
			content: `# Project Overview

Describe your project here so agents understand its purpose and domain.

## What This Project Does

(Replace with a concise description of what this codebase builds or solves)

## Key Goals

- (Primary goal #1)
- (Primary goal #2)

## Audience

(Who uses this? Developers? End users? Internal tooling?)
`,
		},
		{
			filename: "tech-stack.md",
			content: `# Tech Stack

List the languages, runtimes, frameworks, and tools used in this project.

## Languages

- Primary: (e.g. TypeScript, Python, Rust, Go, C++)
- Secondary: (e.g. shell scripts, SQL)

## Runtime / Package Manager

- Runtime: (e.g. Bun, Node.js, Deno, Python 3.12, Rust 1.x)
- Package manager: (e.g. bun, pnpm, pip + .venv, cargo)

## Build System

- (e.g. cmake + ninja, make, Gradle, cargo, bun build)

## Frameworks / Libraries

- (List key dependencies)

## Testing

- Framework: (e.g. Bun test, pytest, cargo test, Go test)
- Coverage tool: (if any)

## Database / Storage

- (e.g. PostgreSQL, SQLite, Redis)

## Deployment

- (e.g. Docker, AWS Lambda, bare metal)
`,
		},
		{
			filename: "conventions.md",
			content: `# Coding Conventions

Rules that agents must follow when writing or modifying code in this project.

## Formatting

- Indent style: (tabs / spaces N)
- Max line length: (e.g. 100 chars)
- Trailing newline: required

## Naming

- Variables/functions: (camelCase / snake_case)
- Types/classes: (PascalCase)
- Constants: (SCREAMING_SNAKE_CASE / camelCase)
- Files: (kebab-case / snake_case)

## Imports

- Order: (external, then internal, then relative)
- Style: (named imports preferred / default imports)

## Error Handling

- (Describe your project's error handling pattern)
- (e.g. always throw typed errors, never swallow exceptions, Result types)

## Comments

- Comment the why, not the what
- Public APIs: (docstring style, if any)
- TODO format: \`TODO(author): description\`

## Git

- Commit format: conventional commits (\`type(scope): description\`)
- Branch naming: (e.g. feat/name, fix/name)
- PR size: (keep PRs focused, one concern per PR)
`,
		},
		{
			filename: "structure.md",
			content: `# Repository Structure

Describe the key directories and their purposes so agents navigate correctly.

\`\`\`
project-root/
  src/          Source code
  tests/        Test files (mirror src/ structure)
  docs/         Documentation
  scripts/      Build, deploy, and utility scripts
  .opencode/    OpenCode agent framework
\`\`\`

## Key Entry Points

- Main: (e.g. src/index.ts, src/main.rs, cmd/main.go)
- Tests: (e.g. tests/, src/__tests__/, *_test.go)
- Config: (e.g. config/, .env)

## Generated Files

Do not modify these manually — they are generated:
- (list generated directories/files)

## Vendored / Third-party

- (list any vendored code agents should not touch)
`,
		},
		{
			filename: "agent-notes.md",
			content: `# Notes for Agents

Critical constraints and guidance for all agents working in this project.

## Always Do

- Read existing code before modifying it
- Follow the conventions in conventions.md
- Run tests after making changes
- Use conventional commits when committing

## Never Do

- Modify generated files directly
- Push to remote without explicit user instruction
- Delete files without confirmation
- Commit secrets or credentials

## Environment Setup

For Python projects:
\`\`\`bash
python3 -m venv .venv
source .venv/bin/activate  # macOS/Linux
# .venv\\Scripts\\activate  # Windows
pip install -r requirements.txt
\`\`\`

For Node.js / Bun projects:
\`\`\`bash
bun install  # or npm install / pnpm install
\`\`\`

For Rust projects:
\`\`\`bash
cargo build
\`\`\`

## Testing Commands

(Override with your project's actual test commands)
See also: .opencode/context/tech-stack.md

## Known Issues / Gotchas

- (Any quirks or non-obvious things agents should know)
`,
		},
	];
}
