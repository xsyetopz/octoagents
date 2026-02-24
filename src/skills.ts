import type { SkillDefinition } from "./types.ts";

export const SKILL_DEFINITIONS: SkillDefinition[] = [
	{
		name: "git-workflow",
		description: "Git branching, commit message, and PR workflow conventions",
		version: "1.0",
		content: `# Git Workflow Skill

## Commit Messages

Use conventional commits: \`type(scope): description\`

Types: \`feat\`, \`fix\`, \`refactor\`, \`test\`, \`docs\`, \`chore\`, \`perf\`, \`ci\`

Rules:
- Imperative mood: "add feature" not "added feature"
- Under 72 characters for the subject line
- Body explains the why, not the what
- Reference issues: \`Closes #123\`

## Branching

- \`main\` / \`master\` — production-ready code
- \`feat/<name>\` — new features
- \`fix/<name>\` — bug fixes
- \`refactor/<name>\` — refactoring without behavior change
- \`chore/<name>\` — maintenance tasks

## Pull Requests

- PR title follows the same conventional commit format
- Description includes: what changed, why, how to test
- Keep PRs focused — one concern per PR
- Rebase onto main before merging, prefer squash for small PRs

## Workflow

1. Branch from main
2. Make focused commits
3. Run tests before pushing
4. Open PR with clear description
5. Address review comments
6. Merge when approved`,
	},
	{
		name: "code-review-checklist",
		description: "Security, quality, style review checklist",
		version: "1.0",
		content: `# Code Review Checklist

## Correctness

- [ ] Logic matches the stated requirements
- [ ] Edge cases handled (empty input, undefined, overflow, boundary conditions)
- [ ] Error paths return/throw correctly
- [ ] No off-by-one errors in loops and slices
- [ ] Async operations awaited correctly, no unhandled promise rejections

## Security

- [ ] No SQL injection (use parameterized queries)
- [ ] No command injection (sanitize inputs passed to shell)
- [ ] No XSS (escape output in HTML contexts)
- [ ] Authentication checked before authorization-gated operations
- [ ] No secrets hardcoded in source
- [ ] No path traversal vulnerabilities
- [ ] Dependencies not pinned to known-vulnerable versions

## Performance

- [ ] No N+1 query patterns
- [ ] No unnecessary re-computation in hot paths
- [ ] Appropriate data structures (O(1) lookup vs O(n) search)
- [ ] Large allocations avoided in loops

## Code Quality

- [ ] Functions do one thing
- [ ] No dead code
- [ ] Variable names are descriptive
- [ ] Complex logic has comments explaining the why
- [ ] No duplicated logic that should be extracted
- [ ] Error messages are actionable

## Tests

- [ ] New behavior has test coverage
- [ ] Tests are deterministic (no time-dependent or order-dependent tests)
- [ ] Test names describe the scenario being tested`,
	},
	{
		name: "test-patterns",
		description: "Testing conventions, coverage expectations",
		version: "1.0",
		content: `# Test Patterns

## Test Structure

Follow Arrange-Act-Assert (AAA):
\`\`\`
// Arrange
const input = buildTestInput();

// Act
const result = systemUnderTest(input);

// Assert
expect(result).toEqual(expectedOutput);
\`\`\`

## Naming

Test names should read as sentences:
- \`it("returns empty array when input is empty")\`
- \`it("throws InvalidArgumentError when name exceeds 100 characters")\`

## Coverage Expectations

- Unit tests: all public functions, all branches
- Integration tests: all API endpoints, all DB operations
- E2E tests: critical user journeys

## Test Isolation

- Each test is independent — no shared mutable state
- Mock external dependencies (network, filesystem, time)
- Use factories/builders for test data, not hardcoded literals

## What to Test

- Happy path: expected inputs produce expected outputs
- Error cases: invalid input, missing data, downstream failures
- Boundaries: empty collections, zero values, max values
- Concurrency: if the code has concurrent paths, test race conditions

## Anti-patterns to Avoid

- Tests that test implementation details (brittle to refactoring)
- Tests that require a specific execution order
- Tests that make real network requests
- Assertions on error message strings (fragile)`,
	},
	{
		name: "refactor-guide",
		description: "Safe refactoring patterns and techniques",
		version: "1.0",
		content: `# Refactoring Guide

## Golden Rule

Never change behavior and structure at the same time. Separate commits.

## Before Refactoring

1. Ensure test coverage exists for the code being changed
2. Understand all call sites
3. Check for interface contracts (exported symbols, API contracts)

## Safe Refactoring Patterns

### Extract Function
Move a block of code into a named function. The block should do one thing.
Apply when: a function is too long, a comment describes what a block does.

### Rename
Use IDE rename tools to catch all references.
Apply when: a name is misleading, abbreviated, or domain terminology has changed.

### Inline Variable
Replace a variable that is assigned once and used once with its value.
Apply when: the variable name adds no clarity over the expression.

### Move Function/Module
Relocate a function to the module that owns the data it operates on.
Apply when: a function uses more data from another module than its own.

### Replace Magic Number with Named Constant
\`const MAX_RETRIES = 3\` not \`if (attempts > 3)\`

### Introduce Parameter Object
When a function takes many related parameters, group them into a typed object.

## Migration Strategy for Breaking Changes

1. Add the new interface alongside the old one
2. Migrate callers incrementally
3. Remove the old interface once all callers are migrated
4. Never delete old and add new in the same commit if there are external consumers

## Verification

After each refactoring step:
- Run the full test suite
- Check that behavior is identical
- Review the diff for unintended changes`,
	},
	{
		name: "documentation-standards",
		description: "Doc structure, API docs, README conventions",
		version: "1.0",
		content: `# Documentation Standards

## README Structure

Every project README should contain (in order):
1. One-sentence description
2. Quick start (minimal steps to get running)
3. Installation
4. Usage with examples
5. Configuration reference
6. Contributing guidelines (or link)
7. License

## API Documentation

For each public function/method document:
- Purpose (one sentence)
- Parameters with types and constraints
- Return value with type
- Throws/rejects conditions
- Example usage

## Code Comments

Comment the why, not the what:

\`\`\`
// BAD: increment counter
counter++;

// GOOD: compensate for the off-by-one in the upstream API response
counter++;
\`\`\`

Complex algorithms deserve a reference comment:
\`\`\`
// Uses Fisher-Yates shuffle: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
\`\`\`

## Markdown Conventions

- One blank line between sections
- Code blocks always have a language tag
- Links use reference style for long URLs
- Tables have header separators aligned

## Changelog

Format: Keep a Changelog (https://keepachangelog.com)
Sections: Added, Changed, Deprecated, Removed, Fixed, Security`,
	},
	{
		name: "project-setup",
		description: "Project scaffolding and configuration patterns",
		version: "1.0",
		content: `# Project Setup

## Directory Conventions

\`\`\`
src/          # Source code
tests/        # Test files mirror src/ structure
docs/         # Documentation
dist/         # Build output (gitignored)
scripts/      # Build and utility scripts
\`\`\`

## Configuration Files

Always include at project root:
- \`.gitignore\` — ignore build artifacts, secrets, editor files
- \`README.md\` — project overview
- \`package.json\` / \`Cargo.toml\` / language-appropriate manifest

TypeScript projects also include:
- \`tsconfig.json\` — strict settings recommended
- \`biome.jsonc\` or \`eslint.config.js\` — linting/formatting

## Environment Variables

- Document all env vars in \`.env.example\`
- Never commit \`.env\` files
- Use \`SCREAMING_SNAKE_CASE\` for env var names
- Validate required env vars at startup, fail fast with clear message

## Dependencies

- Pin exact versions in lockfiles (\`bun.lock\`, \`package-lock.json\`)
- Separate dev dependencies from runtime dependencies
- Audit dependencies before adding them
- Prefer small, focused packages over large frameworks when possible

## Scripts

Standard script names across projects:
- \`build\` — compile/bundle
- \`test\` — run test suite
- \`lint\` — run linter
- \`format\` — run formatter
- \`start\` / \`dev\` — run the application`,
	},
	{
		name: "security-checklist",
		description: "Common vulnerability patterns to check for",
		version: "1.0",
		content: `# Security Checklist

## Input Validation

- [ ] All user input validated before use (type, length, format, range)
- [ ] Reject input that fails validation — do not sanitize and continue
- [ ] File paths validated against traversal (\`../\` sequences)
- [ ] URLs validated to prevent SSRF (server-side request forgery)

## Authentication & Authorization

- [ ] Authentication required before any sensitive operation
- [ ] Authorization checked per-resource, not just per-endpoint
- [ ] Tokens/sessions expire and can be revoked
- [ ] Passwords hashed with bcrypt/argon2 (never MD5/SHA1 alone)
- [ ] Brute-force protection on login endpoints

## Data Handling

- [ ] Secrets not logged
- [ ] PII minimized — collect only what is needed
- [ ] Sensitive data encrypted at rest
- [ ] TLS enforced for all external communication
- [ ] SQL queries parameterized (never string-concatenated)

## Dependencies

- [ ] No known CVEs in direct dependencies
- [ ] Dependency versions pinned
- [ ] No abandoned packages in critical paths

## API Security

- [ ] Rate limiting on public endpoints
- [ ] CORS configured to allow only known origins
- [ ] Content-Security-Policy headers set
- [ ] Sensitive endpoints not exposed publicly without auth

## Secrets Management

- [ ] No API keys or passwords in source code
- [ ] No credentials in environment variable names that get logged
- [ ] Secrets injected via environment, not config files in repo
- [ ] Secret rotation process documented`,
	},
	{
		name: "performance-guide",
		description: "Performance optimization patterns",
		version: "1.0",
		content: `# Performance Guide

## Measure First

Profile before optimizing. Assumptions about bottlenecks are usually wrong.

Tools:
- Node.js: \`--prof\`, \`clinic.js\`, Chrome DevTools
- Bun: built-in profiler
- Database: \`EXPLAIN ANALYZE\`, slow query log

## Common Bottlenecks

### Database

- N+1 queries: load related data in batches, use JOINs or \`IN\` clauses
- Missing indexes: add indexes on columns used in WHERE/JOIN/ORDER BY
- Over-fetching: SELECT only needed columns
- Connection pool exhaustion: tune pool size, release connections promptly

### Computation

- Repeated computation: memoize pure functions with stable inputs
- Unnecessary serialization: pass objects, not JSON strings, in-process
- Blocking the event loop: move CPU-intensive work to worker threads

### Memory

- Memory leaks: event listeners not removed, growing caches without eviction
- Large object graphs: stream large datasets instead of loading all at once
- Frequent GC: reduce allocation rate in hot paths

## Caching Strategy

Cache at the right layer:
1. In-process (fastest, not shared across instances)
2. Redis/Memcached (shared, survives restarts)
3. CDN (for static assets and cacheable API responses)

Cache invalidation rules:
- Set explicit TTLs — never cache forever
- Invalidate on write
- Cache stampede protection: use probabilistic early expiration or locks

## Frontend Performance

- Bundle size: code-split, tree-shake, analyze with source-map-explorer
- Images: use WebP, lazy-load below the fold
- Critical path: inline critical CSS, defer non-critical JS
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1`,
	},
	{
		name: "bun-file-io",
		description: "File I/O and directory operations using Bun-native APIs",
		version: "1.0",
		content: `# Bun File I/O

Use Bun-native APIs for file operations. Never spawn \`cat\`, \`ls\`, \`mkdir\`, or \`rm\` as shell commands.

## Reading Files

\`\`\`typescript
const file = Bun.file(path);
const exists = await file.exists(); // false for directories
const text = await file.text();
const json = await file.json<T>();
const buffer = await file.arrayBuffer();
// Metadata: file.size, file.type, file.name
\`\`\`

## Writing Files

\`\`\`typescript
await Bun.write(path, "text content");
await Bun.write(path, buffer);
await Bun.write(path, blob);
// Incremental writes: file.writer() → FileSink
\`\`\`

## Scanning Directories

\`\`\`typescript
const glob = new Bun.Glob("**/*.ts");
const files = await Array.fromAsync(
  glob.scan({ cwd: "src", absolute: true, onlyFiles: true })
);
\`\`\`

## Directory Operations

Use \`node:fs/promises\` for directories (Bun.file does not handle them):

\`\`\`typescript
import { mkdir, readdir, rm } from "node:fs/promises";

await mkdir(path, { recursive: true });
const entries = await readdir(path);
await rm(path, { recursive: true, force: true });
\`\`\`

## Appending and Logging

\`\`\`typescript
import { appendFile } from "node:fs/promises";
await appendFile(logFile, \`\${new Date().toISOString()} \${message}\n\`);
\`\`\`

## Running External Tools

\`\`\`typescript
const bin = Bun.which("tool-name");
const proc = Bun.spawn([bin, ...args], { stdout: "pipe", stderr: "pipe" });
const stdout = await Bun.readableStreamToText(proc.stdout);
await proc.exited;
\`\`\`

## Rules

- \`Bun.file(path).exists()\` is for files only — use \`stat()\` from \`node:fs/promises\` when the path might be a directory
- Always handle paths with \`path.join\` or \`path.resolve\`, never string concatenation
- Prefer \`Bun.write\` over creating a WritableStream unless you need incremental writes
- Parallelize independent reads: \`await Promise.all(paths.map(p => Bun.file(p).text()))\``,
	},
	{
		name: "ts-performance",
		description: "TypeScript/JavaScript performance patterns for Bun — algorithms, async, data structures, memory",
		version: "1.0",
		content: `# TypeScript Performance

Profile before optimizing. Most bottlenecks are algorithmic, not micro-level. An O(n²)→O(n log n) improvement is always worth more than a 2× micro-optimization.

## Core Rule

**Measure → identify the actual bottleneck → fix the algorithm → micro-optimize only if still needed.**

\`\`\`typescript
// Baseline before and after every change
const start = performance.now();
doWork();
console.log(\`\${performance.now() - start}ms\`);

// Bun profiling
bun --prof script.ts
\`\`\`

## Data Structures

Use the right structure for the access pattern:

\`\`\`typescript
// O(1) lookup — use Map or Set, not Array.find()
const index = new Map(items.map(item => [item.id, item]));
const found = index.get(id); // vs items.find(x => x.id === id) O(n)

const seen = new Set<string>();
if (!seen.has(key)) { seen.add(key); process(key); }

// Typed Arrays for numeric data — 3–10× less memory, 5× faster
const data = new Float64Array(1_000_000);

// WeakMap for metadata — GC-friendly, no leak risk
const meta = new WeakMap<object, Metadata>();
\`\`\`

| Structure | Lookup | Use when |
|---|---|---|
| Map | O(1) | Dynamic keys, any key type |
| Set | O(1) | Membership / dedup |
| Object | O(1) | String keys, static shape, JSON |
| Array | O(n) | Ordered, index access |
| Typed Array | O(1) | Numeric data, images, audio |
| WeakMap | O(1) | Object metadata without leaks |

## Algorithms

Single-pass beats chained array methods. Pre-allocate when size is known.

\`\`\`typescript
// Bad — three intermediate arrays
const out = items.filter(x => x > 0).map(x => x * 2).filter(x => x < 100);

// Good — single pass
const out: number[] = [];
for (const x of items) {
  if (x > 0) {
    const v = x * 2;
    if (v < 100) out.push(v);
  }
}

// Pre-allocate when size is known
const result = new Array<number>(items.length);
for (let i = 0; i < items.length; i++) result[i] = transform(items[i]);

// String building — join, never +=
const parts: string[] = [];
for (const item of items) parts.push(\`<li>\${item}</li>\`);
const html = parts.join("");

// Compile regex outside loops
const RE = /^[\\w.-]+@[\\w.-]+\\.[\\w]+$/;
function valid(email: string) { return RE.test(email); }

// Cache loop invariants
const factor = config.settings.factor * 2;
for (const x of items) process(x * factor);
\`\`\`

Loop speed: \`for\` > \`for-of\` > \`forEach\` > \`reduce\`. Use \`for-of\` by default; \`for\` only in proven hot paths.

## Async

Never \`await\` sequentially in a loop. Use \`Promise.all\` for independent operations.

\`\`\`typescript
// Bad — sequential, n × latency
const results = [];
for (const item of items) results.push(await process(item));

// Good — parallel
const results = await Promise.all(items.map(process));

// Batch large workloads to limit concurrency
async function batch<T>(items: T[], fn: (x: T) => Promise<unknown>, size = 50) {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(fn));
  }
}

// Cache in-flight promises to deduplicate concurrent requests
const inflight = new Map<string, Promise<Data>>();
async function fetch_once(key: string): Promise<Data> {
  if (!inflight.has(key)) inflight.set(key, fetchData(key).finally(() => inflight.delete(key)));
  return inflight.get(key)!;
}
\`\`\`

## Memory

\`\`\`typescript
// Reuse buffers — avoid creating new arrays in hot paths
class Processor {
  private buf: number[] = [];
  run(input: number[]) {
    this.buf.length = 0; // clear without realloc
    for (const x of input) this.buf.push(transform(x));
    return this.buf;
  }
}

// Bounded cache — prevent unbounded growth
class BoundedCache<K, V> {
  private m = new Map<K, V>();
  constructor(private max: number) {}
  set(k: K, v: V) {
    if (this.m.size >= this.max) this.m.delete(this.m.keys().next().value!);
    this.m.set(k, v);
  }
  get(k: K) { return this.m.get(k); }
}

// WeakMap for DOM/object metadata — auto-GC
const cache = new WeakMap<Node, ComputedData>();
\`\`\`

## Bun-Specific

\`\`\`typescript
// Native hashing — faster than crypto for non-security use
const hash = Bun.hash(data);
const crc = Bun.hash.crc32(str);

// Built-in SQLite with prepared statements
import { Database } from "bun:sqlite";
const db = new Database("app.db");
const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
const user = stmt.get(id); // reuse prepared statement

// Measure memory
Bun.gc(true);
const before = Bun.memoryUsage().heapUsed;
doWork();
Bun.gc(true);
const used = Bun.memoryUsage().heapUsed - before;
\`\`\`

## Quick Checklist

1. \`Map\`/\`Set\` instead of \`Array.find\`/\`includes\` in lookups
2. \`Promise.all\` instead of sequential awaits
3. Single-pass loop instead of chained \`filter().map()\`
4. Pre-allocate arrays when size is known
5. Compile regex outside loops
6. Cache expensive property accesses in local variables
7. \`array.join("")\` not \`+=\` for string building
8. \`structuredClone\` not \`JSON.parse(JSON.stringify(...))\` for deep copy
9. \`Typed Array\` for numeric-heavy data
10. \`WeakMap\` for object metadata`,
	},
];
