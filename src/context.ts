export interface ContextFile {
	filename: string;
	content: string;
}

export function buildContextFiles(): ContextFile[] {
	return [
		{
			filename: "overview.md",
			content: `# 项目概述

在此描述项目，让代理理解其目的和领域。

## 项目功能

（替换为代码库构建或解决问题的简洁描述）

## 核心目标

- （主要目标 #1）
- （主要目标 #2）

## 目标用户

（谁使用此项目？开发者？终端用户？内部工具？）
`,
		},
		{
			filename: "tech-stack.md",
			content: `# 技术栈

列出项目中使用的语言、运行时、框架和工具。

## 编程语言

- 主要语言：（如 TypeScript, Python, Rust, Go, C++）
- 辅助语言：（如 shell 脚本, SQL）

## 运行时 / 包管理器

| 类型 | 选择 |
|---|---|
| 运行时 | （如 Bun, Node.js, Deno, Python 3.12, Rust 1.x） |
| 包管理器 | （如 bun, pnpm, pip + .venv, cargo） |

## 构建系统

- （如 cmake + ninja, make, Gradle, cargo, bun build）

## 框架 / 库

- （列出关键依赖）

## 测试

| 类型 | 工具 |
|---|---|
| 框架 | （如 Bun test, pytest, cargo test, Go test） |
| 覆盖率 | （如有） |

## 数据库 / 存储

- （如 PostgreSQL, SQLite, Redis）

## 部署

- （如 Docker, AWS Lambda, 裸机）
`,
		},
		{
			filename: "conventions.md",
			content: `# 编码规范

代理在编写或修改此项目代码时必须遵守的规则。

## 格式规范

| 项目 | 规范 |
|---|---|
| 缩进风格 | [tabs / spaces N] |
| 行宽上限 | [如 100 字符] |
| 文件末尾换行 | 必须有 |

## 命名规范

| 类型 | 风格 |
|---|---|
| 变量/函数 | [camelCase / snake_case] |
| 类型/类 | [PascalCase] |
| 常量 | [SCREAMING_SNAKE_CASE / camelCase] |
| 文件 | [kebab-case / snake_case] |

## 导入规范

1. 导入顺序：外部 → 内部 → 相对路径
2. 导入风格：[优先具名导入 / 默认导入]

## 错误处理

- （描述项目的错误处理模式）
- （如：总是抛出类型化错误、禁止吞掉异常、Result类型）

## 注释规范

1. 注释原因，而非内容
2. 公开API：（文档字符串风格，如有）
3. TODO格式：\`TODO(author): description\`

## Git 规范

| 项目 | 规范 |
|---|---|
| 提交格式 | 约定式提交（\`type(scope): description\`） |
| 分支命名 | （如 feat/name, fix/name） |
| PR规模 | 保持聚焦，一个PR只解决一个问题 |
`,
		},
		{
			filename: "structure.md",
			content: `# 仓库结构

描述关键目录及其用途，让代理正确导航。

\`\`\`
project-root/
  src/          源代码
  tests/        测试文件（镜像src/结构）
  docs/         文档
  scripts/      构建、部署和工具脚本
  .opencode/    OpenCode代理框架
\`\`\`

## 关键入口

| 入口类型 | 路径 |
|---|---|
| 主入口 | （如 src/index.ts, src/main.rs, cmd/main.go） |
| 测试 | （如 tests/, src/__tests__/, *_test.go） |
| 配置 | （如 config/, .env） |

## 生成文件

禁止手动修改——这些是自动生成的：
- （列出生成的目录/文件）

## 第三方/供应商代码

- （列出代理不应修改的供应商代码）
`,
		},
		{
			filename: "agent-notes.md",
			content: `# 代理注意事项

所有在此项目工作的代理必须遵守的关键约束和指导。

## 必须遵守

- 修改前阅读现有代码
- 遵循 conventions.md 中的规范
- 改动后运行测试
- 提交时使用约定式提交

## 禁止操作

- 禁止直接修改生成文件
- 禁止在未经用户明确指示时推送到远程
- 禁止在未确认时删除文件
- 禁止提交密钥或凭证

## 环境配置

Python项目：
\`\`\`bash
python3 -m venv .venv
source .venv/bin/activate  # macOS/Linux
# .venv\\Scripts\\activate  # Windows
pip install -r requirements.txt
\`\`\`

Node.js / Bun项目：
\`\`\`bash
bun install  # 或 npm install / pnpm install
\`\`\`

Rust项目：
\`\`\`bash
cargo build
\`\`\`

## 测试命令

（替换为项目实际测试命令）
另见：.opencode/context/tech-stack.md

## 已知问题 / 注意事项

- （代理需要知道的任何特殊问题或不明显的事项）
`,
		},
	];
}
