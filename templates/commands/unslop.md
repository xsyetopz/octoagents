---
description: "Remove AI-generated code artifacts and style inconsistencies"
agent: "reviewer"
---

# Code Cleanup: Remove AI Slop

## Task

Clean up AI-generated code artifacts in:

{{target}}

Compare against {{base_branch}} branch to identify and remove slop.

## Process

1. **Get the diff** — Compare {{current_branch}} against {{base_branch}} to see what changed
2. **Identify slop** — Look for AI artifacts and inconsistencies:
   - Extra comments that a human wouldn't add (especially verbose explanations)
   - Comments inconsistent with the file's existing style
   - Over-defensive try/catch blocks in validated/trusted codepaths
   - Unnecessary type casts (especially `any` workarounds)
   - Defensive checks that are abnormal for that codebase area
   - Inconsistent style vs. rest of the file
   - Unnecessary emoji usage or formatting
3. **Remove artifacts** — Delete the identified slop
4. **Verify consistency** — Ensure changes match file's established patterns
5. **Report changes** — Summarize what was removed in 1-3 sentences

## Constraints

- Only remove AI artifacts, don't refactor logic or improve implementation
- Preserve intentional defensive code in security/validation contexts
- Preserve comments that explain non-obvious behavior
- Match the file's existing comment style and density
- Don't remove defensive patterns if they're consistent with the codebase area
- Report ONLY what was changed, not suggestions

## Context

Project location: {{worktree}}
Base branch: {{base_branch}} (default: dev)
Current branch: {{current_branch}}

## Output

Brief summary (1-3 sentences) of:

1. What categories of slop were removed
2. Number of changes made (comments/checks/casts removed)
