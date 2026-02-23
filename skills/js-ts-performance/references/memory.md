# Memory Management Reference

Optimizing memory allocation and garbage collection in Bun.

## Object Pooling

Reuse objects instead of creating new ones to reduce garbage collection pressure. Can reduce GC pauses by 50-80%.

```typescript
class ObjectPool<T> {
  private available: T[] = [];
  private inUse = new Set<T>();
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void, initialSize: number = 10) {
    this.factory = factory;
    this.reset = reset;

    for (let i = 0; i < initialSize; i++) {
      this.available.push(factory());
    }
  }

  acquire(): T {
    let obj = this.available.pop();
    if (!obj) {
      obj = this.factory();
    }
    this.inUse.add(obj);
    return obj;
  }

  release(obj: T): void {
    if (!this.inUse.has(obj)) {
      throw new Error("Object not from this pool");
    }
    this.inUse.delete(obj);
    this.reset(obj);
    this.available.push(obj);
  }

  get stats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size
    };
  }
}

class Point {
  x: number = 0;
  y: number = 0;
  z: number = 0;
}

const pointPool = new ObjectPool(
  () => new Point(),
  (p) => { p.x = 0; p.y = 0; p.z = 0; },
  100
);

function allocatePoints(count: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    points.push({ x: Math.random(), y: Math.random(), z: Math.random() });
  }
  return points;
}

function pooledPoints(count: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    const p = pointPool.acquire();
    p.x = Math.random();
    p.y = Math.random();
    p.z = Math.random();
    points.push(p);
  }
  return points;
}

class LimitedObjectPool<T> {
  private available: T[] = [];
  private inUse = new Set<T>();
  private maxSize: number;

  constructor(
    private factory: () => T,
    private reset: (obj: T) => void,
    maxSize: number = 1000
  ) {
    this.maxSize = maxSize;
  }

  acquire(): T {
    let obj = this.available.pop();
    if (!obj && this.inUse.size < this.maxSize) {
      obj = this.factory();
    }
    if (obj) {
      this.inUse.add(obj);
    }
    return obj || undefined as any;
  }

  release(obj: T): void {
    if (this.inUse.delete(obj)) {
      this.reset(obj);
      if (this.available.length < this.maxSize * 0.1) {
        this.available.push(obj);
      }
    }
  }
}
```

## WeakMap & WeakSet

Automatic garbage collection without memory leaks.

```typescript
const metadata = new WeakMap();
metadata.set(domNode, { cached: data });

const processed = new WeakSet();
if (!processed.has(obj)) {
  processItem(obj);
  processed.add(obj);
}
```

## Avoiding Memory Leaks

```typescript
class Component {
  private onResize = () => { /*...*/ };

  constructor() {
    window.addEventListener("resize", this.onResize);
  }

  destroy() {
    window.removeEventListener("resize", this.onResize);
  }
}

class Poller {
  private intervalId;

  constructor() {
    this.intervalId = setInterval(() => this.poll(), 1000);
  }

  destroy() {
    clearInterval(this.intervalId);
  }
}

function createHandler() {
  const largeData = new Array(1000000);
  const needed = largeData[0];
  return () => console.log(needed);
}

class BoundedCache {
  constructor(private maxSize) { this.cache = new Map(); }

  set(key, value) {
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const first = this.cache.keys().next().value;
      this.cache.delete(first);
    }
    this.cache.set(key, value);
  }
}
```

## Reducing Allocations

Minimize garbage collection pauses by reusing buffers and data structures.

```typescript
class DataProcessor {
  private buffer: number[] = [];
  private output: number[] = [];

  processData(input: number[]): number[] {
    if (this.buffer.length < input.length) {
      this.buffer = new Array(input.length);
    }

    for (let i = 0; i < input.length; i++) {
      this.buffer[i] = input[i] * 2;
    }

    this.output.length = 0;
    this.output.push(...this.buffer.slice(0, input.length));
    return this.output;
  }
}

function buildString(count: number): string {
  const parts: string[] = [];

  for (let i = 0; i < count; i++) {
    parts.push(i.toString());
  }

  return parts.join(",");
}

console.time("join");
const arr = Array.from({ length: 100000 }, (_, i) => i);
const joined = arr.join(",");
console.timeEnd("join");

console.time("concat");
let concat = "";
for (let i = 0; i < 100000; i++) {
  concat += i + ",";
}
console.timeEnd("concat");

class Vector {
  static pool = new ObjectPool(
    () => new Array(3),
    v => { v[0] = 0; v[1] = 0; v[2] = 0; }
  );

  static add(a: number[], b: number[]): number[] {
    const result = this.pool.acquire();
    result[0] = a[0] + b[0];
    result[1] = a[1] + b[1];
    result[2] = a[2] + b[2];
    return result;
  }

  static release(v: number[]): void {
    this.pool.release(v);
  }
}

const v1 = Vector.pool.acquire();
const v2 = Vector.pool.acquire();
const sum = Vector.add(v1, v2);
Vector.release(sum);
Vector.release(v1);
Vector.release(v2);
```

## Typed Arrays

3x less memory for numeric data.

```typescript
const points = [
  { x: 1, y: 2 },
  { x: 3, y: 4 }
];

class PointArray {
  private data;

  constructor(count) {
    this.data = new Float64Array(count * 2);
  }

  getX(i) { return this.data[i * 2]; }
  getY(i) { return this.data[i * 2 + 1]; }
  setX(i, v) { this.data[i * 2] = v; }
  setY(i, v) { this.data[i * 2 + 1] = v; }
}

class Flags {
  private bits = 0;
  set(flag) { this.bits |= (1 << flag); }
  has(flag) { return (this.bits & (1 << flag)) !== 0; }
  clear(flag) { this.bits &= ~(1 << flag); }
}
```

## Profiling in Bun

```typescript
function measureOperation<T>(fn: () => T, label: string): T {
  Bun.gc(true);

  const before = Bun.memoryUsage();
  const result = fn();

  Bun.gc(true);
  const after = Bun.memoryUsage();

  const used = after.heapUsed - before.heapUsed;
  const allocated = after.heapTotal - before.heapTotal;

  console.log(`${label}:`);
  console.log(`  Heap used: ${(used / 1024 / 1024).toFixed(2)}MB`);
  console.log(`  Heap alloc: ${(allocated / 1024 / 1024).toFixed(2)}MB`);
  console.log(`  External: ${(after.external / 1024 / 1024).toFixed(2)}MB`);
  console.log(`  RSS: ${(after.rss / 1024 / 1024).toFixed(2)}MB`);

  return result;
}

measureOperation(() => {
  const arr = Array.from({ length: 1000000 }, (_, i) => i);
  return arr.reduce((a, b) => a + b);
}, "Array reduce");

function profileOperation<T>(fn: () => T, label: string): T {
  const timer = performance.now();
  const memory = Bun.memoryUsage();

  const result = fn();

  const elapsed = performance.now() - timer;
  const memoryAfter = Bun.memoryUsage();

  console.log(`${label}: ${elapsed.toFixed(2)}ms, +${((memoryAfter.heapUsed - memory.heapUsed) / 1024 / 1024).toFixed(2)}MB`);
  return result;
}

profileOperation(() => {
  return Array.from({ length: 1000000 }, (_, i) => i * 2);
}, "Array.from with map");

profileOperation(() => {
  const arr = new Array(1000000);
  for (let i = 0; i < 1000000; i++) {
    arr[i] = i * 2;
  }
  return arr;
}, "for-loop with preallocated array");

class AllocationTracker {
  private snapshots: { label: string; memory: any; time: number }[] = [];

  snapshot(label: string) {
    Bun.gc(true);
    this.snapshots.push({
      label,
      memory: Bun.memoryUsage(),
      time: performance.now()
    });
  }

  report() {
    for (let i = 0; i < this.snapshots.length; i++) {
      const snap = this.snapshots[i];
      console.log(`\nSnapshot: ${snap.label}`);
      console.log(`  Heap: ${(snap.memory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  Time: ${snap.time.toFixed(2)}ms`);

      if (i > 0) {
        const prev = this.snapshots[i - 1];
        const heapDiff = snap.memory.heapUsed - prev.memory.heapUsed;
        const timeDiff = snap.time - prev.time;
        console.log(`  Δ Heap: ${(heapDiff / 1024 / 1024).toFixed(2)}MB`);
        console.log(`  Δ Time: ${timeDiff.toFixed(2)}ms`);
      }
    }
  }
}

const tracker = new AllocationTracker();
tracker.snapshot("start");
const arr1 = Array.from({ length: 1000000 }, (_, i) => i);
tracker.snapshot("after array creation");
arr1.length = 0;
tracker.snapshot("after array clear");
tracker.report();
```

## Key Takeaways

1. **Object pools** - Reuse frequently created/destroyed objects, reduce GC pauses by 50-80%
2. **WeakMap** - Metadata without memory leaks, auto-cleanup on GC
3. **Remove event listeners** - Always cleanup in destroy/unmount methods
4. **Clear timers** - setInterval/setTimeout need clearInterval/clearTimeout
5. **Limit cache size** - Implement bounded caches to prevent unbounded growth
6. **Typed arrays** - 3-10x less memory for numeric data, 5x faster processing
7. **Avoid closure captures** - Don't capture large objects in closures
8. **String building** - Use array.join() not concatenation (O(n) vs O(n²))
9. **Reuse buffers** - Pre-allocate arrays and reuse across iterations
10. **Profile with Bun.gc()** - Force GC for accurate memory measurements
11. **Use snapshots** - Track heap growth through phases
