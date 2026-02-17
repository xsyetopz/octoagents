# Async Patterns Reference

Optimizing asynchronous operations in Bun.

## Parallel vs Sequential

```typescript
async function slowFetch() {
  console.time("sequential");
  const a = await fetch(url1);
  const b = await fetch(url2);
  const c = await fetch(url3);
  console.timeEnd("sequential");
  return { a, b, c };
}

async function fastFetch() {
  console.time("parallel");
  const results = await Promise.all([
    fetch(url1),
    fetch(url2),
    fetch(url3)
  ]);
  console.timeEnd("parallel");
  return results;
}

    fetch("/api/users/1").then(r => r.json()),
    fetch("/api/users/2").then(r => r.json()),
    fetch("/api/users/3").then(r => r.json())
  ]);

  const users = [];
  const errors = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      users.push(result.value);
    } else {
      errors.push(result.reason);
    }
  }

  console.log(`Loaded ${users.length} users, ${errors.length} failed`);
  return { users, errors };
}

async function fastestServer() {
  const servers = [
    fetch("https://server1.com/data"),
    fetch("https://server2.com/data"),
    fetch("https://server3.com/data")
  ];

  const fastest = await Promise.race(servers);
  return fastest.json();
}

async function anyWorkingAPI() {
  try {
    const result = await Promise.any([
      fetch("https://primary-api.com").then(r => r.json()),
      fetch("https://fallback1-api.com").then(r => r.json()),
      fetch("https://fallback2-api.com").then(r => r.json())
    ]);
    return result;
  } catch (error) {
    console.error("All APIs failed:", error);
  }
}
```

## Batching & Rate Limiting

```typescript
async function batchFetch(ids, batchSize = 10) {
  const results = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(id => fetch(`/api/users/${id}`).then(r => r.json()))
    );

    results.push(...batchResults);
  }

  return results;
}

const users = await batchFetch(
  Array.from({ length: 1000 }, (_, i) => i + 1),
  50
);

class RateLimiter {
  private running = 0;
  private queue: (() => void)[] = [];

  constructor(private maxConcurrent: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    while (this.running >= this.maxConcurrent) {
      await new Promise(resolve => this.queue.push(resolve));
    }

    this.running++;
    try {
      return await fn();
    } finally {
      this.running--;
      this.queue.shift()?.();
    }
  }
}

const limiter = new RateLimiter(5);

const results = await Promise.all(
  urls.map(url =>
    limiter.run(() => fetch(url).then(r => r.json()))
  )
);

function debounce<T extends any[]>(
  fn: (...args: T) => Promise<void>,
  delayMs: number
) {
  let timeout: Timer | null = null;

  return async (...args: T) => {
    if (timeout) clearTimeout(timeout);

    return new Promise<void>(resolve => {
      timeout = setTimeout(async () => {
        await fn(...args);
        resolve();
      }, delayMs);
    });
  };
}

const debouncedSearch = debounce(
  async (query: string) => {
    const results = await fetch(`/api/search?q=${query}`);
    displayResults(results);
  },
  300
);

input.addEventListener("input", (e) => {
  debouncedSearch((e.target as HTMLInputElement).value);
});
```

## Avoid Async in Loops

### Bad (Avoid Async in Loops)

```typescript
async function slowProcessItems(items) {
  const results = [];
  for (const item of items) {
    results.push(await processItem(item));
  }
  return results;
}
```

### Good (Avoid Async in Loops)

```typescript
async function fastProcessItems(items) {
  return Promise.all(items.map(item => processItem(item)));
}
```

```typescript
const urls = Array.from({ length: 100 }, (_, i) => `https://api.com/data/${i}`);

console.time("bad");
for (const url of urls) {
  await fetch(url);
}
console.timeEnd("bad"); // ~100 seconds

console.time("good");
await Promise.all(urls.map(url => fetch(url)));
console.timeEnd("good"); // ~1 second (100x faster!)
```

## Streaming Generators

## Caching Strategies

```typescript
class AsyncCache<K, V> {
  private cache = new Map<K, Promise<V>>();

  async get(key: K, fetcher: () => Promise<V>): Promise<V> {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const promise = fetcher();
    this.cache.set(key, promise);

    try {
      return await promise;
    } catch (error) {
      this.cache.delete(key);
      throw error;
    }
  }
}

const cache = new AsyncCache<string, any>();
const user1 = await cache.get("user:1", () => fetch("/api/users/1").then(r => r.json()));
const user2 = await cache.get("user:1", () => fetch("/api/users/1").then(r => r.json())); // Shared promise


class TimedAsyncCache<K, V> {
  private cache = new Map<K, { value: Promise<V>; expiry: number }>();

  async get(key: K, fetcher: () => Promise<V>, ttlMs: number = 60000): Promise<V> {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }

    const promise = fetcher();
    this.cache.set(key, { value: promise, expiry: Date.now() + ttlMs });

    try {
      return await promise;
    } catch (error) {
      this.cache.delete(key);
      throw error;
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < now) {
        this.cache.delete(key);
      }
    }
  }
}

const apiCache = new TimedAsyncCache<string, any>();
const user = await apiCache.get("user:123", () => fetch("/api/users/123").then(r => r.json()), 5 * 60 * 1000);
setInterval(() => apiCache.cleanup(), 60 * 60 * 1000);


class LRUAsyncCache<K, V> {
  private cache = new Map<K, Promise<V>>();
  private order: K[] = [];

  constructor(private maxSize: number = 100) {}

  async get(key: K, fetcher: () => Promise<V>): Promise<V> {
    this.order = this.order.filter(k => k !== key);
    this.order.push(key);

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    if (this.order.length > this.maxSize) {
      this.cache.delete(this.order.shift()!);
    }

    const promise = fetcher();
    this.cache.set(key, promise);
    return promise;
  }
}

const lruCache = new LRUAsyncCache<string, any>(50);
```

## Error Handling & Retry

```typescript
async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxAttempts) {
        const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
        console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new Error(`Failed after ${maxAttempts} attempts: ${lastError?.message}`);
}

const data = await retry(
  () => fetch("/api/unreliable").then(r => r.json()),
  5,      // max 5 attempts
  1000    // start with 1 second delay
);


async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error(`Operation timeout after ${timeoutMs}ms`)),
      timeoutMs
    )
  );

  return Promise.race([promise, timeout]);
}

const result = await withTimeout(
  fetch("/api/slow").then(r => r.json()),
  5000 // 5 second timeout
);


async function robustFetch(url: string): Promise<any> {
  return retry(
    () => withTimeout(
      fetch(url).then(r => r.json()),
      5000
    ),
    3,
    1000
  );
}

try {
  const data = await robustFetch("/api/endpoint");
} catch (error) {
  console.error("Failed after retries:", error);
}


class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.failureCount >= 5 && Date.now() - this.lastFailureTime < 30000) {
      throw new Error("Circuit breaker OPEN");
    }
    try {
      const result = await operation();
      this.failureCount = 0;
      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      throw error;
    }
  }
}

const breaker = new CircuitBreaker();
try {
  const data = await breaker.execute(() => fetch("/api/service").then(r => r.json()));
} catch (error) {
  console.log("Service down, use fallback");
}
```

## Key Takeaways

1. **Use Promise.all** - 10-100x faster than sequential awaits
2. **Avoid async in loops** - Never `for (... await ...)`, use Promise.all
3. **Batch requests** - Group API calls to reduce network overhead
4. **Limit concurrency** - RateLimiter prevents overwhelming servers
5. **Cache promises** - Deduplicate in-flight requests automatically
6. **Debounce expensive ops** - Reduce unnecessary calls by 50-90%
7. **Timeout all external calls** - Prevent indefinite hangs
8. **Retry with backoff** - Handle transient failures gracefully
9. **Use Circuit Breaker** - Fail fast when services are down
10. **Pool promise caches** - Use TTL or LRU to avoid memory leaks
11. **Measure real performance** - Use Bun's profiling tools
12. **Timed caches need cleanup** - Prevent unbounded growth
