import { isConnected, getAdapter } from "./manager.js";
import { Collection } from "./index.js";

export function isDbConnected(): boolean {
  return isConnected();
}

export async function incrementGlobalPlays(): Promise<number> {
  try {
    const col = getStatsCollection();
    const existing = await col.findOne({ _id: "global" });

    if (existing) {
      const newTotal = (existing.totalPlays || 0) + 1;
      await col.updateOne({ _id: "global" }, { totalPlays: newTotal });
      return newTotal;
    } else {
      await col.insertOne({ _id: "global", totalPlays: 1 });
      return 1;
    }
  } catch {
    return 0;
  }
}

export async function getGlobalPlays(): Promise<number> {
  try {
    const col = getStatsCollection();
    const doc = await col.findOne({ _id: "global" });
    return doc?.totalPlays ?? 0;
  } catch {
    return 0;
  }
}

export function getPlaylistCollection(): Collection {
  return new Collection("playlists");
}

export function getAutoplayCollection(): Collection {
  return new Collection("autoplay_settings");
}

export function getLanguageCollection(): Collection {
  return new Collection("guild_languages");
}

export function getStatsCollection(): Collection {
  return new Collection("stats");
}



export function getPlayerSessionsCollection(): Collection {
  return new Collection("player_sessions");
}
