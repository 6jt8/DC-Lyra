import type { Adapter } from "./adapter.js";
import { PostgresAdapter } from "./postgres.js";

declare const Bun: { version: string } | undefined;

let adapter: Adapter | null = null;

export async function initDatabase(connectionString?: string): Promise<Adapter> {
  // 1. Try PostgreSQL first
  if (connectionString) {
    try {
      const pgAdapter = new PostgresAdapter(connectionString);
      await pgAdapter.connect();
      adapter = pgAdapter;
      return adapter;
    } catch {
      console.log("[DB] PostgreSQL unavailable, falling back to SQLite");
    }
  }

  // 2. Runtime-specific SQLite fallback
  if (typeof Bun !== "undefined") {
    const { BunSqliteAdapter } = await import("./bun-sqlite.js");
    const sqliteAdapter = new BunSqliteAdapter("./data/lyra.db");
    await sqliteAdapter.connect();
    adapter = sqliteAdapter;
  } else {
    const { NodeSqliteAdapter } = await import("./node-sqlite.js");
    const sqliteAdapter = new NodeSqliteAdapter("./data/lyra.db");
    await sqliteAdapter.connect();
    adapter = sqliteAdapter;
  }

  return adapter;
}

export function getAdapter(): Adapter {
  if (!adapter) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return adapter;
}

export function isConnected(): boolean {
  return adapter?.isConnected() ?? false;
}
