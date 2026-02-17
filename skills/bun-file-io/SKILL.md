---
name: bun-file-io
description: Preferred file I/O patterns for this repository using Bun APIs
---

## When to Use This Skill

- Working with file operations (read, write, scan, delete)
- Implementing directory operations
- Running external tools and capturing output
- Processing large files or binary data

## Reading Files

Use `Bun.file(path)` for lazy file access:

```typescript
const file = Bun.file(path);
const exists = await file.exists();
const text = await file.text();
const json = await file.json();
const buffer = await file.arrayBuffer();
```

**Metadata access**: `file.size`, `file.type`, `file.name`

**Important**: `Bun.file(path).exists()` returns `false` for directories. Use `Filesystem.exists(path)` when the path might be either a file or directory.

## Writing Files

Use `Bun.write(dest, input)` for all write operations:

```typescript
await Bun.write(path, "text content");
await Bun.write(path, buffer);
await Bun.write(path, blob);
```

For incremental writes, use `file.writer()` to get a FileSink.

## Scanning Directories

Use `Bun.Glob` with `Array.fromAsync`:

```typescript
const glob = new Bun.Glob("**/*.ts");
const files = await Array.fromAsync(glob.scan({
  cwd: "src",
  absolute: true,
  onlyFiles: true,
  dot: false
}));
```

For directory listing, use `node:fs/promises`:

```typescript
import { readdir, mkdir } from "node:fs/promises";
const entries = await readdir(path);
await mkdir(path, { recursive: true });
```

## Running External Tools

1. Find the binary: `const bin = Bun.which("tool-name")`
2. Run it: `Bun.spawn([bin, ...args])`
3. Capture output: `Bun.readableStreamToText(process.stderr)`

## Repository Conventions

- **Prefer Bun APIs** over Node `fs` for file operations
- **Always check existence** before reading: `await Bun.file(path).exists()`
- **Use MIME types** for binary detection: check `file.type`
- **Handle paths safely** with `path.join` or `path.resolve`
- **Use async/await** with `.catch()` for error handling when possible
- **Node fs only for directories**: Use `node:fs/promises` for `mkdir`, `readdir`, and recursive operations

