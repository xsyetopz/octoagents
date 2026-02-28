import type { SkillDefinition } from "./types.ts";

export const SKILL_DEFINITIONS: SkillDefinition[] = [
	{
		name: "git-workflow",
		description: "Git branching, commit messages, and PR workflow standards",
		version: "1.0",
		content: `# Git Workflow

## Commit Messages

Use Conventional Commits: \`type(scope): description\`

Types: \`feat\`, \`fix\`, \`refactor\`, \`test\`, \`docs\`, \`chore\`, \`perf\`, \`ci\`

Rules:
1. Imperative mood: write "add feature" not "added feature"
2. Subject line no longer than 72 characters
3. Body explains why, not what
4. Reference issues: \`Closes #123\`

## Branch Naming

| Branch | Purpose |
|---|---|
| \`main\` / \`master\` | Production code |
| \`feat/<name>\` | New feature development |
| \`fix/<name>\` | Bug fixes |
| \`refactor/<name>\` | Refactoring without behavior changes |
| \`chore/<name>\` | Maintenance tasks |

## Pull Request

1. Title follows Conventional Commits format
2. Description includes: what changed, why, how to test
3. Keep PRs focused — one PR solves one problem
4. Rebase to main before merge, prefer squash merge for small PRs

## Workflow

1. Create branch from main
2. Commit focused changes
3. Run tests before pushing
4. Create PR with clear description
5. Address review feedback
6. Merge after approval`,
	},
	{
		name: "code-review-checklist",
		description: "Security, quality, and style review checklist",
		version: "1.0",
		content: `# Code Review Checklist

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
- [ ] Test names describe the test scenario`,
	},
	{
		name: "test-patterns",
		description: "Testing standards and coverage expectations",
		version: "1.0",
		content: `# Test Patterns

## Test Structure

Follow the AAA pattern:
\`\`\`typescript
// Arrange
const input = buildTestInput();

// Act
const result = systemUnderTest(input);

// Assert
expect(result).toEqual(expectedOutput);
\`\`\`

## Naming Conventions

Test names should read as complete sentences:
- \`it("returns empty array when input is empty")\`
- \`it("throws InvalidArgumentError when name exceeds 100 characters")\`

## Coverage Expectations

| Type | Coverage Scope |
|---|---|
| Unit tests | All public functions, all branches |
| Integration tests | All API endpoints, all database operations |
| E2E tests | Critical user flows |

## Test Isolation

1. Each test is independent — no shared mutable state
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
- Asserting error message strings (unstable)`,
	},
	{
		name: "refactor-guide",
		description: "Safe refactoring patterns and techniques",
		version: "1.0",
		content: `# Refactoring Guide

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
\`const MAX_RETRIES = 3\` instead of \`if (attempts > 3)\`

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
- Check diff for unexpected changes`,
	},
	{
		name: "documentation-standards",
		description: "Documentation structure, API docs, README standards",
		version: "1.0",
		content: `# Documentation Standards

## README Structure

Project README must include (in order):
1. One-sentence description
2. Quick start (minimal steps to run)
3. Installation instructions
4. Usage examples
5. Configuration reference
6. Contributing guide (or link)
7. License

## API Documentation

Each public function/method needs documentation of:
- Purpose (one sentence)
- Parameters (with types and constraints)
- Return value (with type)
- Throw/reject conditions
- Usage examples

## Code Comments

Comment why, not what:

\`\`\`typescript
// Wrong: increment counter
counter++;

// Correct: compensate for off-by-one in upstream API response
counter++;
\`\`\`

Complex algorithms need reference comments:
\`\`\`typescript
// Using Fisher-Yates shuffle: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
\`\`\`

## Markdown Standards

- Blank line between sections
- Code blocks must have language tags
- Use reference-style for long links
- Align table header separators

## Changelog

Format: Keep a Changelog (https://keepachangelog.com)
Sections: Added, Changed, Deprecated, Removed, Fixed, Security`,
	},
	{
		name: "project-setup",
		description: "Project scaffolding and configuration patterns",
		version: "1.0",
		content: `# Project Configuration

## Directory Standards

\`\`\`
src/          # Source code
tests/        # Test files (mirror src/ structure)
docs/         # Documentation
dist/         # Build output (gitignore)
scripts/      # Build and tool scripts
\`\`\`

## Configuration Files

Project root must contain:
- \`.gitignore\` — ignore build artifacts, secrets, editor files
- \`README.md\` — project overview
- \`package.json\` / \`Cargo.toml\` / language-appropriate manifest

TypeScript projects also need:
- \`tsconfig.json\` — strict mode recommended
- \`biome.jsonc\` or \`eslint.config.js\` — linting/formatting

## Environment Variables

1. Document all environment variables in \`.env.example\`
2. Never commit \`.env\` files
3. Use \`SCREAMING_SNAKE_CASE\` for environment variable names
4. Validate required environment variables at startup, fail fast with clear errors

## Dependency Management

- Lock exact versions in lockfile (\`bun.lock\`, \`package-lock.json\`)
- Separate dev dependencies from runtime dependencies
- Audit dependencies before adding
- Prefer small focused packages over large frameworks

## Script Naming

Use consistent script names across projects:
| Script | Purpose |
|---|---|
| \`build\` | Compile/bundle |
| \`test\` | Run test suite |
| \`lint\` | Run code linting |
| \`format\` | Run formatting |
| \`start\` / \`dev\` | Run application`,
	},
	{
		name: "security-checklist",
		description: "Common vulnerability patterns checklist",
		version: "1.0",
		content: `# Security Checklist

## Input Validation

- [ ] Validate all user input before use (type, length, format, range)
- [ ] Reject on validation failure — do not sanitize and continue
- [ ] Validate file paths against traversal (\`../\` sequences)
- [ ] Validate URLs against SSRF (Server-Side Request Forgery)

## Authentication & Authorization

- [ ] Require authentication before sensitive operations
- [ ] Check authorization per resource, not just per endpoint
- [ ] Tokens/Sessions can expire and be revoked
- [ ] Hash passwords with bcrypt/argon2 (never MD5/SHA1 alone)
- [ ] Login endpoints have brute-force protection

## Data Handling

- [ ] Secrets never logged
- [ ] PII minimized — only collect required data
- [ ] Sensitive data encrypted at rest
- [ ] Enforce TLS for external communication
- [ ] SQL queries parameterized (no string concatenation)

## Dependencies

- [ ] No known CVEs in direct dependencies
- [ ] Dependency versions locked
- [ ] No deprecated packages in critical paths

## API Security

- [ ] Rate limiting on public endpoints
- [ ] CORS configured to allow only known origins
- [ ] Content-Security-Policy header set
- [ ] Sensitive endpoints not exposed without authentication

## Secret Management

- [ ] No API keys or passwords in source code
- [ ] Environment variable names don't contain loggable credentials
- [ ] Secrets injected via environment variables, never config files in repo
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
| Platform | Tool |
|---|---|
| Node.js | \`--prof\`, \`clinic.js\`, Chrome DevTools |
| Bun | Built-in profiler |
| Database | \`EXPLAIN ANALYZE\`, slow query log |

## Common Bottlenecks

### Database

- N+1 queries: batch load related data, use JOIN or \`IN\` clause
- Missing indexes: add indexes on WHERE/JOIN/ORDER BY columns
- Over-fetching: only SELECT needed columns
- Connection pool exhaustion: tune pool size, release connections promptly

### Computation

- Repeated computation: memoize pure functions with stable inputs
- Unnecessary serialization: pass objects in-process instead of JSON strings
- Blocking event loop: move CPU-intensive work to worker threads

### Memory

- Memory leaks: event listeners not removed, caches growing without eviction
- Large object graphs: stream large datasets instead of loading all at once
- Frequent GC: reduce allocation rate in hot paths

## Caching Strategies

Cache at the right layer:
1. In-process (fastest, not shared across instances)
2. Redis/Memcached (shared, survives restarts)
3. CDN (static assets and cacheable API responses)

Cache invalidation rules:
- Set explicit TTL — no permanent cache
- Invalidate on write
- Cache stampede protection: use probabilistic early expiration or locks

## Frontend Performance

- Bundle size: code splitting, tree-shaking, analyze with source-map-explorer
- Images: use WebP, lazy load below-the-fold content
- Critical path: inline critical CSS, defer non-critical JS
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1`,
	},
	{
		name: "bun-file-io",
		description: "Using Bun native APIs for file I/O and directory operations",
		version: "1.0",
		content: `# Bun File I/O

Use Bun native APIs for file operations. Do not execute \`cat\`, \`ls\`, \`mkdir\`, \`rm\` as shell commands.

## Reading Files

\`\`\`typescript
const file = Bun.file(path);
const exists = await file.exists(); // returns false for directories
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

Use \`node:fs/promises\` for directories (Bun.file doesn't support directories):

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

1. \`Bun.file(path).exists()\` is for files only — use \`stat()\` from \`node:fs/promises\` when path might be a directory
2. Must use \`path.join\` or \`path.resolve\` for paths, no string concatenation
3. Prefer \`Bun.write\` over creating WritableStream unless incremental writes are needed
4. Parallelize independent reads: \`await Promise.all(paths.map(p => Bun.file(p).text()))\``,
	},
	{
		name: "ts-performance",
		description:
			"TypeScript/JavaScript performance patterns—algorithms, async, data structures, memory",
		version: "1.0",
		content: `# TypeScript Performance Optimization

Profile before optimizing. Most bottlenecks are algorithmic, not micro-optimizations. An O(n²)→O(n log n) improvement always beats a 2x micro-optimization.

## Core Principles

**Measure → Identify real bottleneck → Fix algorithm → Micro-optimize only if still needed.**

\`\`\`typescript
// Measure baseline before and after each change
const start = performance.now();
doWork();
console.log(\`\${performance.now() - start}ms\`);

// Bun profiling
bun --prof script.ts
\`\`\`

## Data Structures

Choose the right structure based on access patterns:

\`\`\`typescript
// O(1) lookup — use Map or Set, not Array.find()
const index = new Map(items.map(item => [item.id, item]));
const found = index.get(id); // vs items.find(x => x.id === id) O(n)

const seen = new Set<string>();
if (!seen.has(key)) { seen.add(key); process(key); }

// Typed arrays for numeric data — 3-10x less memory, 5x faster
const data = new Float64Array(1_000_000);

// WeakMap for metadata — GC-friendly, no leak risk
const meta = new WeakMap<object, Metadata>();
\`\`\`

| Structure | Lookup Complexity | Use Case |
|---|---|---|
| Map | O(1) | Dynamic keys, arbitrary key types |
| Set | O(1) | Membership testing/deduplication |
| Object | O(1) | String keys, static shape, JSON |
| Array | O(n) | Ordered, indexed access |
| Typed Array | O(1) | Numeric data, images, audio |
| WeakMap | O(1) | Object metadata without leaks |

## Algorithms

Single pass over chained array methods. Preallocate when size is known.

\`\`\`typescript
// Wrong — three intermediate arrays
const out = items.filter(x => x > 0).map(x => x * 2).filter(x => x < 100);

// Correct — single pass
const out: number[] = [];
for (const x of items) {
  if (x > 0) {
    const v = x * 2;
    if (v < 100) out.push(v);
  }
}

// Preallocate when size is known
const result = new Array<number>(items.length);
for (let i = 0; i < items.length; i++) result[i] = transform(items[i]);

// String building — use join, not +=
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

Loop speed: \`for\` > \`for-of\` > \`forEach\` > \`reduce\`. Default to \`for-of\`; use \`for\` only in validated hot paths.

## Async

Never sequential \`await\` in loops. Use \`Promise.all\` for independent operations.

\`\`\`typescript
// Wrong — sequential execution, n × latency
const results = [];
for (const item of items) results.push(await process(item));

// Correct — parallel execution
const results = await Promise.all(items.map(process));

// Batch large workloads to limit concurrency
async function batch<T>(items: T[], fn: (x: T) => Promise<unknown>, size = 50) {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(fn));
  }
}

// Cache in-flight requests, dedupe concurrent requests
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
    this.buf.length = 0; // clear without reallocating
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

// WeakMap for DOM/object metadata — automatic GC
const cache = new WeakMap<Node, ComputedData>();
\`\`\`

## Bun Specific

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

1. Use \`Map\`/\`Set\` for lookups, not \`Array.find\`/\`includes\`
2. Use \`Promise.all\` for parallelism, not sequential await
3. Single pass instead of chained \`filter().map()\`
4. Preallocate arrays when size is known
5. Compile regex outside loops
6. Cache expensive property access to local variables
7. Use \`array.join("")\` for string building, not \`+=\`
8. Use \`structuredClone\` for deep copy, not \`JSON.parse(JSON.stringify(...))\`
9. Use \`Typed Array\` for numeric-dense data
10. Use \`WeakMap\` for object metadata`,
	},
];
