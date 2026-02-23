# OpenCode Agentic Framework Specification

## A Composable Agent Architecture Built on Native OpenCode Primitives

**Version:** 3.0.0
**Date:** February 23, 2026
**Status:** Draft Specification

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Design Philosophy](#design-philosophy)
3. [Model Lineup](#model-lineup)
4. [Permission Model](#permission-model)
5. [Agent Architecture](#agent-architecture)
6. [Command System](#command-system)
7. [Skill System](#skill-system)
8. [Configuration](#configuration)
9. [Directory Structure](#directory-structure)
10. [Installation](#installation)
11. [Technical Reference](#technical-reference)

---

## Executive Summary

This specification defines a fully-fledged agentic framework for OpenCode that leverages its native agent, command, skill, permission, and session subsystems. No tiers. No editions. One complete system.

The framework provides:

- **7 built-in agent overrides** that enhance OpenCode's defaults with project-aware prompts and model routing
- **4 custom subagents** for specialized concerns (review, implement, document, test)
- **A curated set of commands** that surface common workflows as slash-commands
- **Skills** that encode reusable workflows agents can load on-demand
- **Model routing** that assigns the right model to the right job based on actual strengths

The framework expects a **Synthetic** provider subscription for primary models, and optionally **GitHub Copilot Pro** for a zero-cost fallback. Three permanently-free OpenCode built-in models serve as the last-resort fallback layer shared across all agents.

A template repository with `install.sh` auto-generates the framework from user preferences.

---

## Design Philosophy

### Native-First

We compose OpenCode's existing primitives — agents, commands, skills, permissions, sessions, tools — not a parallel orchestration layer.

### No Tiers

One framework, fully installed. No "lite" vs "full" vs "pro" editions. If you install it, you get everything. This eliminates maintenance burden, edition confusion, and the false economy of capability gating.

### Right Model for the Job

Instead of "primary agents get the big model, subagents get the small one," we assign models based on what each agent actually needs. A code reviewer benefits from a different model than an explorer or a title generator. The 9 supported models each have different strengths; the framework exploits that.

### Practical, Not Theoretical

Every agent, command, and skill exists because it solves a real workflow problem. No placeholder agents. No 40-skill libraries of stubs.

---

## Model Lineup

### Supported Models

The framework supports exactly these models:

| Model ID | Type | Vision | Strengths |
|----------|------|--------|-----------|
| `opencode/big-pickle` | Free (permanent) | No | General-purpose free model |
| `opencode/gpt-5-nano` | Free (permanent) | No | Lightweight free model |
| `opencode/trinity-large-preview-free` | Free (permanent) | No | Capable free model |
| `github-copilot/gpt-5-mini` | Free w/ GitHub Pro | No | Strong general-purpose; zero cost with subscription |
| `synthetic/hf:deepseek-ai/DeepSeek-V3.2` | Paid | No | Top-tier reasoning, agentic tool use, thinking-in-tools; 685B MoE |
| `synthetic/hf:MiniMaxAI/MiniMax-M2.1` | Paid | No | Excellent coding, architect mindset, cheapest frontier-class; 230B MoE (10B active) |
| `synthetic/hf:nvidia/Kimi-K2.5-NVFP4` | Paid | Yes* | Native multimodal, strong agentic; 1T MoE (32B active). *Vision not yet working on Synthetic |
| `synthetic/hf:Qwen/Qwen3.5-397B-A17B` | Paid | **Yes** | Native VLM, 262K context, strong all-rounder; 397B MoE (17B active). Vision works on Synthetic |
| `synthetic/hf:zai-org/GLM-4.7` | Paid | No | Strong coding/agentic, interleaved thinking, good UI generation; 358B MoE |

### Fallback Chain

Every agent has:

1. **Assigned model** — the best model for this agent's job
2. **Fallback** — one of the three free OpenCode models (`opencode/big-pickle`, `opencode/gpt-5-nano`, `opencode/trinity-large-preview-free`)

If Synthetic is unreachable or budget is exhausted, agents degrade to the free fallback rather than failing. The `install.sh` script configures fallback assignments. There is no "primary models" vs "subagent models" distinction — a subagent doing complex code review deserves a strong model; a primary agent generating titles does not.

### Model Assignment Strategy

Assign models based on what the agent does, not what mode it runs in:

| Agent Need | Recommended Model(s) | Reasoning |
|------------|----------------------|-----------|
| Deep reasoning, complex planning | `synthetic/hf:deepseek-ai/DeepSeek-V3.2` | Best reasoning, thinking-in-tools |
| Code implementation, refactoring | `synthetic/hf:MiniMaxAI/MiniMax-M2.1` or `synthetic/hf:zai-org/GLM-4.7` | Architect mindset, strong SWE-bench, good tool calling |
| Code review, analysis | `synthetic/hf:Qwen/Qwen3.5-397B-A17B` or `synthetic/hf:deepseek-ai/DeepSeek-V3.2` | Strong all-round reasoning with vision for screenshot review |
| Codebase exploration (read-only) | `synthetic/hf:zai-org/GLM-4.7` or `github-copilot/gpt-5-mini` | Good code understanding, cost-efficient for read-heavy work |
| Lightweight tasks (title, summary, compaction) | `opencode/trinity-large-preview-free` or `opencode/gpt-5-nano` | Free, fast, good enough for non-critical tasks |
| Vision-required tasks | `synthetic/hf:Qwen/Qwen3.5-397B-A17B` | Only model with working vision on Synthetic |

---

## Permission Model

### Available Permission Keys

**File operations:** `read`, `edit`, `glob`, `grep`, `list`
**Execution:** `bash`
**Agent orchestration:** `task` (controls launching subagents — matches the subagent name)
**Knowledge:** `skill`, `lsp`
**External access:** `webfetch`, `websearch`, `codesearch`
**Task management:** `todoread`, `todowrite`
**Safety guards:** `external_directory`, `doom_loop`
**MCP tools:** Any tool name registered via MCP server

Each key accepts:

- **Scalar**: `"allow"`, `"ask"`, `"deny"`
- **Object**: Pattern map — `{ "git*": "allow", "rm*": "deny", "*": "ask" }`

### Defaults

If unspecified, OpenCode starts permissive:

- Most permissions default to `"allow"`
- `doom_loop` and `external_directory` default to `"ask"`
- `read` is `"allow"`, but `.env` files are denied:

```json
{
  "permission": {
    "read": {
      "*": "allow",
      "*.env": "deny",
      "*.env.*": "deny",
      "*.env.example": "allow"
    }
  }
}
```

### Permission Precedence

1. Agent-level (in agent frontmatter) — highest
2. Global default (top-level `permission` in `opencode.json`)
3. Built-in defaults

Agent-level overrides are additive: unspecified keys inherit from global.

---

## Agent Architecture

### Agent Frontmatter Schema

From OpenCode's actual schema:

```yaml
---
description: string          # What this agent does
mode: primary|subagent|all   # Required
model: provider/model-id     # e.g. synthetic/hf:zai-org/GLM-4.7
hidden: boolean              # Hide from agent switcher
temperature: number          # LLM temperature
top_p: number                 # Top-p sampling
color: string                # TUI display color
permission:                  # Per-tool permissions
  read: allow
  edit: ask
  bash: deny
steps: integer               # Max agentic iterations
variant: string              # Model variant
options:                     # Pass-through to provider
  key: value
---

# System Prompt

Markdown body becomes the agent's system prompt.
```

The `model:` field uses the format `provider/model-id`, e.g. `synthetic/hf:zai-org/GLM-4.7`. If unspecified, primary agents use the globally configured model; subagents inherit the model of the invoking primary agent.

### Naming Convention

All agent names use **descriptive nouns** matching OpenCode's built-in style (`general`, `explore`, `plan`, `build`). Not action verbs, not `-er`/`-or` suffixes.

✅ `review`, `implement`, `document`, `test`, `orchestrate`
❌ `reviewer`, `implementor`, `documenter`, `tester`, `orchestrator`

### Agent Roster

11 agents total: 7 built-in overrides + 4 custom subagents.

#### Built-in Overrides

| File | Mode | Purpose | Model |
|------|------|---------|-------|
| `build.md` | primary | Main coding agent — implement, test, commit, delegate | `synthetic/hf:MiniMaxAI/MiniMax-M2.1` |
| `plan.md` | primary | Break down goals, create roadmaps, strategize | `synthetic/hf:deepseek-ai/DeepSeek-V3.2` |
| `general.md` | subagent | Multi-step delegated tasks requiring file changes | `synthetic/hf:Qwen/Qwen3.5-397B-A17B` |
| `explore.md` | subagent | Fast read-only codebase navigation | `synthetic/hf:zai-org/GLM-4.7` |
| `compaction.md` | subagent | Compress session history preserving key context | `opencode/trinity-large-preview-free` |
| `summary.md` | subagent | Generate conversation summaries | `opencode/gpt-5-nano` |
| `title.md` | subagent | Generate conversation titles | `opencode/gpt-5-nano` |

#### Custom Subagents

| File | Mode | Purpose | Model |
|------|------|---------|-------|
| `review.md` | subagent | Code quality, security, style analysis | `synthetic/hf:deepseek-ai/DeepSeek-V3.2` |
| `implement.md` | subagent | Write/edit code per specifications | `synthetic/hf:MiniMaxAI/MiniMax-M2.1` |
| `document.md` | subagent | Generate/update docs, READMEs, API docs | `synthetic/hf:zai-org/GLM-4.7` |
| `test.md` | subagent | Run test suites, analyze failures, suggest fixes | `synthetic/hf:zai-org/GLM-4.7` |

### Why These Agents

**`build`** and **`plan`** are the two primary agents the user switches between (Tab key). `build` does things; `plan` thinks about things.

**`general`** is the workhorse subagent — when `build` or `plan` needs to delegate a multi-step subtask, `general` handles it with full tool access.

**`explore`** is read-only and fast — when any agent needs to understand the codebase before acting, it delegates to `explore`.

**`review`**, **`implement`**, **`document`**, **`test`** are the four specialized concerns. `build` delegates to them:

- Need code written to spec? → `@implement`
- Need that code reviewed? → `@review`
- Need docs updated? → `@document`
- Need tests run? → `@test`

**`compaction`**, **`summary`**, **`title`** are housekeeping agents on free models since their quality bar is lower.

### Agent Permissions

**Full access** (`build`, `general`, `implement`):

```yaml
permission:
  read: allow
  edit: allow
  bash:
    "git*": allow
    "npm*": allow
    "yarn*": allow
    "pnpm*": allow
    "cargo*": allow
    "go *": allow
    "make*": allow
    "rm -rf /": deny
    "rm -rf ~": deny
    "*": allow
  task: allow
  skill: allow
  lsp: allow
  webfetch: allow
  websearch: allow
  codesearch: allow
  todoread: allow
  todowrite: allow
```

**Read + plan** (`plan`):

```yaml
permission:
  read: allow
  grep: allow
  glob: allow
  list: allow
  edit: ask
  bash: ask
  task: allow
  skill: allow
  lsp: allow
  webfetch: allow
  websearch: allow
  codesearch: allow
  todoread: allow
  todowrite: allow
```

**Read-only** (`explore`, `review`):

```yaml
permission:
  read: allow
  grep: allow
  glob: allow
  list: allow
  lsp: allow
  edit: deny
  bash: deny
```

**Docs-scoped** (`document`):

```yaml
permission:
  read: allow
  grep: allow
  glob: allow
  list: allow
  lsp: allow
  edit:
    "docs/**": allow
    "*.md": allow
    "*": ask
  bash: deny
```

**Test runner** (`test`):

```yaml
permission:
  read: allow
  grep: allow
  glob: allow
  list: allow
  lsp: allow
  edit: deny
  bash:
    "npm test*": allow
    "npm run test*": allow
    "yarn test*": allow
    "pnpm test*": allow
    "pytest*": allow
    "cargo test*": allow
    "go test*": allow
    "make test*": allow
    "*": deny
```

**Housekeeping** (`compaction`, `summary`, `title`):

```yaml
permission:
  read: allow
  edit: deny
  bash: deny
  task: deny
```

---

## Command System

### Command Frontmatter

```yaml
---
description: string    # What this command does
agent: string          # Target agent name (required)
model: string          # Override model (optional, format: provider/model-id)
subtask: boolean       # Run as background task (optional)
---

# Prompt Template

Markdown body is prepended to user input when the command is invoked.
```

### Naming Rules

Commands use **verb-noun** patterns. They must never share a name with any agent.

✅ `/run-review`, `/run-tests`, `/find-deps`
❌ `/review` (conflicts with `review` agent), `/test` (conflicts with `test` agent)

### Command Roster

| Command File | Routes To | Purpose |
|-------------|-----------|---------|
| `run-review.md` | review | Perform code review on a file or path |
| `run-tests.md` | test | Execute test suite, analyze results |
| `run-implement.md` | implement | Implement a feature from a spec or description |
| `update-docs.md` | document | Generate or update documentation |
| `find-deps.md` | explore | Analyze dependencies of a module |
| `explain-code.md` | explore | Explain architecture or code structure |
| `plan-feature.md` | plan | Break down a feature into implementation tasks |
| `plan-refactor.md` | plan | Plan a refactoring with impact analysis |
| `ship-feature.md` | build | End-to-end: implement, test, review, document, commit |

---

## Skill System

### Skill Format

Skills are directories containing a `SKILL.md`:

```text
.opencode/skills/
  git-workflow/
    SKILL.md
```

```yaml
---
name: git-workflow
description: Git branching, commit message, and PR workflow conventions
metadata:
  version: "1.0"
---

# Git Workflow Skill

## Commit Messages
Use conventional commits: type(scope): description
...
```

Agents load skills on-demand via the `skill` tool. Only loaded skills consume context tokens.

### Skill Roster

| Skill | Description |
|-------|-------------|
| `git-workflow` | Commit messages, branching, PR conventions |
| `code-review-checklist` | Security, quality, style review checklist |
| `test-patterns` | Testing conventions, coverage expectations |
| `refactor-guide` | Safe refactoring patterns and techniques |
| `documentation-standards` | Doc structure, API docs, README conventions |
| `project-setup` | Project scaffolding and configuration patterns |
| `security-checklist` | Common vulnerability patterns to check for |
| `performance-guide` | Performance optimization patterns |

Additional skills can be added by dropping a `<name>/SKILL.md` into `.opencode/skills/`.

---

## Configuration

### opencode.json

The framework generates a project-level `opencode.json`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "read": {
      "*": "allow",
      "*.env": "deny",
      "*.env.*": "deny",
      "*.env.example": "allow"
    },
    "edit": "ask",
    "bash": {
      "git*": "allow",
      "npm*": "allow",
      "rm -rf /": "deny",
      "rm -rf ~": "deny",
      "*": "ask"
    },
    "task": "allow",
    "skill": "allow",
    "lsp": "allow",
    "webfetch": "allow",
    "websearch": "allow",
    "codesearch": "allow",
    "todoread": "allow",
    "todowrite": "allow"
  }
}
```

Agent-level permissions in frontmatter override these globals.

### Config Hierarchy (highest first)

1. Inline config (`OPENCODE_CONFIG_CONTENT`)
2. `.opencode/` directories (agents, commands, skills)
3. Project config (`opencode.json`)
4. Custom path (`OPENCODE_CONFIG`)
5. Global config (`~/.config/opencode/opencode.json`)
6. Remote org config (`OPENCODE_ORG_CONFIG`)

---

## Directory Structure

```text
<project-root>/
  .opencode/
    agents/
      build.md              # primary — override built-in
      plan.md               # primary — override built-in
      general.md            # subagent — override built-in
      explore.md            # subagent — override built-in
      compaction.md         # subagent — override built-in
      summary.md            # subagent — override built-in
      title.md              # subagent — override built-in
      review.md             # subagent — custom
      implement.md          # subagent — custom
      document.md           # subagent — custom
      test.md               # subagent — custom
    commands/
      run-review.md
      run-tests.md
      run-implement.md
      update-docs.md
      find-deps.md
      explain-code.md
      plan-feature.md
      plan-refactor.md
      ship-feature.md
    skills/
      git-workflow/SKILL.md
      code-review-checklist/SKILL.md
      test-patterns/SKILL.md
      refactor-guide/SKILL.md
      documentation-standards/SKILL.md
      project-setup/SKILL.md
      security-checklist/SKILL.md
      performance-guide/SKILL.md
  opencode.json
```

---

## Installation

### install.sh

The template repository ships `install.sh` which auto-generates the framework.

**What it does:**

1. Detects providers — checks for Synthetic API key, GitHub Copilot credentials
2. Assigns models — maps each agent to its optimal model from available providers
3. Generates all 11 agent `.md` files with correct frontmatter
4. Generates all 9 command `.md` files
5. Scaffolds 8 skill directories with `SKILL.md`
6. Writes/merges `opencode.json`
7. Validates YAML, permission keys, namespace conflicts

**Usage:**

```bash
./install.sh                     # Interactive
./install.sh --scope project     # Project-local (default)
./install.sh --scope global      # Global (~/.config/opencode/)
./install.sh --clean             # Remove existing, reinstall
./install.sh --dry-run           # Preview without writing
./install.sh --no-overrides      # Skip built-in agent overrides
```

**Model detection logic:**

```text
For each agent:
  1. If Synthetic available → assign optimal Synthetic model per agent role
  2. Else if GitHub Copilot available → assign github-copilot/gpt-5-mini
  3. Else → assign best free model

For housekeeping agents (compaction, summary, title):
  Always assign free model regardless of provider availability
```

---

## Technical Reference

### Agent Schema (OpenCode source)

```text
name            — derived from filename
description     — string, optional
mode            — "subagent" | "primary" | "all" (required)
model           — string, format: provider/model-id (optional)
native          — boolean, optional
hidden          — boolean, optional
top_p            — number, optional
temperature     — number, optional
color           — string, optional
permission      — Ruleset
variant         — string, optional
prompt          — string, optional
options         — record<string, any>
steps           — positive integer, optional
```

### Valid Permission Keys

`read`, `edit`, `glob`, `grep`, `list`, `bash`, `task`, `skill`, `lsp`, `todoread`, `todowrite`, `webfetch`, `websearch`, `codesearch`, `external_directory`, `doom_loop`, plus any MCP tool names.

### Task Permission

The `task` permission controls which subagents can be launched. Matches the subagent name:

```yaml
task:
  "review": allow
  "implement": allow
  "*": ask
```

Or simply `task: allow` to permit all.

### Namespace Rules

- Agent names from filenames: `review.md` → `review`
- Command names from filenames: `run-review.md` → `/run-review`
- **Constraint**: agent names and command names must not overlap
- All names kebab-case

---

## Appendix: Version History

**v3.0.0** (February 23, 2026):

- Removed tier/edition system entirely — one complete framework.
- Agent schema: `model` is `provider/model-id` string. No `subagents` field.
- Agent naming: descriptive nouns (`review`, `implement`, `document`, `test`).
- Command names avoid agent name conflicts (verb-noun: `run-review`, not `review`).
- All permission keys: `websearch`, `codesearch`, `doom_loop`.
- Model assignment by agent need, not by mode. Fallback to free models.
- 11 agents, 9 commands, 8 skills.

---

**End of Specification**
