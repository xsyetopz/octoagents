import { Database } from "bun:sqlite";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

interface MemoryEntry {
	key: string;
	value: string;
	created_at: string;
	updated_at: string;
}

function getDbPath(): string {
	const home = process.env["HOME"] ?? "";
	const xdgDataHome = process.env["XDG_DATA_HOME"] ?? `${home}/.local/share`;
	const dir = join(xdgDataHome, "opencode");
	return join(dir, "memory.db");
}

function ensureDirExists(dir: string) {
	if (!existsSync(dir)) {
		try {
			mkdirSync(dir, { recursive: true });
		} catch (err) {
			throw new Error(`无法创建数据目录 (${dir})：${(err as Error).message}`);
		}
	}
}

function getSafeDatabase(): Database | string {
	const dbPath = getDbPath();
	const dir = dbPath.substring(0, dbPath.lastIndexOf("/"));
	try {
		ensureDirExists(dir);
		const db = new Database(dbPath);
		db.run(`
			CREATE TABLE IF NOT EXISTS memory (
				key TEXT PRIMARY KEY,
				value TEXT NOT NULL,
				created_at TEXT DEFAULT CURRENT_TIMESTAMP,
				updated_at TEXT DEFAULT CURRENT_TIMESTAMP
			)
		`);
		return db;
	} catch (err) {
		return `数据库初始化失败：${(err as Error).message}`;
	}
}

function handleDb<T>(
	fn: (db: Database) => T,
	onError?: (err: unknown) => string,
): T | string {
	const dbOrErr = getSafeDatabase();
	if (typeof dbOrErr === "string") {
		return dbOrErr;
	}
	try {
		return fn(dbOrErr);
	} catch (err) {
		return onError?.(err) || `错误：${(err as Error).message}`;
	}
}

function remember(key: string, value: string): string {
	return handleDb(
		(db) => {
			const existing = db
				.query<MemoryEntry, [string]>("SELECT * FROM memory WHERE key = ?")
				.get(key);

			if (existing) {
				db.run(
					"UPDATE memory SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?",
					[value, key],
				);
				return `已更新记忆：${key}`;
			}
			db.run("INSERT INTO memory (key, value) VALUES (?, ?)", [key, value]);
			return `已记忆：${key}`;
		},
		(err) => `存储记忆失败：${(err as Error).message}`,
	) as string;
}

function recall(key: string): string {
	return handleDb(
		(db) => {
			const entry = db
				.query<MemoryEntry, [string]>("SELECT * FROM memory WHERE key = ?")
				.get(key);

			if (!entry) {
				return `未找到记忆：${key}`;
			}
			return `${entry.key}：${entry.value}\n（创建：${entry.created_at}，更新：${entry.updated_at}）`;
		},
		(err) => `获取记忆失败：${(err as Error).message}`,
	) as string;
}

function forget(key: string): string {
	return handleDb(
		(db) => {
			const result = db.run("DELETE FROM memory WHERE key = ?", [key]);
			if (result.changes > 0) {
				return `已遗忘：${key}`;
			}
			return `未找到记忆：${key}`;
		},
		(err) => `删除记忆失败：${(err as Error).message}`,
	) as string;
}

function list(): string {
	return handleDb(
		(db) => {
			const entries = db
				.query<MemoryEntry, []>("SELECT * FROM memory ORDER BY updated_at DESC")
				.all();
			if (entries.length === 0) {
				return "暂无存储的记忆。";
			}
			return entries
				.map(
					(e) =>
						`- ${e.key}：${e.value.slice(0, 100)}${e.value.length > 100 ? "..." : ""}`,
				)
				.join("\n");
		},
		(err) => `获取记忆列表失败：${(err as Error).message}`,
	) as string;
}

type MemoryAction = "remember" | "recall" | "forget" | "list";

const parameterProps = {
	action: {
		type: "string",
		enum: ["remember", "recall", "forget", "list"],
		description: "要执行的记忆操作",
	},
	key: {
		type: "string",
		description: "记忆条目的键",
	},
	value: {
		type: "string",
		description: "要记忆的值（仅 remember 操作需要）",
	},
};

const errorMsgs = {
	requireKey: (action: string) => `错误：'${action}' 操作需要 'key' 参数。`,
	requireKeyVal: `错误：'remember' 操作需要 'key' 和 'value' 两个参数。`,
	unknownAction: (action: string) =>
		`错误：未知操作：${action}。有效操作：remember, recall, forget, list。`,
};

export default {
	name: "memory",
	description: "会话记忆工具，用于存储和检索信息",
	parameters: {
		type: "object",
		properties: parameterProps,
		required: ["action"],
	},
	execute: (params: { action: MemoryAction; key?: string; value?: string }) => {
		const { action, key, value } = params;

		switch (action) {
			case "remember":
				if (!(key && value)) {
					return Promise.resolve(errorMsgs.requireKeyVal);
				}
				return Promise.resolve(remember(key, value));
			case "recall":
				if (!key) {
					return Promise.resolve(errorMsgs.requireKey("recall"));
				}
				return Promise.resolve(recall(key));
			case "forget":
				if (!key) {
					return Promise.resolve(errorMsgs.requireKey("forget"));
				}
				return Promise.resolve(forget(key));
			case "list":
				return Promise.resolve(list());
			default:
				return Promise.resolve(errorMsgs.unknownAction(action));
		}
	},
};
