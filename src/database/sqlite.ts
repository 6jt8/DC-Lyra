import path from "path";
import fs from "fs";
import { colors } from "../ui/colors.js";

let db: any = null;

function getSqliteDb(): any {
  if (db) return db;

  let Database: any;
  try {
    const mod = require("bun:sqlite");
    Database = mod.Database || mod;
  } catch {
    try {
      Database = require("better-sqlite3");
    } catch {
      return null;
    }
  }

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "lyra.db");
  db = new Database(dbPath);

  db.exec("PRAGMA journal_mode=WAL");
  db.exec("PRAGMA foreign_keys=ON");

  return db;
}

export function initSqliteTables(): boolean {
  try {
    const d = getSqliteDb();
    if (!d) return false;

    d.exec(`
      CREATE TABLE IF NOT EXISTS playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS autoplay_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS guild_languages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT NOT NULL
      );
    `);

    console.log(
      `${colors.cyan}[ DATABASE ]${colors.reset} ${colors.green}SQLite fallback initialized ✅${colors.reset}`
    );
    return true;
  } catch (err: any) {
    console.error(
      `${colors.red}[ DATABASE ]${colors.reset} Failed to init SQLite: ${err.message}`
    );
    return false;
  }
}

function matches(doc: any, filter: Record<string, any>): boolean {
  for (const [key, val] of Object.entries(filter)) {
    if (key === "_id") {
      if (String(doc._id) !== String(val)) return false;
    } else if (doc[key] !== val) {
      return false;
    }
  }
  return true;
}

function toCamelCase(key: string): string {
  return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toSnake(key: string): string {
  return key.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
}

function rowToDoc(row: any): any {
  if (!row) return null;
  try {
    const doc = JSON.parse(row.data);
    doc._id = row.id;
    return doc;
  } catch {
    return { _id: row.id };
  }
}

function applyUpdate(doc: any, update: Record<string, any>): void {
  for (const [op, fields] of Object.entries(update)) {
    if (op === "$set") {
      for (const [k, v] of Object.entries(fields as Record<string, any>)) {
        doc[k] = v;
      }
    } else if (op === "$inc") {
      for (const [k, v] of Object.entries(fields as Record<string, any>)) {
        doc[k] = (doc[k] || 0) + (v as number);
      }
    } else if (op === "$push") {
      for (const [k, v] of Object.entries(fields as Record<string, any>)) {
        if (!Array.isArray(doc[k])) doc[k] = [];
        const val = v as any;
        if (val && typeof val === "object" && "$each" in val) {
          const items = val.$each as any[];
          const sliceCount = val.$slice;
          doc[k].push(...items);
          if (sliceCount && typeof sliceCount === "number" && sliceCount < 0) {
            doc[k] = doc[k].slice(sliceCount);
          }
        } else {
          doc[k].push(val);
        }
      }
    } else if (op === "$addToSet") {
      for (const [k, v] of Object.entries(fields as Record<string, any>)) {
        if (!Array.isArray(doc[k])) doc[k] = [];
        const exists = doc[k].some((item: any) => {
          if (typeof v === "object" && v !== null) {
            return JSON.stringify(item) === JSON.stringify(v);
          }
          return item === v;
        });
        if (!exists) doc[k].push(v);
      }
    } else if (op === "$pull") {
      for (const [k, v] of Object.entries(fields as Record<string, any>)) {
        if (!Array.isArray(doc[k])) continue;
        if (typeof v === "object" && v !== null && "name" in v) {
          doc[k] = doc[k].filter((item: any) => item?.name !== (v as any).name);
        } else {
          doc[k] = doc[k].filter((item: any) => item !== v);
        }
      }
    }
  }
}

function mergeFilterIntoDoc(doc: any, filter: Record<string, any>): void {
  for (const [k, v] of Object.entries(filter)) {
    if (k !== "_id" && doc[k] === undefined) {
      doc[k] = v;
    }
  }
}

export class SqliteCollection {
  private table: string;

  constructor(table: string) {
    this.table = table;
  }

  private getDb(): any {
    return getSqliteDb();
  }

  async findOne(filter: Record<string, any>): Promise<any | null> {
    const d = this.getDb();
    if (!d) return null;
    const rows = d.prepare(`SELECT * FROM ${this.table}`).all();
    for (const row of rows) {
      const doc = rowToDoc(row);
      if (matches(doc, filter)) return doc;
    }
    return null;
  }

  find(filter: Record<string, any>): { toArray: () => Promise<any[]> } {
    const toArray = async (): Promise<any[]> => {
      const d = this.getDb();
      if (!d) return [];
      const rows = d.prepare(`SELECT * FROM ${this.table}`).all();
      const results: any[] = [];
      for (const row of rows) {
        const doc = rowToDoc(row);
        if (matches(doc, filter)) results.push(doc);
      }
      return results;
    };
    return { toArray };
  }

  async insertOne(doc: Record<string, any>): Promise<any> {
    const d = this.getDb();
    if (!d) return null;
    const { _id, ...rest } = doc;
    const info = d
      .prepare(`INSERT INTO ${this.table} (data) VALUES (?)`)
      .run(JSON.stringify(rest));
    return { ...rest, _id: info.lastInsertRowid };
  }

  async updateOne(
    filter: Record<string, any>,
    update: Record<string, any>,
    options?: { upsert?: boolean }
  ): Promise<any> {
    const d = this.getDb();
    if (!d) return null;

    const rows = d.prepare(`SELECT * FROM ${this.table}`).all();
    for (const row of rows) {
      const doc = rowToDoc(row);
      if (matches(doc, filter)) {
        applyUpdate(doc, update);
        const { _id, ...rest } = doc;
        d.prepare(`UPDATE ${this.table} SET data = ? WHERE id = ?`).run(
          JSON.stringify(rest),
          row.id
        );
        return null;
      }
    }

    if (options?.upsert) {
      const newDoc: Record<string, any> = {};
      mergeFilterIntoDoc(newDoc, filter);
      applyUpdate(newDoc, update);
      d.prepare(`INSERT INTO ${this.table} (data) VALUES (?)`).run(
        JSON.stringify(newDoc)
      );
    }
    return null;
  }

  async deleteOne(filter: Record<string, any>): Promise<{ deletedCount: number }> {
    const d = this.getDb();
    if (!d) return { deletedCount: 0 };
    const rows = d.prepare(`SELECT * FROM ${this.table}`).all();
    for (const row of rows) {
      const doc = rowToDoc(row);
      if (matches(doc, filter)) {
        d.prepare(`DELETE FROM ${this.table} WHERE id = ?`).run(row.id);
        return { deletedCount: 1 };
      }
    }
    return { deletedCount: 0 };
  }

  async findOneAndUpdate(
    filter: Record<string, any>,
    update: Record<string, any>,
    options?: { upsert?: boolean; returnDocument?: "before" | "after" }
  ): Promise<any | null> {
    const d = this.getDb();
    if (!d) return null;

    const rows = d.prepare(`SELECT * FROM ${this.table}`).all();
    for (const row of rows) {
      const doc = rowToDoc(row);
      if (matches(doc, filter)) {
        const before = { ...doc };
        applyUpdate(doc, update);
        const { _id, ...rest } = doc;
        d.prepare(`UPDATE ${this.table} SET data = ? WHERE id = ?`).run(
          JSON.stringify(rest),
          row.id
        );
        return options?.returnDocument === "before" ? before : doc;
      }
    }

    if (options?.upsert) {
      const newDoc: Record<string, any> = {};
      mergeFilterIntoDoc(newDoc, filter);
      applyUpdate(newDoc, update);
      const info = d
        .prepare(`INSERT INTO ${this.table} (data) VALUES (?)`)
        .run(JSON.stringify(newDoc));
      return { ...newDoc, _id: info.lastInsertRowid };
    }

    return null;
  }

  async countDocuments(filter?: Record<string, any>): Promise<number> {
    const d = this.getDb();
    if (!d) return 0;
    if (!filter) {
      const row = d.prepare(`SELECT COUNT(*) as count FROM ${this.table}`).get();
      return row.count;
    }
    const rows = d.prepare(`SELECT * FROM ${this.table}`).all();
    let count = 0;
    for (const row of rows) {
      const doc = rowToDoc(row);
      if (matches(doc, filter)) count++;
    }
    return count;
  }
}