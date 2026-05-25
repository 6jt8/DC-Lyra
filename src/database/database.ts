import pg from "pg";
import { config } from "../config.js";
import { getLangSync } from "../utils/language.js";
import { colors } from "../ui/colors.js";

export let dbConnected = false;
const pool = config.databaseUrl
  ? new pg.Pool({
      connectionString: config.databaseUrl,
      ssl: config.databaseUrl.includes("supabase.co")
        ? { rejectUnauthorized: false }
        : undefined,
    })
  : null;

function toSnake(key: string): string {
  return key.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
}

function mapFilter(filter: Record<string, any>): { sql: string; vals: any[]; idx: number } {
  const entries = Object.entries(filter);
  const clauses: string[] = [];
  const vals: any[] = [];
  let idx = 1;
  for (const [k, v] of entries) {
    if (k === "_id") {
      clauses.push(`id = $${idx++}`);
      vals.push(v);
    } else if (k === "name" && filter.name === "__HISTORY__") {
      clauses.push(`name = $${idx++}`);
      vals.push("__HISTORY__");
    } else {
      clauses.push(`${toSnake(k)} = $${idx++}`);
      vals.push(v);
    }
  }
  return { sql: clauses.join(" AND "), vals, idx };
}

function mapUpdate(table: string, update: Record<string, any>): { sets: string[]; vals: any[]; idx: number } {
  const sets: string[] = [];
  const vals: any[] = [];
  let idx = 1;
  for (const [op, fields] of Object.entries(update)) {
    if (op === "$set") {
      for (const [k, v] of Object.entries(fields as Record<string, any>)) {
        sets.push(`${toSnake(k)} = $${idx++}`);
        vals.push(v);
      }
    } else if (op === "$inc") {
      for (const [k, v] of Object.entries(fields as Record<string, any>)) {
        sets.push(`${toSnake(k)} = COALESCE(${toSnake(k)}, 0) + $${idx++}`);
        vals.push(v);
      }
    } else if (op === "$push") {
      for (const [k, v] of Object.entries(fields as Record<string, any>)) {
        const col = toSnake(k);
        const tcol = `${table}.${col}`;
        if (v && typeof v === "object" && "$each" in v) {
          const items = (v as any).$each;
          const sliceCount = (v as any).$slice;
          const itemsJson = JSON.stringify(items);
          if (sliceCount && typeof sliceCount === "number" && sliceCount < 0) {
            const keep = Math.abs(sliceCount);
            sets.push(
              `${col} = (SELECT jsonb_agg(elem) FROM (SELECT elem, row_number() OVER () as rn FROM jsonb_array_elements(COALESCE(${tcol}, '[]'::jsonb) || $${idx}::jsonb) elem) s WHERE s.rn > GREATEST(0, jsonb_array_length(COALESCE(${tcol}, '[]'::jsonb)) + jsonb_array_length($${idx}::jsonb) - ${keep}))`
            );
            vals.push(itemsJson);
            idx++;
          } else {
            sets.push(`${col} = COALESCE(${tcol}, '[]'::jsonb) || $${idx++}::jsonb`);
            vals.push(itemsJson);
          }
        } else {
          sets.push(`${col} = COALESCE(${tcol}, '[]'::jsonb) || $${idx++}::jsonb`);
          vals.push(JSON.stringify(v));
        }
      }
    } else if (op === "$addToSet") {
      for (const [k, v] of Object.entries(fields as Record<string, any>)) {
        const col = toSnake(k);
        const tcol = `${table}.${col}`;
        const jsonVal = JSON.stringify(v);
        sets.push(
          `${col} = CASE WHEN NOT COALESCE(${tcol}, '[]'::jsonb) @> $${idx}::jsonb THEN COALESCE(${tcol}, '[]'::jsonb) || $${idx}::jsonb ELSE COALESCE(${tcol}, '[]'::jsonb) END`
        );
        vals.push(jsonVal);
        idx++;
      }
    } else if (op === "$pull") {
      for (const [k, v] of Object.entries(fields as Record<string, any>)) {
        const col = toSnake(k);
        const tcol = `${table}.${col}`;
        if (typeof v === "object" && v !== null && "name" in v) {
          sets.push(
            `${col} = (SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb) FROM jsonb_array_elements(COALESCE(${tcol}, '[]'::jsonb)) elem WHERE elem->>'name' != $${idx++})`
          );
          vals.push((v as any).name);
        } else {
          sets.push(
            `${col} = COALESCE(${tcol}, '[]'::jsonb) - $${idx++}`
          );
          vals.push(v);
        }
      }
    }
  }
  return { sets, vals, idx };
}

class PgCollection {
  private table: string;

  constructor(table: string) {
    this.table = table;
  }

  async findOne(filter: Record<string, any>): Promise<any | null> {
    if (!pool) return null;
    const { sql, vals } = mapFilter(filter);
    const res = await pool.query(
      `SELECT * FROM ${this.table} WHERE ${sql} LIMIT 1`,
      vals
    );
    if (res.rows.length === 0) return null;
    return this.rowToDoc(res.rows[0]);
  }

  find(filter: Record<string, any>): { toArray: () => Promise<any[]> } {
    const toArray = async (): Promise<any[]> => {
      if (!pool) return [];
      const { sql, vals } = mapFilter(filter);
      const res = await pool.query(
        `SELECT * FROM ${this.table} WHERE ${sql}`,
        vals
      );
      return res.rows.map((r) => this.rowToDoc(r));
    };
    return { toArray };
  }

  async insertOne(doc: Record<string, any>): Promise<any> {
    if (!pool) return null;
    const { _id, ...rest } = doc;
    const columns: string[] = [];
    const vals: any[] = [];
    const params: string[] = [];
    let idx = 1;
    if (_id !== undefined) {
      columns.push("id");
      params.push(`$${idx++}`);
      vals.push(_id);
    }
    for (const [k, v] of Object.entries(rest)) {
      columns.push(toSnake(k));
      params.push(`$${idx++}`);
      vals.push(Array.isArray(v) || typeof v === "object" ? JSON.stringify(v) : v);
    }
    const res = await pool.query(
      `INSERT INTO ${this.table} (${columns.join(", ")}) VALUES (${params.join(", ")}) RETURNING *`,
      vals
    );
    return this.rowToDoc(res.rows[0]);
  }

  async updateOne(
    filter: Record<string, any>,
    update: Record<string, any>,
    options?: { upsert?: boolean }
  ): Promise<any> {
    if (!pool) return null;
    const { sql: whereSql, vals: whereVals } = mapFilter(filter);
    const { sets, vals: setVals } = mapUpdate(this.table, update);
    if (sets.length === 0) return null;

    const allVals = [...setVals, ...whereVals];
    const paramOffset = setVals.length;
    const whereClause = whereSql
      ? `WHERE ${whereSql.replace(/\$\d+/g, (m) => `$${parseInt(m.slice(1)) + paramOffset}`)}`
      : "";
    const setClause = sets.join(", ");

    if (options?.upsert) {
      const existing = await this.findOne(filter);
      if (existing) {
        const paramOff = setVals.length;
        const rewhere = whereSql.replace(/\$\d+/g, (m) => `$${parseInt(m.slice(1)) + paramOff}`);
        await pool.query(
          `UPDATE ${this.table} SET ${setClause} WHERE ${rewhere}`,
          [...setVals, ...whereVals]
        );
      } else {
        const doc: Record<string, any> = {};
        for (const [k, v] of Object.entries(filter)) {
          if (k !== "_id") doc[k] = v;
        }
        await this.insertOne(doc);
        const paramOff = setVals.length;
        const rewhere = whereSql.replace(/\$\d+/g, (m) => `$${parseInt(m.slice(1)) + paramOff}`);
        await pool.query(
          `UPDATE ${this.table} SET ${setClause} WHERE ${rewhere}`,
          [...setVals, ...whereVals]
        );
      }
      return null;
    }

    await pool.query(
      `UPDATE ${this.table} SET ${setClause} ${whereClause}`,
      allVals
    );
    return null;
  }

  async deleteOne(filter: Record<string, any>): Promise<{ deletedCount: number }> {
    if (!pool) return { deletedCount: 0 };
    const { sql, vals } = mapFilter(filter);
    const res = await pool.query(
      `DELETE FROM ${this.table} WHERE ${sql}`,
      vals
    );
    return { deletedCount: res.rowCount ?? 0 };
  }

  async findOneAndUpdate(
    filter: Record<string, any>,
    update: Record<string, any>,
    options?: { upsert?: boolean; returnDocument?: "before" | "after" }
  ): Promise<any | null> {
    if (!pool) return null;
    const { sql: whereSql, vals: whereVals } = mapFilter(filter);
    const { sets, vals: setVals } = mapUpdate(this.table, update);
    if (sets.length === 0) return null;

    const allVals = [...setVals, ...whereVals];
    const paramOffset = setVals.length;
    const whereClause = `WHERE ${whereSql.replace(/\$\d+/g, (m) => `$${parseInt(m.slice(1)) + paramOffset}`)}`;
    const setClause = sets.join(", ");
    const returning = options?.returnDocument === "before" ? "RETURNING *" : "RETURNING *";

    if (options?.upsert) {
      const existing = await this.findOne(filter);
      if (existing) {
        const paramOff = setVals.length;
        const rewhere = whereSql.replace(/\$\d+/g, (m) => `$${parseInt(m.slice(1)) + paramOff}`);
        const res = await pool.query(
          `UPDATE ${this.table} SET ${setClause} WHERE ${rewhere} ${returning}`,
          [...setVals, ...whereVals]
        );
        return res.rows.length ? this.rowToDoc(res.rows[0]) : null;
      } else {
        const doc: Record<string, any> = {};
        for (const [k, v] of Object.entries(filter)) {
          if (k !== "_id") doc[k] = v;
        }
        await this.insertOne(doc);
        const paramOff = setVals.length;
        const rewhere = whereSql.replace(/\$\d+/g, (m) => `$${parseInt(m.slice(1)) + paramOff}`);
        const res = await pool.query(
          `UPDATE ${this.table} SET ${setClause} WHERE ${rewhere} ${returning}`,
          [...setVals, ...whereVals]
        );
        return res.rows.length ? this.rowToDoc(res.rows[0]) : null;
      }
    }

    const res = await pool.query(
      `UPDATE ${this.table} SET ${setClause} ${whereClause} ${returning}`,
      allVals
    );
    return res.rows.length ? this.rowToDoc(res.rows[0]) : null;
  }

  async countDocuments(filter?: Record<string, any>): Promise<number> {
    if (!pool) return 0;
    if (!filter) {
      const res = await pool.query(`SELECT COUNT(*) FROM ${this.table}`);
      return parseInt(res.rows[0].count, 10);
    }
    const { sql, vals } = mapFilter(filter);
    const res = await pool.query(
      `SELECT COUNT(*) FROM ${this.table} WHERE ${sql}`,
      vals
    );
    return parseInt(res.rows[0].count, 10);
  }

  private rowToDoc(row: any): any {
    if (!row) return null;
    const doc: any = {};
    for (const [k, v] of Object.entries(row)) {
      if (k === "id") {
        doc._id = v;
      } else {
        const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        doc[camel] = typeof v === "object" && v !== null && !(v instanceof Date) ? JSON.parse(JSON.stringify(v)) : v;
      }
    }
    return doc;
  }
}

export async function connectToDatabase(): Promise<void> {
  let lang: any;
  try {
    lang = getLangSync();
    if (!pool) {
      console.warn(
        "\x1b[33m[ WARNING ]\x1b[0m " +
          (lang.console?.database?.skippingConnection || "Skipping database connection as URL is not provided.")
      );
      return;
    }

    console.log("\x1b[36m[ DATABASE ]\x1b[0m Attempting to connect to PostgreSQL...");

    await pool.query("SELECT 1");

    await initTables();

    dbConnected = true;

    console.log("\n" + "─".repeat(40));
    console.log(
      `${colors.magenta}${colors.bright}${lang.console?.bot?.databaseConnection || "🕸️  DATABASE CONNECTION"}${colors.reset}`
    );
    console.log("─".repeat(40));
    console.log(
      "\x1b[36m[ DATABASE ]\x1b[0m",
      "\x1b[32m" +
        (lang.console?.database?.connected || "Connected to Database ✅") +
        "\x1b[0m"
    );
  } catch (err: any) {
    console.warn(
      "\x1b[33m[ WARNING ]\x1b[0m " +
        (lang?.console?.database?.connectionFailed || "Could not connect to database. Continuing without database functionality.")
    );
    console.error("\x1b[31m[ DATABASE ERROR ]\x1b[0m", err.message);
    dbConnected = false;
  }
}

async function initTables(): Promise<void> {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS playlists (
      id SERIAL PRIMARY KEY,
      name TEXT,
      songs JSONB DEFAULT '[]'::jsonb,
      is_private BOOLEAN DEFAULT false,
      user_id TEXT,
      server_id TEXT,
      server_name TEXT,
      guild_id TEXT,
      visibility TEXT DEFAULT 'private',
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS autoplay_settings (
      id SERIAL PRIMARY KEY,
      guild_id TEXT UNIQUE NOT NULL,
      autoplay BOOLEAN DEFAULT false,
      twentyfourseven BOOLEAN DEFAULT false
    );
    CREATE TABLE IF NOT EXISTS guild_languages (
      id SERIAL PRIMARY KEY,
      guild_id TEXT UNIQUE NOT NULL,
      language TEXT DEFAULT 'en'
    );
    CREATE TABLE IF NOT EXISTS stats (
      id TEXT PRIMARY KEY DEFAULT 'global',
      total_plays BIGINT DEFAULT 0
    );
  `);
}

const playlistCol = pool ? new PgCollection("playlists") : null;
const autoplayCol = pool ? new PgCollection("autoplay_settings") : null;
const languageCol = pool ? new PgCollection("guild_languages") : null;
const statsCol = pool ? new PgCollection("stats") : null;

export const playlistCollection: PgCollection = playlistCol ?? (null as unknown as PgCollection);
export const autoplayCollection: PgCollection = autoplayCol ?? (null as unknown as PgCollection);
export const languageCollection: PgCollection = languageCol ?? (null as unknown as PgCollection);
export const statsCollection: PgCollection = statsCol ?? (null as unknown as PgCollection);

export function getPlaylistCollection(): PgCollection | null {
  return playlistCol;
}

export function getAutoplayCollection(): PgCollection | null {
  return autoplayCol;
}

export function getLanguageCollection(): PgCollection | null {
  return languageCol;
}

export function mustGetPlaylistCollection(): PgCollection {
  if (!playlistCol) throw new Error("Database not connected (playlistCollection)");
  return playlistCol;
}

export function mustGetAutoplayCollection(): PgCollection {
  if (!autoplayCol) throw new Error("Database not connected (autoplayCollection)");
  return autoplayCol;
}

export async function incrementGlobalPlays(): Promise<number> {
  if (!statsCol) return 0;
  try {
    const result = await statsCol.findOneAndUpdate(
      { _id: "global" },
      { $inc: { totalPlays: 1 } },
      { upsert: true, returnDocument: "after" }
    );
    return (result as any)?.totalPlays ?? 0;
  } catch {
    return 0;
  }
}

export async function getGlobalPlays(): Promise<number> {
  if (!statsCol) return 0;
  try {
    const doc = await statsCol.findOne({ _id: "global" });
    return (doc as any)?.totalPlays ?? 0;
  } catch {
    return 0;
  }
}
