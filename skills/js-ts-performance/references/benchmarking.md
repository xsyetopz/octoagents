# Benchmarking Guide for Bun

Measuring and profiling performance in Bun with complete code examples.

## Basic Measurement

```typescript
console.time("operation");
computeExpensive();
console.timeEnd("operation");

const start = performance.now();
for (let i = 0; i < 1000000; i++) {
  computeExpensive();
}
const elapsed = performance.now() - start;
console.log(`Executed in ${elapsed.toFixed(2)}ms`);
```

## Proper Benchmarking

Never benchmark without:

1. **Warmup runs** - JIT compiler needs time to optimize
2. **Multiple iterations** - Average removes noise
3. **Isolated environment** - Close other apps
4. **Statistical analysis** - Report P50, P95, P99

```typescript
async function benchmark(name: string, fn: () => void, iterations: number = 1000) {
  for (let i = 0; i < 100; i++) {
    fn();
  }

  Bun.gc(true);
  await new Promise(r => setTimeout(r, 100));

  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }

  times.sort((a, b) => a - b);
  const avg = times.reduce((a, b) => a + b) / times.length;
  const p95 = times[Math.floor(times.length * 0.95)];
  const p99 = times[Math.floor(times.length * 0.99)];

  console.log(`${name}:
    Min:  ${times[0].toFixed(3)}ms
    Avg:  ${avg.toFixed(3)}ms
    P95:  ${p95.toFixed(3)}ms
    P99:  ${p99.toFixed(3)}ms
    Max:  ${times[times.length - 1].toFixed(3)}ms`);

  return { min: times[0], avg, max: times[times.length - 1] };
}

const result = await benchmark("array sum", () => {
  let sum = 0;
  for (let i = 0; i < 1_000_000; i++) {
    sum += i;
  }
  return sum;
}, 500);
```

## Built-in Bun Benchmarks

Bun provides `bun:test` with benchmark support:

```typescript
import { bench, describe } from "bun:test";

describe("Math operations", () => {
  const arr = Array.from({ length: 1_000_000 }, (_, i) => i);

  bench("for loop sum", () => {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) sum += arr[i];
    return sum;
  });

  bench("for-of loop sum", () => {
    let sum = 0;
    for (const val of arr) sum += val;
    return sum;
  });

  bench("reduce sum", () => arr.reduce((a, b) => a + b, 0));
});

// bun run math.bench.ts
```

## Profiling Tools

### CPU Profiling

```bash
# Generate CPU profile
bun --prof script.ts

# Output: Bun has written a cpu profile to isolate-0x....log
# Contains all function calls and timing

# Analyze with Chrome DevTools
# Open chrome://inspect
# Or: bun profile --analyze isolate-*.log
```

### Memory Profiling

```bash
# Generate heap profile
bun --prof-heap script.ts

# Output: Heap snapshot showing memory allocations
# Analyze with browser DevTools
```

## Comparison Benchmark

```typescript
async function compareMethods(
  methods: Record<string, () => any>,
  iterations = 1000
) {
  const results: Record<string, any> = {};

  for (const [name, fn] of Object.entries(methods)) {
    results[name] = await benchmark(name, fn, iterations);
  }

  const fastest = Object.entries(results).sort((a, b) => a[1].avg - b[1].avg)[0];
  console.log(`\n🏆 Winner: ${fastest[0]} (${fastest[1].avg.toFixed(3)}ms)`);

  for (const [name, result] of Object.entries(results)) {
    const ratio = result.avg / fastest[1].avg;
    console.log(`${name}: ${(ratio).toFixed(2)}x`);
  }

  return results;
}

const results = await compareMethods({
  "for loop": () => {
    let sum = 0;
    for (let i = 0; i < 1_000_000; i++) {
      sum += i;
    }
    return sum;
  },
  "for-of": () => {
    let sum = 0;
    for (const x of Array.from({ length: 1_000_000 }, (_, i) => i)) {
      sum += x;
    }
    return sum;
  },
  "reduce": () => {
    return Array.from({ length: 1_000_000 }, (_, i) => i).reduce((a, b) => a + b, 0);
  }
}, 500);
```

## Async Benchmark

```typescript
async function benchmarkAsync(
  name: string,
  fn: () => Promise<any>,
  iterations = 100
) {
  for (let i = 0; i < 10; i++) {
    await fn();
  }

  Bun.gc(true);
  await new Promise(r => setTimeout(r, 100));

  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }

  times.sort((a, b) => a - b);
  const avg = times.reduce((a, b) => a + b) / times.length;

  console.log(`${name}: ${avg.toFixed(2)}ms avg`);
  return avg;
}

const url = "https://api.example.com";

await benchmarkAsync(
  "Sequential fetches",
  async () => {
    await fetch(url);
    await fetch(url);
    await fetch(url);
  },
  50
);

await benchmarkAsync(
  "Parallel Promise.all",
  async () => {
    await Promise.all([fetch(url), fetch(url), fetch(url)]);
  },
  50
);
```

## Key Rules

1. **Always warmup** - First runs are JIT-compiled, not representative
2. **Run many iterations** - At least 100, ideally 1000+ for stability
3. **Measure multiple percentiles** - P50, P95, P99 matter for tail latency
4. **Test in similar environment** - Production-like CPU, RAM, load
5. **Profile before micro-benchmarking** - Find real bottlenecks first
6. **Algorithm wins** - O(n log n) vs O(n²) beats any micro-optimization
7. **Force GC between runs** - `Bun.gc(true)` for clean measurements
