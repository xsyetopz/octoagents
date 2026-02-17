---
description: "[Concise description of what this command does]"
agent: "orchestrate" | "coder" | "reviewer" | "tester" | "explorer" | ...
subtask: true | false
---

# [Command Name]

## Task Description

Clear description of what this command accomplishes.

## Context

Current workspace: {{worktree}}
Current feature: {{feature_info}}
Relevant files: *! find {{worktree}} -type f -name "*.ts" | head -10

## Implementation Steps

1. [First step]
2. [Second step]
3. [Third step]

## Shell interpolation example

Example of running commands:
*! cd {{worktree}} && bun install
*! cd {{worktree}} && bun test

## Output Format

What the agent should provide:

- [Specific output item 1]
- [Specific output item 2]
- [Specific output item 3]

## Quality Checklist

- [ ] Quality check item
- [ ] Quality check item
- [ ] Quality check item

## Notes

Any additional context or notes for the agent executing this command.
