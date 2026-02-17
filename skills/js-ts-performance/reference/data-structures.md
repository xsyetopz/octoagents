# Data Structures Reference

Choosing the right data structures for performance in Bun.

## Lookup Performance Comparison

```typescript
const items = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`
}));

const mapData = new Map(items.map((item, i) => [i, item]));
console.time("Map.get");
for (let i = 0; i < 10000; i++) {
  mapData.get(i);
}
console.timeEnd("Map.get");

const objData = Object.fromEntries(
  items.map((item, i) => [`key${i}`, item])
);
console.time("Object.get");
for (let i = 0; i < 10000; i++) {
  objData[`key${i}`];
}
console.timeEnd("Object.get");

console.time("Array.find");
for (let i = 0; i < 1000; i++) {
  items.find(x => x.id === i);
}
console.timeEnd("Array.find");

const setData = new Set(items.map(item => item.id));
console.time("Set.has");
for (let i = 0; i < 10000; i++) {
  setData.has(i);
}
console.timeEnd("Set.has");

// Set.has ~0.05ms (best) → Map ~0.1ms → Object ~0.15ms → Array.find ~50ms
```

## When to Use Each

```typescript
// Map: any keys, frequent changes
const userMap = new Map();
userMap.set(userId, userData);

// Object: string keys, static shape
const config = { apiKey: "...", timeout: 5000 };

// Set: deduplication, membership
const unique = new Set(items);

// Array: ordered, indexed access
const items = [1, 2, 3];
```

## Typed Arrays (Numeric Data)

3x-10x memory savings on numeric data with faster processing.

```typescript
const points = Array.from({ length: 1000000 }, (_, i) => ({
  x: Math.random(),
  y: Math.random(),
  z: Math.random()
}));

const pointData = new Float64Array(3000000);
for (let i = 0; i < 1000000; i++) {
  pointData[i * 3] = Math.random();
  pointData[i * 3 + 1] = Math.random();
  pointData[i * 3 + 2] = Math.random();
}

const x = points[0].x;

const x = pointData[0];

function processObjectPoints(points) {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    sum += points[i].x + points[i].y + points[i].z;
  }
  return sum;
}

function processTypedArrayPoints(data) {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
  }
  return sum;
}

const i8 = new Int8Array(100);
const u8 = new Uint8Array(100);
const i32 = new Int32Array(100);
const f32 = new Float32Array(100);
const f64 = new Float64Array(100);
const bigI64 = new BigInt64Array(100);

class ImageBuffer {
  width: number;
  height: number;
  pixels: Uint8Array;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.pixels = new Uint8Array(width * height * 4);
  }

  setPixel(x: number, y: number, r: number, g: number, b: number, a: number) {
    const idx = (y * this.width + x) * 4;
    this.pixels[idx] = r;
    this.pixels[idx + 1] = g;
    this.pixels[idx + 2] = b;
    this.pixels[idx + 3] = a;
  }

  getPixel(x: number, y: number): [number, number, number, number] {
    const idx = (y * this.width + x) * 4;
    return [
      this.pixels[idx],
      this.pixels[idx + 1],
      this.pixels[idx + 2],
      this.pixels[idx + 3]
    ];
  }
}

// 4K resolution image = 4096 × 2160 × 4 bytes = 35MB
// With objects = 200MB+
// With Uint8Array = 35MB + small overhead
const img = new ImageBuffer(4096, 2160);
```

## Structure of Arrays vs Array of Structs

### Bad (Array of Structs)

```typescript
const users = [
  { id: 1, name: "Alice", age: 30 },
  { id: 2, name: "Bob", age: 25 },
  { id: 3, name: "Charlie", age: 35 }
];
```

### Good (Structure of Arrays)

```typescript
const users = {
  ids: new Uint32Array([1, 2, 3]),
  names: ["Alice", "Bob", "Charlie"],
  ages: new Uint8Array([30, 25, 35])
};
```

## WeakMap & WeakSet (No Memory Leaks)

Keys are garbage-collected when not referenced elsewhere. Perfect for metadata.

```typescript
const privateData = new WeakMap();

class User {
  constructor(name: string, password: string) {
    this.name = name;
    privateData.set(this, { password });
  }

  checkPassword(guess: string): boolean {
    const data = privateData.get(this);
    return data?.password === guess;
  }
}

const user = new User("Alice", "secret123");
user.checkPassword("secret123");

const nodeMetadata = new WeakMap();

function attachMetadata(element: HTMLElement, metadata: any) {
  nodeMetadata.set(element, metadata);
}

function getMetadata(element: HTMLElement): any {
  return nodeMetadata.get(element);
}

const hookStates = new WeakMap();

function useState(component: any, initialValue: any) {
  if (!hookStates.has(component)) {
    hookStates.set(component, { value: initialValue });
  }
  return hookStates.get(component).value;
}

// WeakSet for tracking objects without preventing GC
const processed = new WeakSet();

function processItem(obj: any) {
  if (processed.has(obj)) {
    console.log("Already processed");
    return;
  }

  doWork(obj);

  processed.add(obj);
}

const item = { id: 1 };
processItem(item); // Processed
processItem(item); // Skips - already processed

```

### Bad (Regular Map retains objects)

```typescript
const evilMap = new Map();
items.forEach(item => evilMap.set(item, metadata));
```

### Good (WeakMap allows GC)

```typescript
const goodMap = new WeakMap();
items.forEach(item => goodMap.set(item, metadata));
```

## Immutable Structures

For safe concurrent access without manual synchronization.

```typescript
// Frozen objects prevent modification
const config = Object.freeze({
  timeout: 5000,
  retries: 3
});

// Attempting to modify has no effect (or error in strict mode)
config.timeout = 10000;

// Spread creates new object (functional style)
const updated = { ...config, timeout: 10000 };
// Original untouched, new object created

// Deep copy with nested structures
const user = {
  name: "Alice",
  settings: { theme: "dark", language: "en" },
  tags: ["admin", "user"]
};

// Shallow copy - nested objects are references
const copy1 = { ...user };
copy1.settings.theme = "light"; // Affects original!

// Deep copy - all levels are new objects
const copy2 = JSON.parse(JSON.stringify(user));
copy2.settings.theme = "light"; // Original untouched

// Structured clone for proper deep copy
const copy3 = structuredClone(user);
copy3.settings.theme = "light"; // Original safe

function copyMap<K, V>(map: Map<K, V>): Map<K, V> {
  return new Map(map);
}

function copySet<T>(set: Set<T>): Set<T> {
  return new Set(set);
}

function copyTypedArray<T extends ArrayLike<number>>(arr: T): T {
  return new (arr.constructor as any)(arr);
}
```

## Ring Buffers for Fixed-Size Queues

```typescript
class RingBuffer {
  private buffer;
  private head = 0;
  private tail = 0;

  constructor(size) {
    this.buffer = new Array(size);
  }

  enqueue(value) {
    this.buffer[this.tail] = value;
    this.tail = (this.tail + 1) % this.buffer.length;
  }

  dequeue() {
    const value = this.buffer[this.head];
    this.head = (this.head + 1) % this.buffer.length;
    return value;
  }
}

// Fixed memory, O(1) operations
const ringBuf = new RingBuffer(100);
for (let i = 0; i < 1000; i++) {
  ringBuf.enqueue(i);
  ringBuf.dequeue();
}
```

## Performance Characteristics

| Data Structure | Lookup | Insert | Delete | Memory | Use Case |
| --- | --- | --- | --- | --- | --- |
| **Map** | O(1) | O(1) | O(1) | Med | Dynamic key-value, any key type |
| **Object** | O(1) | O(1) | O(1) | Med | String keys only, JSON-friendly |
| **Set** | O(1) | O(1) | O(1) | Med | Membership testing, deduplication |
| **Array** | O(n) | O(1)* | O(n) | Low | Ordered, index access |
| **Typed Array** | O(1) | O(1) | N/A | Very Low | Numeric data, images, audio |
| **WeakMap** | O(1) | O(1) | Auto | Low | Metadata, no memory leaks |
| **WeakSet** | O(1) | O(1) | Auto | Low | Tracking, no memory leaks |
| **Ring Buffer** | O(1) | O(1) | O(1) | Fixed | Fixed-size queue, circular |

*Array insert at end is O(1), middle is O(n)

## Key Takeaways

1. **Map for lookups** - 500x faster than Array.find for large collections
2. **Set for membership** - Instant checking, automatic deduplication
3. **Typed Arrays** - 3-10x memory savings, 5x faster processing for numeric data
4. **WeakMap/WeakSet** - Metadata without memory leak risks
5. **Object for strings** - Only if keys are strings and static shape
6. **Deep vs shallow copy** - JSON.parse/stringify or structuredClone for true copying
7. **Ring Buffer** - Fixed memory queue with O(1) operations
8. **Don't use Array.find()** - Never for large collections, use Map or Set instead
