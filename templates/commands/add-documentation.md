---
description: "Add or improve documentation for code"
agent: "documenter"
---

# Add Documentation

## Task

Add documentation for the following:

{{documentation_target}}

## Process

1. **Understand the code** — Read and comprehend the functionality being documented.
2. **Identify documentation needs** — Determine what information users/developers need.
3. **Write clear documentation** — Create accurate, helpful documentation.
4. **Verify accuracy** — Ensure documentation matches actual implementation.

## Constraints

- Document ONLY what is described in the documentation target above.
- Do NOT modify code behavior or implementation.
- Do NOT add tests unless the documentation target explicitly requests them.
- Do NOT refactor or reorganize code.
- Do NOT change variable names, function signatures, or module structure.
- Match existing documentation style and conventions exactly.
- Keep documentation concise and focused on what users need to know.

## Documentation Types

Depending on the target, add appropriate documentation:

- **Code comments**: Inline explanations for complex logic
- **JSDoc/docstrings**: Function/class/method documentation
- **README sections**: Usage examples, API guides, setup instructions
- **API documentation**: Endpoint descriptions, parameters, responses
- **Architecture docs**: System design, component relationships
- **Usage examples**: Code snippets showing how to use the feature

## Context

Project location: {{worktree}}
Current framework: {{framework_info}}

## Output

Report what was done:

1. Files modified (with paths)
2. Type of documentation added (comments, docstrings, README, etc.)
3. Brief summary of what was documented
