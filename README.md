# OctoAgents

Installs a fleet of specialized agents, skills, commands, and plugins into your [OpenCode](https://opencode.ai) project.

## Install

```sh
bun run install-framework
```

Writes the following into `.opencode/` and merges `opencode.json`:

```
agents/      11 agent files (7 built-in overrides + 4 custom subagents)
commands/    9 slash commands
skills/      8 skill directories
plugins/     4 runtime plugins
tools/       1 custom tool
context/     CONTEXT.md — edit this to describe your project
```

## Agents

The primary agent is `build`. It delegates to specialist subagents rather than doing everything itself:

| Agent | Role |
|---|---|
| `build` | Primary coding agent — orchestrates, delegates, commits |
| `plan` | Breaks down goals into concrete implementation steps |
| `implement` | Writes and edits code to spec |
| `review` | Code quality, security, and correctness analysis |
| `test` | Runs test suites, analyzes failures |
| `document` | Generates and updates docs |
| `explore` | Read-only codebase navigation |
| `general` | Multi-step delegated tasks |

The remaining three (`compaction`, `summary`, `title`) are housekeeping overrides that keep token usage low.

Each agent has a scoped permission set — `test` can only run test commands, `review` and `explore` are read-only, `document` can only write to `docs/**` and `*.md` freely.

## Plugins

Four runtime plugins land in `.opencode/plugins/`:

- **behavior-guard** — injects a behavioral contract into every session's system prompt (role reframing to prevent sycophancy, placeholder code, and scope creep)
- **context-loader** — reads `.opencode/context/*.md` and prepends the content to the system prompt so agents always have project context without being told to load it
- **safety-guard** — intercepts `tool.execute.before` and blocks destructive shell patterns before they run
- **session-logger** — appends tool execution events to `.opencode/logs/session-YYYY-MM-DD.log`

## Skills

Eight skills are installed to `.opencode/skills/`, loadable by agents with `load <name>`:

`git-workflow` · `code-review-checklist` · `test-patterns` · `refactor-guide` · `documentation-standards` · `project-setup` · `security-checklist` · `performance-guide`

## Provider Detection

Model assignments are resolved at install time based on available credentials:

- **Synthetic API** (`SYNTHETIC_API_KEY` or `synthetic` key in `opencode.json`): each agent gets a model matched to its workload — DeepSeek for planning and review, MiniMax for building and implementation, Qwen for general tasks, GLM for exploration and documentation
- **GitHub Copilot**: all agents use `gpt-5-mini`
- **No credentials**: falls back to OpenCode's free built-in models

## Options

```bash
--scope project         # Install to current directory (default)
--scope global          # Install to ~/.config/opencode/
--clean                 # Remove existing framework files before installing
--dry-run               # Preview what would be written without writing anything
--no-overrides          # Install custom subagents only, skip built-in overrides
--plugins <names>       # Comma-separated content plugins (default: safety-guard)
--no-plugins            # Skip content plugins
```

Content plugins (`safety-guard`, `conventions`) transform agent prompt files during install. This is separate from the runtime plugins that go into `.opencode/plugins/`.

## Requirements

- [Bun](https://bun.sh)
- [OpenCode](https://opencode.ai) CLI
- macOS or Linux (WSL2 on Windows)

## License

MIT
