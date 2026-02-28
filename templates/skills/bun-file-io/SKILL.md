# Bun File I/O

Use Bun native APIs for file operations. Do not execute `cat`, `ls`, `mkdir`, `rm` as shell commands.

## Reading Files

```typescript
const file = Bun.file(path);
const exists = await file.exists(); // returns false for directories
const text = await file.text();
const json = await file.json<T>();
const buffer = await file.arrayBuffer();
// Metadata: file.size, file.type, file.name
```

## Writing Files

```typescript
await Bun.write(path, "text content");
await Bun.write(path, buffer);
await Bun.write(path, blob);
// Incremental writes: file.writer() → FileSink
```

## Scanning Directories

```typescript
const glob = new Bun.Glob("**/*.ts");
const files = await Array.fromAsync(
  glob.scan({ cwd: "src", absolute: true, onlyFiles: true })
);
```

## Directory Operations

Use `node:fs/promises` for directories (Bun.file doesn't support directories):

```typescript
import { mkdir, readdir, rm } from "node:fs/promises";

await mkdir(path, { recursive: true });
const entries = await readdir(path);
await rm(path, { recursive: true, force: true });
```

## Appending and Logging

```typescript
import { appendFile } from "node:fs/promises";
await appendFile(logFile, `${new Date().toISOString()} ${message}\n`);
```

## Running External Tools

```typescript
const bin = Bun.which("tool-name");
const proc = Bun.spawn([bin, ...args], { stdout: "pipe", stderr: "pipe" });
const stdout = await Bun.readableStreamToText(proc.stdout);
await proc.exited;
```

## Rules

1. `Bun.file(path).exists()` is for files only — use `stat()` from `node:fs/promises` when path might be a directory
2. Must use `path.join` or `path.resolve` for paths, no string concatenation
3. Prefer `Bun.write` over creating WritableStream unless incremental writes are needed
4. Parallelize independent reads: `await Promise.all(paths.map(p => Bun.file(p).text()))`