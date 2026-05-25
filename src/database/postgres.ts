import type { Adapter } from "./adapter.js";

const QUERY_TIMEOUT_MS = 15000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Database query timed out after ${ms}ms`)), ms)
    ),
  ]);
}

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
    await withTimeout(this.pool.query("SELECT 1"), QUERY_TIMEOUT_MS);
    this.connected = true;
  }

  async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    const res: any = await withTimeout(this.pool.query(sql, params), QUERY_TIMEOUT_MS);
    return res.rows as T[];
  }

  async execute(sql: string, params?: unknown[]): Promise<{ rowsAffected: number }> {
    const res: any = await withTimeout(this.pool.query(sql, params), QUERY_TIMEOUT_MS);
    return { rowsAffected: res.rowCount ?? 0 };
  }

  async disconnect(): Promise<void> {
    await withTimeout(this.pool?.end(), 5000).catch(() => {});
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
