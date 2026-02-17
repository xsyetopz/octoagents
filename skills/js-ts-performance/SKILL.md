---
name: js-ts-performance
description: Expert-level JavaScript/TypeScript performance optimization for Bun. Use when analyzing, refactoring, or writing performance-critical JS/TS code. Covers ES2024+ features, runtime-native APIs, built-in optimizations, memory efficiency, algorithmic improvements, and Bun-specific patterns.
---

# JS/TS Performance Optimization Skill

Expert guidance for writing high-performance JavaScript and TypeScript using ES2024+ features, modern runtime optimizations, and engine-aware best practices.

## When to Use This Skill

Trigger this skill when:
- User asks about JS/TS performance, optimization, or speed improvements
- Code has performance issues (slow execution, high memory usage)
- Building performance-critical applications (real-time, high-throughput)
- Optimizing hot paths or frequently executed code
- User mentions benchmarking, profiling, or performance testing
- Refactoring with performance in mind

## Core Principles

1. **Measure First, Optimize Second** - Always benchmark before and after
2. **Profile-Guided Optimization** - Use profilers to find real bottlenecks
3. **Context Matters** - Server vs browser, hot path vs cold path, data size
4. **Modern First** - Leverage ES2024+ features and engine optimizations
5. **Built-ins Win** - Native methods are JIT-optimized and typically faster
6. **Algorithm > Micro-optimization** - O(n²) → O(n log n) beats clever tricks

## Quick Reference - Common Patterns

### Data Structures
```typescript
// Use Set for uniqueness checks - O(1) vs Array O(n)
const seen = new Set();
seen.add(value);

// Use Map for key-value lookups with frequent updates
const cache = new Map<string, Data>();

// Use Typed Arrays for numeric data - massive speedup
const data = new Float64Array(1_000_000);
```

### Strings
```typescript
// Join arrays instead of concatenating in loops
const result = parts.join("");

// Template literals for URL building
const url = `https://api.com/users/${id}`;
```

### Arrays
```typescript
// Avoid intermediate arrays - single pass
const result: number[] = [];
for (const x of items) {
  if (condition(x)) result.push(transform(x));
}

// Pre-allocate when size is known
const result = new Array(size);
```

### Objects
```typescript
// Keep object shapes consistent (monomorphic)
interface User { name: string; email: string; }
const u1: User = { name: "A", email: "a@b.com" };
const u2: User = { name: "B", email: "c@d.com" };

// Cache repeated property access
const value = obj.config.settings.value;
// Use value multiple times
```

### Async
```typescript
// Parallel execution
const [a, b, c] = await Promise.all([fetch1(), fetch2(), fetch3()]);

// Avoid async in hot loops - batch instead
await Promise.all(items.map(item => processItem(item)));
```

## Workflow

### Step 1: Identify the Problem
- Use Bun's built-in profiler (bun --prof)
- Find actual bottlenecks - don't guess
- Measure current performance with benchmarks

### Step 2: Choose the Right Approach
Load the appropriate reference guide based on the issue:

**Data Structure Issues:**
- Frequent lookups in arrays → [Data Structures Guide](./reference/data-structures.md)
- Heavy numeric operations → [Data Structures Guide](./reference/data-structures.md) (Typed Arrays)

**Algorithm Issues:**
- Slow loops → [Algorithms Guide](./reference/algorithms.md)
- Nested iterations → [Algorithms Guide](./reference/algorithms.md)
- String/array operations → [Algorithms Guide](./reference/algorithms.md)

**Memory Issues:**
- High memory usage → [Memory Guide](./reference/memory.md)
- Garbage collection pauses → [Memory Guide](./reference/memory.md)
- Memory leaks → [Memory Guide](./reference/memory.md)

**Async/Promise Issues:**
- Sequential awaits → [Async Guide](./reference/async.md)
- Promise overhead → [Async Guide](./reference/async.md)

**Runtime-Specific:**
- Bun optimization patterns → [Runtime Guide](./reference/runtime-specific.md) (PRIMARY)

**Benchmarking:**
- Need to measure performance → [Benchmarking Guide](./reference/benchmarking.md)

### Step 3: Implement & Verify
- Apply optimizations from reference guides
- Benchmark the changes
- Verify correctness with tests
- Profile again to confirm improvement

## Red Flags - High Priority Issues

Watch for these common performance killers:
- ❌ Nested loops over large datasets → Index with Map/Set
- ❌ Sorting in loops → Sort once outside
- ❌ `.includes()` in hot paths → Use Set
- ❌ Repeated string concatenation → Use array.join()
- ❌ Sequential `await` calls → Use Promise.all()
- ❌ Polymorphic objects → Keep shapes consistent
- ❌ Try-catch in hot paths → Prevent optimization bailout
- ❌ Repeated property access → Cache in local variable
- ❌ Array operations creating intermediates → Single pass with for loop

## Quick Wins Checklist

Apply these in order of impact:
1. ✅ Use Map/Set instead of objects for lookups (huge impact)
2. ✅ Use Typed Arrays for numeric data (massive speedup)
3. ✅ Batch async operations with Promise.all (2-10x faster)
4. ✅ Pre-allocate arrays when size known (reduces GC)
5. ✅ Use for-of instead of forEach for simple loops (faster)
6. ✅ Cache expensive property accesses (avoids re-traversal)
7. ✅ Use native methods over lodash (tree-shaking + JIT)
8. ✅ Avoid intermediate array operations (map→filter→map)
9. ✅ Use structuredClone instead of JSON parse/stringify
10. ✅ Compile regex outside loops (avoid re-compilation)

## Reference Documentation

Load these guides as needed during optimization:

### Core Optimization Guides
- [Data Structures](./reference/data-structures.md) - Arrays, Sets, Maps, Typed Arrays, object patterns
- [Algorithms](./reference/algorithms.md) - Loops, string operations, math tricks, array operations
- [Memory Management](./reference/memory.md) - GC optimization, object pooling, WeakMap/WeakSet
- [Async Patterns](./reference/async.md) - Promise optimization, async/await best practices

### Platform-Specific
- [Runtime Optimizations](./reference/runtime-specific.md) - Bun-specific APIs and runtime patterns

### Measurement
- [Benchmarking & Profiling](./reference/benchmarking.md) - How to measure, profile, and validate improvements

## Key Diagnostic Questions

Before optimizing, ask:
1. What's the actual bottleneck? (Use Bun --prof)
2. What's the current performance metric? (Baseline)
3. What's the target performance? (Goal)
4. What's the data size in production? (Scale)
5. Is this a hot path? (Execution frequency)
6. Are you on Bun? (Use Bun-specific patterns)

## Remember

- **Make it work, make it right, make it fast** - in that order
- **Profile, don't guess** - Intuition is often wrong
- **Algorithm first** - 100x gains from O(n²)→O(n log n) vs 2x from micro-opts
- **Readability matters** - Optimize hot paths, keep cold paths clean
- **Modern features** - ES2024+ built-ins are fast and well-optimized
- **Test on production data** - Toy datasets hide real performance characteristics
