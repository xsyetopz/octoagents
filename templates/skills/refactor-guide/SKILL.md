# Refactoring Guide

## Golden Rule

Never change behavior and structure at the same time. Commit separately.

## Pre-refactoring Checklist

1. Ensure code being changed has test coverage
2. Understand all call sites
3. Check interface contracts (exported symbols, API contracts)

## Safe Refactoring Patterns

### Extract Function
Move code blocks into named functions. The block should do only one thing.
Use when: functions are too long, comments describe what a block does.

### Rename
Use IDE rename tools to capture all references.
Use when: names are misleading, abbreviated, or domain terminology has changed.

### Inline Variable
Replace variables that are assigned once and used once with their value.
Use when: variable name adds no clarity to the expression.

### Move Function/Module
Move functions to the module where their data resides.
Use when: a function uses data from another module more than its own.

### Replace Magic Number with Named Constant
`const MAX_RETRIES = 3` instead of `if (attempts > 3)`

### Introduce Parameter Object
When function has too many related parameters, group them into a typed object.

## Breaking Change Migration Strategy

1. Add new interface alongside old one
2. Incrementally migrate callers
3. Remove old interface after all callers migrated
4. When there are external consumers, never remove old and add new in the same commit

## Verification

After each refactoring step:
- Run full test suite
- Confirm behavior is completely unchanged
- Check diff for unexpected changes