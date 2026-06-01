import type { Adapter } from "./adapter.js";
import fs from "fs";
import path from "path";

export class NodeSqliteAdapter implements Adapter {
  private db: any = null;
  private connected = false;

  constructor(private dbPath: string) {}

  async connect(): Promise<void> {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const Database = (await import("better-sqlite3")).default;
    this.db = new Database(this.dbPath);
    this.db.pragma("journal_mode = WAL");
    this.connected = true;
  }

  async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    return this.db.prepare(sql).all(...(params ?? [])) as T[];
  }

  async execute(sql: string, params?: unknown[]): Promise<{ rowsAffected: number }> {
    const result = this.db.prepare(sql).run(...(params ?? []));
    return { rowsAffected: result.changes };
  }

  async disconnect(): Promise<void> {
    this.db?.close();
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
