# Bun Performance Optimization

Bun-specific patterns and APIs for maximum performance.

## Bun Runtime

Built on JavaScriptCore (not V8), written in Zig. Significantly faster for I/O and system operations.

### File I/O - Ultra Fast

```typescript
const file = Bun.file("data.json");
const json = await file.json();
const text = await file.text();
const buffer = await file.arrayBuffer();

const file = Bun.file("huge-1gb.bin");
for await (const chunk of file.stream()) {
  processDataChunk(chunk);
}

await Bun.write("output.txt", "content");
await Bun.write("data.json", JSON.stringify(data));

const input = await Bun.file("input.json").json();
const transformed = transform(input);
await Bun.write("output.json", JSON.stringify(transformed));
```

### Native Hashing

```typescript
const hash64 = Bun.hash("value");
const hash = Bun.hash.cityHash64("string");
const crc32 = Bun.hash.crc32("string");
const wyHash = Bun.hash.wyhash("string");

const fileHash = Bun.hash(await Bun.file("image.png").arrayBuffer());
const dedup = new Map();
dedup.set(fileHash, "image.png");

import { crypto } from "bun";
const digest = await crypto.subtle.digest("SHA-256", data);
```

### Shell Integration

```typescript
const result = await Bun.$`ls -la`;
console.log(result.stdout.toString());

const files = await Bun.$`find . -name "*.ts"`
  .pipe(Bun.$`wc -l`);

const output = await Bun.$`echo $MY_VAR`;

await Bun.$`bun build src/index.ts --outdir dist`;
await Bun.$`dist/index`;

const cmd = Bun.$`failing-command`;
if (!cmd.success) {
  console.error(cmd.stderr.toString());
}
```

### Fast TypeScript/JSX Transpilation

```typescript
import { transpile } from "bun";

const tsCode = `
  interface User {
    name: string;
    age: number;
  }
  const user: User = { name: "Alice", age: 30 };
`;

const jsCode = transpile(tsCode, { loader: "ts" });

import { readToString } from "./helpers";
const result = readToString("file.txt");

const jsx = `
  const App = () => <div>{message}</div>;
`;

const js = transpile(jsx, { loader: "tsx" });
```

### Fetch with Native Performance

```typescript
const response = await fetch("https://api.example.com/data");
const json = await response.json();


const response = await fetch("https://example.com/large-file");
const file = Bun.file("downloaded.bin");
await Bun.write(file, response);

const ws = new WebSocket("wss://echo.websocket.org");
ws.onopen = () => ws.send("Hello");
ws.onmessage = (e) => console.log(e.data);
```

### Built-in SQLite

```typescript
import { Database } from "bun:sqlite";

const db = new Database("app.db");

const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
const user = stmt.get(1);

db.exec("CREATE TABLE users (id PRIMARY KEY, name TEXT, age INT)");
db.run("INSERT INTO users VALUES (?, ?, ?)", [1, "Alice", 30]);

db.transaction(() => {
  db.run("INSERT INTO users VALUES (?, ?, ?)", [2, "Bob", 25]);
  db.run("INSERT INTO users VALUES (?, ?, ?)", [3, "Charlie", 35]);
})();

class UserDB {
  private db = new Database("app.db");
  private cache = new Map();
  private stmt = this.db.prepare("SELECT * FROM users WHERE id = ?");

  getUser(id: number) {
    if (this.cache.has(id)) return this.cache.get(id);
    const user = this.stmt.get(id);
    if (user) this.cache.set(id, user);
    return user;
  }
}
```

### Bundling with Built-in Bun Bundler

```typescript
import { build } from "bun";

const result = await build({
  entrypoints: ["src/index.ts"],
  outdir: "dist",
  format: "esm",
  target: "browser",
  splitting: true,
  minify: true
});

console.log(`Built ${result.outputs.length} files`);
await build({
  entrypoints: ["src/server.ts"],
  outdir: "build",
  target: "node"
});

await Bun.$`node build/server.js`;
```
