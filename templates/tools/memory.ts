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
			throw new Error(
				`Failed to create data directory (${dir}): ${(err as Error).message}`,
			);
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
		return `Database initialization failed: ${(err as Error).message}`;
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
		return onError?.(err) || `Error: ${(err as Error).message}`;
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
				return `Memory updated: ${key}`;
			}
			db.run("INSERT INTO memory (key, value) VALUES (?, ?)", [key, value]);
			return `Stored: ${key}`;
		},
		(err) => `Failed to store memory: ${(err as Error).message}`,
	) as string;
}

function recall(key: string): string {
	return handleDb(
		(db) => {
			const entry = db
				.query<MemoryEntry, [string]>("SELECT * FROM memory WHERE key = ?")
				.get(key);

			if (!entry) {
				return `Memory not found: ${key}`;
			}
			return `${entry.key}: ${entry.value}\n(Created: ${entry.created_at}, Updated: ${entry.updated_at})`;
		},
		(err) => `Failed to retrieve memory: ${(err as Error).message}`,
	) as string;
}

function forget(key: string): string {
	return handleDb(
		(db) => {
			const result = db.run("DELETE FROM memory WHERE key = ?", [key]);
			if (result.changes > 0) {
				return `Forgotten: ${key}`;
			}
			return `Memory not found: ${key}`;
		},
		(err) => `Failed to delete memory: ${(err as Error).message}`,
	) as string;
}

function list(): string {
	return handleDb(
		(db) => {
			const entries = db
				.query<MemoryEntry, []>("SELECT * FROM memory ORDER BY updated_at DESC")
				.all();
			if (entries.length === 0) {
				return "No memories stored.";
			}
			return entries
				.map(
					(e) =>
						`- ${e.key}: ${e.value.slice(0, 100)}${e.value.length > 100 ? "..." : ""}`,
				)
				.join("\n");
		},
		(err) => `Failed to list memories: ${(err as Error).message}`,
	) as string;
}

type MemoryAction = "remember" | "recall" | "forget" | "list";

const parameterProps = {
	action: {
		type: "string",
		enum: ["remember", "recall", "forget", "list"],
		description: "Memory action to perform",
	},
	key: {
		type: "string",
		description: "Key of the memory entry",
	},
	value: {
		type: "string",
		description: "Value to store (required for 'remember' action only)",
	},
};

const errorMsgs = {
	requireKey: (action: string) =>
		`Error: '${action}' action requires 'key' parameter.`,
	requireKeyVal: `Error: 'remember' action requires both 'key' and 'value' parameters.`,
	unknownAction: (action: string) =>
		`Error: Unknown action: ${action}. Valid actions: remember, recall, forget, list.`,
};

export default {
	name: "memory",
	description: "Session memory tool for storing and retrieving information",
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
