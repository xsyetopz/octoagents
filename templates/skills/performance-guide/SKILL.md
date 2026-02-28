# Performance Guide

## Measure First

Profile before optimizing. Assumptions about bottlenecks are usually wrong.

Tools:
| Platform | Tool |
|---|---|
| Node.js | `--prof`, `clinic.js`, Chrome DevTools |
| Bun | Built-in profiler |
| Database | `EXPLAIN ANALYZE`, slow query log |

## Common Bottlenecks

### Database

- N+1 queries: batch load related data, use JOIN or `IN` clause
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
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1