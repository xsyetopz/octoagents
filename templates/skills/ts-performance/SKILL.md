# TypeScript Performance Optimization

Profile before optimizing. Most bottlenecks are algorithmic, not micro-optimizations. An O(n²)→O(n log n) improvement always beats a 2x micro-optimization.

## Core Principles

**Measure → Identify real bottleneck → Fix algorithm → Micro-optimize only if still needed.**

```typescript
// Measure baseline before and after each change
const start = performance.now();
doWork();
console.log(`${performance.now() - start}ms`);

// Bun profiling
bun --prof script.ts
```

## Data Structures

Choose the right structure based on access patterns:

```typescript
// O(1) lookup — use Map or Set, not Array.find()
const index = new Map(items.map(item => [item.id, item]));
const found = index.get(id); // vs items.find(x => x.id === id) O(n)

const seen = new Set<string>();
if (!seen.has(key)) { seen.add(key); process(key); }

// Typed arrays for numeric data — 3-10x less memory, 5x faster
const data = new Float64Array(1_000_000);

// WeakMap for metadata — GC-friendly, no leak risk
const meta = new WeakMap<object, Metadata>();
```

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

```typescript
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
for (const item of items) parts.push(`<li>${item}</li>`);
const html = parts.join("");

// Compile regex outside loops
const RE = /^[\w.-]+@[\w.-]+\.[\w]+$/;
function valid(email: string) { return RE.test(email); }

// Cache loop invariants
const factor = config.settings.factor * 2;
for (const x of items) process(x * factor);
```

Loop speed: `for` > `for-of` > `forEach` > `reduce`. Default to `for-of`; use `for` only in validated hot paths.

## Async

Never sequential `await` in loops. Use `Promise.all` for independent operations.

```typescript
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
```

## Memory

```typescript
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
```

## Bun Specific

```typescript
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
```

## Quick Checklist

1. Use `Map`/`Set` for lookups, not `Array.find`/`includes`
2. Use `Promise.all` for parallelism, not sequential await
3. Single pass instead of chained `filter().map()`
4. Preallocate arrays when size is known
5. Compile regex outside loops
6. Cache expensive property access to local variables
7. Use `array.join("")` for string building, not `+=`
8. Use `structuredClone` for deep copy, not `JSON.parse(JSON.stringify(...))`
9. Use `Typed Array` for numeric-dense data
10. Use `WeakMap` for object metadata