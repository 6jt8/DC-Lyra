import { getAdapter, isConnected } from "./manager.js";

const TABLE_NAME = "player_sessions";

export interface PlayerSession {
  guildId: string;
  voiceChannelId: string;
  textChannelId: string;
  messageId: string | null;
  trackEncoded: string | null;
  queueEncoded: string | null;
  position: number;
  loopMode: string;
  volume: number;
  filter: string | null;
  paused: boolean;
  twentyfourseven: boolean;
  isActive: boolean;
  lastUpdated: string | null;
}

export async function ensurePlayerSessionsTable(): Promise<void> {
  if (!isConnected()) return;
  const adapter = getAdapter();
  const sql = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
    guild_id TEXT NOT NULL PRIMARY KEY,
    voice_channel_id TEXT NOT NULL,
    text_channel_id TEXT NOT NULL,
    message_id TEXT,
    track_encoded TEXT,
    queue_encoded TEXT,
    position INTEGER DEFAULT 0,
    loop_mode TEXT DEFAULT 'none',
    volume INTEGER DEFAULT 20,
    filter TEXT,
    paused INTEGER DEFAULT 0,
    twentyfourseven INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    last_updated TEXT
  )`;
  try {
    await adapter.execute(sql);
  } catch (_) {}
}

export async function savePlayerSession(guildId: string, data: Record<string, any>): Promise<void> {
  if (!isConnected()) return;
  await ensurePlayerSessionsTable();
  const adapter = getAdapter();
  const now = new Date().toISOString();
  const fields = ["guild_id", "voice_channel_id", "text_channel_id", "message_id", "track_encoded", "queue_encoded", "position", "loop_mode", "volume", "filter", "paused", "twentyfourseven", "is_active", "last_updated"];

  const existing = await adapter.query(`SELECT guild_id FROM ${TABLE_NAME} WHERE guild_id = $1`, [guildId]);

  const vals: Record<string, any> = {
    guild_id: guildId,
    voice_channel_id: data.voiceChannelId ?? "",
    text_channel_id: data.textChannelId ?? "",
    message_id: data.messageId ?? null,
    track_encoded: data.trackEncoded ?? null,
    queue_encoded: data.queueEncoded ?? null,
    position: data.position ?? 0,
    loop_mode: data.loopMode ?? "none",
    volume: data.volume ?? 20,
    filter: data.filter ?? null,
    paused: data.paused ? 1 : 0,
    twentyfourseven: data.twentyfourseven ? 1 : 0,
    is_active: data.isActive !== false ? 1 : 0,
    last_updated: now,
  };

  if (existing && existing.length > 0) {
    const setClauses = fields.filter(f => f !== "guild_id").map((f, i) => `${f} = $${i + 2}`).join(", ");
    const setVals = fields.filter(f => f !== "guild_id").map(f => vals[f]);
    await adapter.execute(`UPDATE ${TABLE_NAME} SET ${setClauses} WHERE guild_id = $1`, [guildId, ...setVals]);
  } else {
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(", ");
    const insertVals = fields.map(f => vals[f]);
    await adapter.execute(`INSERT INTO ${TABLE_NAME} (${fields.join(", ")}) VALUES (${placeholders})`, insertVals);
  }
}

export async function deletePlayerSession(guildId: string): Promise<void> {
  if (!isConnected()) return;
  const adapter = getAdapter();
  try {
    await adapter.execute(`DELETE FROM ${TABLE_NAME} WHERE guild_id = $1`, [guildId]);
  } catch (_) {}
}

export async function getAllActiveSessions(): Promise<PlayerSession[]> {
  if (!isConnected()) return [];
  await ensurePlayerSessionsTable();
  const adapter = getAdapter();
  const rows = await adapter.query(`SELECT * FROM ${TABLE_NAME} WHERE is_active = 1`);
  return (rows || []).map(mapRowToSession);
}

export async function getPlayerSession(guildId: string): Promise<PlayerSession | null> {
  if (!isConnected()) return null;
  const adapter = getAdapter();
  const rows = await adapter.query(`SELECT * FROM ${TABLE_NAME} WHERE guild_id = $1`, [guildId]);
  if (!rows || rows.length === 0) return null;
  return mapRowToSession(rows[0]);
}

function mapRowToSession(row: any): PlayerSession {
  return {
    guildId: row.guild_id,
    voiceChannelId: row.voice_channel_id,
    textChannelId: row.text_channel_id,
    messageId: row.message_id,
    trackEncoded: row.track_encoded,
    queueEncoded: row.queue_encoded,
    position: row.position ?? 0,
    loopMode: row.loop_mode ?? "none",
    volume: row.volume ?? 20,
    filter: row.filter,
    paused: row.paused === 1 || row.paused === true,
    twentyfourseven: row.twentyfourseven === 1 || row.twentyfourseven === true,
    isActive: row.is_active === 1 || row.is_active === true,
    lastUpdated: row.last_updated,
  };
}
