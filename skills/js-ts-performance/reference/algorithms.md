# Algorithms & Operations Reference

Essential algorithmic patterns and efficient implementations for Bun.

## Loop Optimization

### Loop Performance Compared

```typescript
const arr = Array.from({ length: 1_000_000 }, (_, i) => i);

function sumFor() {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

function sumForOf() {
  let sum = 0;
  for (const val of arr) {
    sum += val;
  }
  return sum;
}

function sumForEach() {
  let sum = 0;
  arr.forEach(val => {
    sum += val;
  });
  return sum;
}

function sumReduce() {
  return arr.reduce((acc, val) => acc + val, 0);
}

// for > for-of > forEach > reduce (~1x, ~1.2x, ~1.5x ratio)
```

### Cache Loop Invariants

Extract expensive computations from tight loops:

#### Bad (Cache Loop Invariants)

```typescript
for (let i = 0; i < items.length; i++) {
  const multiplier = config.settings.calculation.factor * 2;
  result.push(items[i] * multiplier);
}
```

#### Good (Cache Loop Invariants)

```typescript
const multiplier = config.settings.calculation.factor * 2;
for (let i = 0; i < items.length; i++) {
  result.push(items[i] * multiplier);
}

const baseMultiplier = Math.PI / config.degrees;
for (const angle of angles) {
  const radians = angle * baseMultiplier;
  sin(radians);
}
```

## Array Operations

### Avoid Intermediate Arrays

#### Bad (Avoid Intermediate Arrays)

```typescript
const result = items
  .filter(x => x > 0)
  .map(x => x * 2)
  .filter(x => x < 100);
```

#### Good (Avoid Intermediate Arrays)

```typescript
const result = [];
for (const x of items) {
  if (x > 0) {
    const doubled = x * 2;
    if (doubled < 100) {
      result.push(doubled);
    }
  }
}

// 10M ops: Chained ~250ms → Single pass ~50ms (5x faster)
```

### Pre-allocation and Management

#### Bad (Pre-allocation)

```typescript
const result = [];
for (let i = 0; i < 100_000; i++) {
  result.push(i * 2);
}
```

#### Good (Pre-allocation)

```typescript
const result = new Array(100_000);
for (let i = 0; i < 100_000; i++) {
  result[i] = i * 2;
}

const pool = new Array(1000);
pool.length = 0;
for (let i = 0; i < 500; i++) {
  pool[i] = i;
}

const copy = [...original];
```

## Search & Lookup

### Map-based Indexing

#### Bad (Map-based Indexing)

```typescript
function findUser(users, id) {
  return users.find(u => u.id === id);
}
```

#### Good (Map-based Indexing)

```typescript
class UserIndex {
  private byId = new Map();
  private byEmail = new Map();

  constructor(users) {
    for (const user of users) {
      this.byId.set(user.id, user);
      this.byEmail.set(user.email, user);
    }
  }

  findById(id) { return this.byId.get(id); }
  findByEmail(email) { return this.byEmail.get(email); }
}

const index = new UserIndex(users);
for (const id of queryIds) {
  const user = index.findById(id);
}
```

### Binary Search

```typescript
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;

  while (left <= right) {
    const mid = (left + right) >>> 1;
    const midVal = arr[mid];

    if (midVal === target) return mid;
    if (midVal < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1;
}

const sorted = [1, 5, 10, 25, 30, 50, 75, 100];
console.log(binarySearch(sorted, 25));
console.log(binarySearch(sorted, 99));
```

## String Operations

### Efficient String Building

#### Bad (String Building)

```typescript
let html = "";
for (const item of items) {
  html += "<li>" + item + "</li>";
}
```

#### Good (String Building)

```typescript
const parts = [];
for (const item of items) {
  parts.push("<li>", item, "</li>");
}
const html = parts.join("");

// 10K items: concat ~200ms → join ~1ms (200x faster)
const html2 = `<ul>${items.map(i => `<li>${i}</li>`).join("")}</ul>`;
```

### Regex Optimization

#### Bad (Regex Optimization)

```typescript
function validateEmail(email) {
  return /^[\w.-]+@[\w.-]+\.\w+$/.test(email);
}
```

#### Good (Regex Optimization)

```typescript
const EMAIL_REGEX = /^[\w.-]+@[\w.-]+\.\w+$/;
function validateEmail(email) {
  return EMAIL_REGEX.test(email);
}

// 10K validations: dynamic ~50ms → static ~2ms (25x faster)

const pattern = /(?:abc|def|ghi)/;
const anchored = /^start/;
```

## Deduplication

### Set vs Array

#### Bad (Set vs Array)

```typescript
const deduped = [];
for (const item of items) {
  if (!deduped.includes(item)) {
    deduped.push(item);
  }
}
```

#### Good (Set vs Array)

```typescript
const deduped = [...new Set(items)];
const byId = new Map();
for (const item of items) {
  byId.set(item.id, item);
}
const deduped = [...byId.values()];
```

## Sorting

### Comparator Functions

```typescript
const nums = [5, 2, 8, 1, 9];
nums.sort((a, b) => a - b);
nums.sort((a, b) => b - a);

interface Item { id: number; score: number; }
const items: Item[] = [
  { id: 1, score: 85 },
  { id: 2, score: 92 },
  { id: 3, score: 78 }
];
```

#### Bad (Comparator Functions)

```typescript
items.sort((a, b) => b.score - a.score);
```

#### Good (Comparator Functions)

```typescript
const sorted = items
  .map((item, i) => ({ item, score: item.score }))
  .sort((a, b) => b.score - a.score)
  .map(({ item }) => item);
```

## Memoization

```typescript
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

const fibonacci = memoize((n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

console.log(fibonacci(50));
```

## Key Takeaways

1. **O(n log n) beats O(n²)** - Algorithm choice > micro-optimizations
2. **Use for loops** - for > for-of > forEach > reduce for performance
3. **Index for lookups** - Map O(1) beats find() O(n)
4. **Single pass** - One loop > chained filter().map().filter()
5. **Pre-allocate arrays** - new Array(size) > dynamic growth
6. **Use Set for dedup** - Set.has() O(1) > includes() O(n)
7. **Memoize pure functions** - Cache results for repeated calls
8. **String join, not concat** - array.join() O(n) > += concat O(n²)
