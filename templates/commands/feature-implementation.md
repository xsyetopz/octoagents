---
description: "Implement a new feature from scratch"
agent: "orchestrate"
subtask: "coder"
---

# Feature Implementation

## Task Description

Implement the following feature:

{{feature_description}}

## Current State

Let me first understand the current codebase structure:

*! find {{worktree}}/src -type f -name "*.ts" -o -name "*.js" -o -name "*.py" | head -20

## Implementation Plan

1. **Analyze requirements** - Understand what needs to be built
2. **Explore existing patterns** - Check similar implementations
3. **Create/new files** - Set up necessary files and structure
4. **Implement core logic** - Write the feature code
5. **Add tests** - Verify functionality
6. **Update documentation** - Document the new feature

## Context

Project location: {{worktree}}
Current framework: {{framework_info}}

## Output Format

Provide:

1. Files created/modified with locations
2. Code snippets showing key implementations
3. Test cases demonstrating functionality
4. Instructions for verifying the implementation
5. Any required configuration changes

## Quality Checklist

- [ ] Code follows existing patterns
- [ ] Error handling implemented
- [ ] Tests cover main cases
- [ ] Documentation updated
- [ ] No breaking changes to existing code

Begin implementation by exploring the codebase structure, then creating the necessary files.
