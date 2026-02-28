# Test Patterns

## Test Structure

Follow the AAA pattern:
```typescript
// Arrange
const input = buildTestInput();

// Act
const result = systemUnderTest(input);

// Assert
expect(result).toEqual(expectedOutput);
```

## Naming Conventions

Test names should read as complete sentences:
- `it("returns empty array when input is empty")`
- `it("throws InvalidArgumentError when name exceeds 100 characters")`

## Coverage Expectations

| Type | Coverage Scope |
|---|---|
| Unit tests | All public functions, all branches |
| Integration tests | All API endpoints, all database operations |
| E2E tests | Critical user flows |

## Test Isolation

1. Each test is independent -- no shared mutable state
2. Mock external dependencies (network, filesystem, time)
3. Use factories/builders to generate test data, avoid hardcoding

## What to Test

- Happy path: expected input produces expected output
- Error cases: invalid input, missing data, downstream failures
- Boundary values: empty collections, zero values, maximums
- Concurrency: test race conditions if code has concurrent paths

## Anti-patterns

Avoid the following:
- Testing implementation details (brittle when refactoring)
- Relying on specific execution order
- Making real network requests
- Asserting error message strings (unstable)
