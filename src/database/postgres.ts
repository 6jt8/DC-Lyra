import type { Adapter } from "./adapter.js";

export class PostgresAdapter implements Adapter {
  private pool: any = null;
  private connected = false;

  constructor(private connectionString: string) {}

  async connect(): Promise<void> {
    const pg = await import("pg");
    this.pool = new pg.Pool({
      connectionString: this.connectionString,
      ssl: this.connectionString.includes("supabase.co")
        ? { rejectUnauthorized: false }
        : undefined,
    });
    await this.pool.query("SELECT 1");
    this.connected = true;
  }

  async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    const res = await this.pool.query(sql, params);
    return res.rows as T[];
  }

  async execute(sql: string, params?: unknown[]): Promise<{ rowsAffected: number }> {
    const res = await this.pool.query(sql, params);
    return { rowsAffected: res.rowCount ?? 0 };
  }

  async disconnect(): Promise<void> {
    await this.pool?.end();
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
