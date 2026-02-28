# Code Review Checklist

## Correctness

- [ ] Logic matches requirements specification
- [ ] Edge cases handled (empty input, undefined, overflow, boundary conditions)
- [ ] Error paths correctly return/throw exceptions
- [ ] Loops and slices have no out-of-bounds errors
- [ ] Async operations properly awaited, no unhandled promise rejections

## Security

- [ ] No SQL injection (use parameterized queries)
- [ ] No command injection (sanitize input passed to shell)
- [ ] No XSS (escape output in HTML context)
- [ ] Authentication checked before sensitive operations
- [ ] No hardcoded secrets in source code
- [ ] No path traversal vulnerabilities
- [ ] Dependencies not locked to versions with known vulnerabilities

## Performance

- [ ] No N+1 query patterns
- [ ] No unnecessary repeated computations in hot paths
- [ ] Using appropriate data structures (O(1) lookup vs O(n) search)
- [ ] Avoiding large memory allocations in loops

## Code Quality

- [ ] Functions have single responsibility
- [ ] No dead code
- [ ] Variable names are descriptive
- [ ] Complex logic has comments explaining why
- [ ] No duplicated logic that should be extracted
- [ ] Error messages are actionable

## Testing

- [ ] New behavior has test coverage
- [ ] Tests are deterministic (no time or order dependencies)
- [ ] Test names describe the test scenario