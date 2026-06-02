import { getAdapter, initDatabase, isConnected } from "./manager.js";

export { initDatabase, getAdapter, isConnected };

function toSnake(key: string): string {
  return key.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
}

function mapFilter(filter: Record<string, any>): { sql: string; vals: any[] } {
  const entries = Object.entries(filter);
  const clauses: string[] = [];
  const vals: any[] = [];
  let idx = 1;
  for (const [k, v] of entries) {
    if (k === "_id") {
      clauses.push(`id = $${idx++}`);
    } else {
      clauses.push(`${toSnake(k)} = $${idx++}`);
    }
    vals.push(v);
  }
  return { sql: clauses.join(" AND "), vals };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class Collection {
  constructor(protected table: string) {}

  protected get db() {
    return getAdapter();
  }

  async findOne(filter: Record<string, any>): Promise<any | null> {
    const { sql, vals } = mapFilter(filter);
    const rows = await this.db.query(
      `SELECT * FROM ${this.table} WHERE ${sql} LIMIT 1`,
      vals
    );
    if (!rows || rows.length === 0) return null;
    return this.rowToDoc(rows[0]);
  }

  find(filter: Record<string, any>): { toArray: () => Promise<any[]> } {
    const toArray = async (): Promise<any[]> => {
      const { sql, vals } = mapFilter(filter);
      const rows = await this.db.query(`SELECT * FROM ${this.table} WHERE ${sql}`, vals);
      return rows.map((r: any) => this.rowToDoc(r));
    };
    return { toArray };
  }

  async insertOne(doc: Record<string, any>): Promise<any> {
    const { _id, ...rest } = doc;
    const columns: string[] = [];
    const vals: any[] = [];
    const placeholders: string[] = [];
    let idx = 1;

    if (_id !== undefined) {
      columns.push("id");
      placeholders.push(`$${idx++}`);
      vals.push(_id);
    }

    for (const [k, v] of Object.entries(rest)) {
      columns.push(toSnake(k));
      if (isPlainObject(v) || Array.isArray(v)) {
        placeholders.push(`$${idx++}::jsonb`);
        vals.push(JSON.stringify(v));
      } else {
        placeholders.push(`$${idx++}`);
        vals.push(v);
      }
    }

    const rows = await this.db.query(
      `INSERT INTO ${this.table} (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`,
      vals
    );
    return this.rowToDoc(rows[0]);
  }

  async updateOne(
    filter: Record<string, any>,
    update: Record<string, any>,
    options?: { upsert?: boolean }
  ): Promise<any> {
    // Handle upsert
    if (options?.upsert) {
      const existing = await this.findOne(filter);
      if (!existing) {
        const newDoc: Record<string, any> = {};
        for (const [k, v] of Object.entries(filter)) {
          if (k !== "_id") newDoc[k] = v;
        }
        Object.assign(newDoc, update);
        return await this.insertOne(newDoc);
      }
    }

    const { sql: whereSql, vals: whereVals } = mapFilter(filter);
    const { clauses: setClauses, vals: setVals } = this.buildSetClause(update);

    if (setClauses.length === 0) return null;

    const allVals = [...setVals, ...whereVals];
    await this.db.execute(
      `UPDATE ${this.table} SET ${setClauses.join(", ")} WHERE ${whereSql}`,
      allVals
    );

    return null;
  }

  async deleteOne(filter: Record<string, any>): Promise<{ deletedCount: number }> {
    const { sql, vals } = mapFilter(filter);
    const result = await this.db.execute(
      `DELETE FROM ${this.table} WHERE ${sql}`,
      vals
    );
    return { deletedCount: result.rowsAffected };
  }

  async findOneAndUpdate(
    filter: Record<string, any>,
    update: Record<string, any>,
    options?: { upsert?: boolean; returnDocument?: "before" | "after" }
  ): Promise<any | null> {
    const before = await this.findOne(filter);

    // Handle upsert
    if (options?.upsert) {
      const existing = await this.findOne(filter);
      if (!existing) {
        const newDoc: Record<string, any> = {};
        for (const [k, v] of Object.entries(filter)) {
          if (k !== "_id") newDoc[k] = v;
        }
        Object.assign(newDoc, update);
        return await this.insertOne(newDoc);
      }
    }

    const { sql: whereSql, vals: whereVals } = mapFilter(filter);
    const { clauses: setClauses, vals: setVals } = this.buildSetClause(update);

    if (setClauses.length === 0) return before;

    const allVals = [...setVals, ...whereVals];
    await this.db.execute(
      `UPDATE ${this.table} SET ${setClauses.join(", ")} WHERE ${whereSql}`,
      allVals
    );

    if (options?.returnDocument === "before") {
      return before;
    }
    return await this.findOne(filter);
  }

  async countDocuments(filter?: Record<string, any>): Promise<number> {
    if (!filter) {
      const rows = await this.db.query(`SELECT COUNT(*) as count FROM ${this.table}`);
      return parseInt((rows[0] as any)?.count ?? "0", 10);
    }
    const { sql, vals } = mapFilter(filter);
    const rows = await this.db.query(
      `SELECT COUNT(*) as count FROM ${this.table} WHERE ${sql}`,
      vals
    );
    return parseInt((rows[0] as any)?.count ?? "0", 10);
  }

  private buildSetClause(update: Record<string, any>): { clauses: string[]; vals: any[] } {
    const clauses: string[] = [];
    const vals: any[] = [];
    let idx = 1;
    for (const [k, v] of Object.entries(update)) {
      if (isPlainObject(v) || Array.isArray(v)) {
        clauses.push(`${toSnake(k)} = $${idx++}::jsonb`);
        vals.push(JSON.stringify(v));
      } else {
        clauses.push(`${toSnake(k)} = $${idx++}`);
        vals.push(v);
      }
    }
    return { clauses, vals };
  }

  protected rowToDoc(row: any): any {
    if (!row) return null;
    const doc: any = {};
    for (const [k, v] of Object.entries(row)) {
      if (k === "id") {
        doc._id = v;
      } else {
        const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        if (typeof v === "string") {
          try {
            doc[camel] = JSON.parse(v);
          } catch {
            doc[camel] = v;
          }
        } else {
          doc[camel] = v;
        }
      }
    }
    return doc;
  }
}

class PlaylistCollection extends Collection {
  constructor() {
    super("playlists");
  }
}

class AutoplayCollection extends Collection {
  constructor() {
    super("autoplay_settings");
  }
}

class LanguageCollection extends Collection {
  constructor() {
    super("guild_languages");
  }
}

class StatsCollection extends Collection {
  constructor() {
    super("stats");
  }
}

export const db = {
  get playlists() { return new PlaylistCollection(); },
  get autoplay() { return new AutoplayCollection(); },
  get languages() { return new LanguageCollection(); },
  get stats() { return new StatsCollection(); },
};
