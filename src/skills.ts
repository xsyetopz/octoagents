import type { SkillDefinition } from "./types.ts";

export const SKILL_DEFINITIONS: SkillDefinition[] = [
	{
		name: "git-workflow",
		description: "Git分支、提交信息和PR工作流规范",
		version: "1.0",
		content: `# Git 工作流

## 提交信息

使用约定式提交：\`type(scope): description\`

类型：\`feat\`, \`fix\`, \`refactor\`, \`test\`, \`docs\`, \`chore\`, \`perf\`, \`ci\`

规则：
1. 祈使语气：写 "add feature" 而非 "added feature"
2. 标题行不超过72字符
3. 正文解释原因，而非内容
4. 引用问题：\`Closes #123\`

## 分支命名

| 分支 | 用途 |
|---|---|
| \`main\` / \`master\` | 生产环境代码 |
| \`feat/<name>\` | 新功能开发 |
| \`fix/<name>\` | Bug修复 |
| \`refactor/<name>\` | 无行为变更的重构 |
| \`chore/<name>\` | 维护任务 |

## Pull Request

1. 标题遵循约定式提交格式
2. 描述包含：改动内容、原因、测试方法
3. 保持PR聚焦——一个PR只解决一个问题
4. 合并前rebase到main，小PR优先squash合并

## 工作流程

1. 从main创建分支
2. 提交聚焦的改动
3. 推送前运行测试
4. 创建PR并附清晰描述
5. 处理评审意见
6. 获得批准后合并`,
	},
	{
		name: "code-review-checklist",
		description: "安全、质量、风格评审清单",
		version: "1.0",
		content: `# 代码评审清单

## 正确性

- [ ] 逻辑符合需求说明
- [ ] 边界情况已处理（空输入、undefined、溢出、边界条件）
- [ ] 错误路径正确返回/抛出异常
- [ ] 循环和切片无越界错误
- [ ] 异步操作正确await，无未处理的promise rejection

## 安全性

- [ ] 无SQL注入（使用参数化查询）
- [ ] 无命令注入（净化传入shell的输入）
- [ ] 无XSS（在HTML上下文中转义输出）
- [ ] 敏感操作前检查认证
- [ ] 源码中无硬编码密钥
- [ ] 无路径遍历漏洞
- [ ] 依赖未锁定到已知漏洞版本

## 性能

- [ ] 无N+1查询模式
- [ ] 热路径无不必要的重复计算
- [ ] 使用合适数据结构（O(1)查找 vs O(n)搜索）
- [ ] 循环中避免大内存分配

## 代码质量

- [ ] 函数职责单一
- [ ] 无死代码
- [ ] 变量命名具有描述性
- [ ] 复杂逻辑有注释说明原因
- [ ] 无应抽取的重复逻辑
- [ ] 错误信息可操作

## 测试

- [ ] 新行为有测试覆盖
- [ ] 测试确定性（无时间依赖或顺序依赖）
- [ ] 测试名称描述测试场景`,
	},
	{
		name: "test-patterns",
		description: "测试规范和覆盖率期望",
		version: "1.0",
		content: `# 测试模式

## 测试结构

遵循 AAA 模式：
\`\`\`typescript
// 准备 (Arrange)
const input = buildTestInput();

// 执行 (Act)
const result = systemUnderTest(input);

// 断言 (Assert)
expect(result).toEqual(expectedOutput);
\`\`\`

## 命名规范

测试名称应可读为完整句子：
- \`it("returns empty array when input is empty")\`
- \`it("throws InvalidArgumentError when name exceeds 100 characters")\`

## 覆盖率期望

| 类型 | 覆盖范围 |
|---|---|
| 单元测试 | 所有公开函数、所有分支 |
| 集成测试 | 所有API端点、所有数据库操作 |
| E2E测试 | 关键用户流程 |

## 测试隔离

1. 每个测试独立——无共享可变状态
2. Mock外部依赖（网络、文件系统、时间）
3. 使用工厂/构建器生成测试数据，避免硬编码

## 测试内容

- 正常路径：预期输入产生预期输出
- 错误情况：无效输入、缺失数据、下游失败
- 边界值：空集合、零值、最大值
- 并发：如代码有并发路径，测试竞态条件

## 反模式

禁止以下做法：
- 测试实现细节（重构时易碎）
- 依赖特定执行顺序
- 发送真实网络请求
- 断言错误信息字符串（不稳定）`,
	},
	{
		name: "refactor-guide",
		description: "安全重构模式和技术",
		version: "1.0",
		content: `# 重构指南

## 黄金法则

永远不要同时改变行为和结构。分开提交。

## 重构前检查

1. 确保被改代码有测试覆盖
2. 理解所有调用点
3. 检查接口契约（导出符号、API契约）

## 安全重构模式

### 提取函数
将代码块移入命名函数。该块应只做一件事。
适用：函数过长、注释描述某块代码的功能。

### 重命名
使用IDE重命名工具捕获所有引用。
适用：名称误导、缩写、领域术语变更。

### 内联变量
替换只赋值一次、使用一次的变量为其值。
适用：变量名对表达式无额外清晰度。

### 移动函数/模块
将函数移至其操作数据所属的模块。
适用：函数使用另一模块数据多于本模块。

### 魔法数替换为命名常量
\`const MAX_RETRIES = 3\` 而非 \`if (attempts > 3)\`

### 引入参数对象
函数参数过多且相关时，分组为类型化对象。

## 破坏性变更迁移策略

1. 在旧接口旁添加新接口
2. 增量迁移调用方
3. 所有调用方迁移后删除旧接口
4. 有外部消费者时，禁止在同一提交中删除旧接口并添加新接口

## 验证

每个重构步骤后：
- 运行完整测试套件
- 确认行为完全一致
- 检查diff是否有意外更改`,
	},
	{
		name: "documentation-standards",
		description: "文档结构、API文档、README规范",
		version: "1.0",
		content: `# 文档规范

## README 结构

项目README必须包含（按顺序）：
1. 一句话描述
2. 快速开始（最小运行步骤）
3. 安装说明
4. 使用示例
5. 配置参考
6. 贡献指南（或链接）
7. 许可证

## API 文档

每个公开函数/方法需文档：
- 用途（一句话）
- 参数（含类型和约束）
- 返回值（含类型）
- 抛出/reject条件
- 使用示例

## 代码注释

注释原因，而非内容：

\`\`\`typescript
// 错误：增加计数器
counter++;

// 正确：补偿上游API响应的越界问题
counter++;
\`\`\`

复杂算法需引用注释：
\`\`\`typescript
// 使用 Fisher-Yates 洗牌算法：https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
\`\`\`

## Markdown 规范

- 节之间空一行
- 代码块必须有语言标签
- 长链接使用引用式
- 表格表头分隔符对齐

## 更新日志

格式：Keep a Changelog (https://keepachangelog.com)
分区：Added, Changed, Deprecated, Removed, Fixed, Security`,
	},
	{
		name: "project-setup",
		description: "项目脚手架和配置模式",
		version: "1.0",
		content: `# 项目配置

## 目录规范

\`\`\`
src/          # 源代码
tests/        # 测试文件（镜像src/结构）
docs/         # 文档
dist/         # 构建输出（gitignore）
scripts/      # 构建和工具脚本
\`\`\`

## 配置文件

项目根目录必须包含：
- \`.gitignore\` — 忽略构建产物、密钥、编辑器文件
- \`README.md\` — 项目概述
- \`package.json\` / \`Cargo.toml\` / 语言相应清单

TypeScript项目还需：
- \`tsconfig.json\` — 推荐严格模式
- \`biome.jsonc\` 或 \`eslint.config.js\` — 代码检查/格式化

## 环境变量

1. 在 \`.env.example\` 中文档化所有环境变量
2. 禁止提交 \`.env\` 文件
3. 环境变量名使用 \`SCREAMING_SNAKE_CASE\`
4. 启动时验证必需环境变量，快速失败并给出清晰错误

## 依赖管理

- 在lockfile中锁定精确版本（\`bun.lock\`, \`package-lock.json\`）
- 分离开发依赖和运行时依赖
- 添加前审计依赖
- 优先选择小型聚焦包而非大型框架

## 脚本命名

跨项目统一脚本名称：
| 脚本 | 用途 |
|---|---|
| \`build\` | 编译/打包 |
| \`test\` | 运行测试套件 |
| \`lint\` | 运行代码检查 |
| \`format\` | 运行格式化 |
| \`start\` / \`dev\` | 运行应用`,
	},
	{
		name: "security-checklist",
		description: "常见漏洞模式检查清单",
		version: "1.0",
		content: `# 安全检查清单

## 输入验证

- [ ] 所有用户输入使用前验证（类型、长度、格式、范围）
- [ ] 验证失败直接拒绝——禁止净化后继续
- [ ] 文件路径验证防止遍历（\`../\`序列）
- [ ] URL验证防止SSRF（服务端请求伪造）

## 认证与授权

- [ ] 敏感操作前要求认证
- [ ] 按资源检查授权，而非仅按端点
- [ ] Token/Session可过期且可撤销
- [ ] 密码使用bcrypt/argon2哈希（禁止MD5/SHA1单独使用）
- [ ] 登录端点有暴力破解保护

## 数据处理

- [ ] 密钥禁止记录到日志
- [ ] PII最小化——只收集必需数据
- [ ] 敏感数据静态加密
- [ ] 外部通信强制TLS
- [ ] SQL查询参数化（禁止字符串拼接）

## 依赖

- [ ] 直接依赖无已知CVE
- [ ] 依赖版本锁定
- [ ] 关键路径无废弃包

## API 安全

- [ ] 公开端点限流
- [ ] CORS配置仅允许已知来源
- [ ] Content-Security-Policy 头已设置
- [ ] 敏感端点未在无认证情况下公开

## 密钥管理

- [ ] 源代码中无API密钥或密码
- [ ] 环境变量名不含会被记录的凭证
- [ ] 密钥通过环境变量注入，禁止配置文件入仓库
- [ ] 密钥轮换流程已文档化`,
	},
	{
		name: "performance-guide",
		description: "性能优化模式",
		version: "1.0",
		content: `# 性能指南

## 先测量

优化前先分析。对瓶颈的假设通常是错的。

工具：
| 平台 | 工具 |
|---|---|
| Node.js | \`--prof\`, \`clinic.js\`, Chrome DevTools |
| Bun | 内置分析器 |
| 数据库 | \`EXPLAIN ANALYZE\`, 慢查询日志 |

## 常见瓶颈

### 数据库

- N+1查询：批量加载关联数据，使用JOIN或\`IN\`子句
- 缺失索引：在WHERE/JOIN/ORDER BY列上添加索引
- 过度获取：只SELECT需要的列
- 连接池耗尽：调整池大小，及时释放连接

### 计算

- 重复计算：对输入稳定的纯函数进行记忆化
- 不必要序列化：进程内传递对象而非JSON字符串
- 阻塞事件循环：将CPU密集工作移至worker线程

### 内存

- 内存泄漏：事件监听器未移除、缓存无驱逐策略增长
- 大对象图：流式处理大数据集而非一次性加载
- 频繁GC：减少热路径分配率

## 缓存策略

在正确层级缓存：
1. 进程内（最快，实例间不共享）
2. Redis/Memcached（共享，重启后保留）
3. CDN（静态资源和可缓存API响应）

缓存失效规则：
- 设置显式TTL——禁止永久缓存
- 写入时失效
- 缓存击穿保护：使用概率提前过期或锁

## 前端性能

- 包体积：代码分割、tree-shake、用source-map-explorer分析
- 图片：使用WebP、懒加载首屏以下内容
- 关键路径：内联关键CSS、延迟非关键JS
- Core Web Vitals：LCP < 2.5s, FID < 100ms, CLS < 0.1`,
	},
	{
		name: "bun-file-io",
		description: "使用Bun原生API进行文件I/O和目录操作",
		version: "1.0",
		content: `# Bun 文件 I/O

使用Bun原生API进行文件操作。禁止将 \`cat\`, \`ls\`, \`mkdir\`, \`rm\` 作为shell命令执行。

## 读取文件

\`\`\`typescript
const file = Bun.file(path);
const exists = await file.exists(); // 目录返回 false
const text = await file.text();
const json = await file.json<T>();
const buffer = await file.arrayBuffer();
// 元数据：file.size, file.type, file.name
\`\`\`

## 写入文件

\`\`\`typescript
await Bun.write(path, "text content");
await Bun.write(path, buffer);
await Bun.write(path, blob);
// 增量写入：file.writer() → FileSink
\`\`\`

## 扫描目录

\`\`\`typescript
const glob = new Bun.Glob("**/*.ts");
const files = await Array.fromAsync(
  glob.scan({ cwd: "src", absolute: true, onlyFiles: true })
);
\`\`\`

## 目录操作

使用 \`node:fs/promises\` 处理目录（Bun.file不支持目录）：

\`\`\`typescript
import { mkdir, readdir, rm } from "node:fs/promises";

await mkdir(path, { recursive: true });
const entries = await readdir(path);
await rm(path, { recursive: true, force: true });
\`\`\`

## 追加和日志

\`\`\`typescript
import { appendFile } from "node:fs/promises";
await appendFile(logFile, \`\${new Date().toISOString()} \${message}\n\`);
\`\`\`

## 运行外部工具

\`\`\`typescript
const bin = Bun.which("tool-name");
const proc = Bun.spawn([bin, ...args], { stdout: "pipe", stderr: "pipe" });
const stdout = await Bun.readableStreamToText(proc.stdout);
await proc.exited;
\`\`\`

## 规则

1. \`Bun.file(path).exists()\` 仅用于文件——路径可能是目录时使用 \`node:fs/promises\` 的 \`stat()\`
2. 必须使用 \`path.join\` 或 \`path.resolve\` 处理路径，禁止字符串拼接
3. 优先使用 \`Bun.write\` 而非创建 WritableStream，除非需要增量写入
4. 并行化独立读取：\`await Promise.all(paths.map(p => Bun.file(p).text()))\``,
	},
	{
		name: "ts-performance",
		description: "TypeScript/JavaScript性能模式——算法、异步、数据结构、内存",
		version: "1.0",
		content: `# TypeScript 性能优化

优化前先分析。大多数瓶颈是算法层面的，而非微优化。O(n²)→O(n log n)的提升永远比2倍微优化更有价值。

## 核心原则

**测量 → 定位真实瓶颈 → 修复算法 → 仍需时再微优化。**

\`\`\`typescript
// 每次改动前后测量基线
const start = performance.now();
doWork();
console.log(\`\${performance.now() - start}ms\`);

// Bun 分析
bun --prof script.ts
\`\`\`

## 数据结构

根据访问模式选择正确结构：

\`\`\`typescript
// O(1) 查找 — 使用 Map 或 Set，而非 Array.find()
const index = new Map(items.map(item => [item.id, item]));
const found = index.get(id); // vs items.find(x => x.id === id) O(n)

const seen = new Set<string>();
if (!seen.has(key)) { seen.add(key); process(key); }

// 类型化数组处理数值数据 — 内存减少3-10倍，速度提升5倍
const data = new Float64Array(1_000_000);

// WeakMap 存储元数据 — GC友好，无泄漏风险
const meta = new WeakMap<object, Metadata>();
\`\`\`

| 结构 | 查找复杂度 | 使用场景 |
|---|---|---|
| Map | O(1) | 动态键、任意键类型 |
| Set | O(1) | 成员检测/去重 |
| Object | O(1) | 字符串键、静态形状、JSON |
| Array | O(n) | 有序、索引访问 |
| Typed Array | O(1) | 数值数据、图像、音频 |
| WeakMap | O(1) | 对象元数据无泄漏 |

## 算法

单次遍历优于链式数组方法。已知大小时预分配。

\`\`\`typescript
// 错误 — 三个中间数组
const out = items.filter(x => x > 0).map(x => x * 2).filter(x => x < 100);

// 正确 — 单次遍历
const out: number[] = [];
for (const x of items) {
  if (x > 0) {
    const v = x * 2;
    if (v < 100) out.push(v);
  }
}

// 已知大小时预分配
const result = new Array<number>(items.length);
for (let i = 0; i < items.length; i++) result[i] = transform(items[i]);

// 字符串构建 — 用 join，禁止 +=
const parts: string[] = [];
for (const item of items) parts.push(\`<li>\${item}</li>\`);
const html = parts.join("");

// 循环外编译正则
const RE = /^[\\w.-]+@[\\w.-]+\\.[\\w]+$/;
function valid(email: string) { return RE.test(email); }

// 缓存循环不变量
const factor = config.settings.factor * 2;
for (const x of items) process(x * factor);
\`\`\`

循环速度：\`for\` > \`for-of\` > \`forEach\` > \`reduce\`。默认用 \`for-of\`；仅在验证的热路径用 \`for\`。

## 异步

禁止在循环中顺序 \`await\`。独立操作使用 \`Promise.all\`。

\`\`\`typescript
// 错误 — 顺序执行，n × 延迟
const results = [];
for (const item of items) results.push(await process(item));

// 正确 — 并行执行
const results = await Promise.all(items.map(process));

// 大工作负载分批限制并发
async function batch<T>(items: T[], fn: (x: T) => Promise<unknown>, size = 50) {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(fn));
  }
}

// 缓存进行中请求，去重并发请求
const inflight = new Map<string, Promise<Data>>();
async function fetch_once(key: string): Promise<Data> {
  if (!inflight.has(key)) inflight.set(key, fetchData(key).finally(() => inflight.delete(key)));
  return inflight.get(key)!;
}
\`\`\`

## 内存

\`\`\`typescript
// 复用缓冲区 — 避免在热路径创建新数组
class Processor {
  private buf: number[] = [];
  run(input: number[]) {
    this.buf.length = 0; // 清空但不重新分配
    for (const x of input) this.buf.push(transform(x));
    return this.buf;
  }
}

// 有界缓存 — 防止无限增长
class BoundedCache<K, V> {
  private m = new Map<K, V>();
  constructor(private max: number) {}
  set(k: K, v: V) {
    if (this.m.size >= this.max) this.m.delete(this.m.keys().next().value!);
    this.m.set(k, v);
  }
  get(k: K) { return this.m.get(k); }
}

// WeakMap 存储 DOM/对象元数据 — 自动 GC
const cache = new WeakMap<Node, ComputedData>();
\`\`\`

## Bun 特定

\`\`\`typescript
// 原生哈希 — 非安全用途比 crypto 更快
const hash = Bun.hash(data);
const crc = Bun.hash.crc32(str);

// 内置 SQLite 使用预编译语句
import { Database } from "bun:sqlite";
const db = new Database("app.db");
const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
const user = stmt.get(id); // 复用预编译语句

// 测量内存
Bun.gc(true);
const before = Bun.memoryUsage().heapUsed;
doWork();
Bun.gc(true);
const used = Bun.memoryUsage().heapUsed - before;
\`\`\`

## 快速清单

1. 查找用 \`Map\`/\`Set\` 而非 \`Array.find\`/\`includes\`
2. 并行用 \`Promise.all\` 而非顺序 await
3. 单次遍历而非链式 \`filter().map()\`
4. 已知大小时预分配数组
5. 循环外编译正则
6. 将昂贵的属性访问缓存到局部变量
7. 字符串构建用 \`array.join("")\` 而非 \`+=\`
8. 深拷贝用 \`structuredClone\` 而非 \`JSON.parse(JSON.stringify(...))\`
9. 数值密集数据用 \`Typed Array\`
10. 对象元数据用 \`WeakMap\``,
	},
];
