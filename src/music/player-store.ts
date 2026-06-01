import { getEmoji } from "../emoji/emoji.js";

export const guildTrackMessages = new Map<string, any[]>();
export const nowPlayingMessages = new Map<string, any>();
export const progressUpdateIntervals = new Map<string, any>();
export const interactionCollectors = new Map<string, any>();
export const guildActiveFilter = new Map<string, string | null>();
export const guildTrackMediaCache = new Map<string, any>();
export const requesters = new Map<string, string>();

const COMMAND_MENTION_CACHE_TTL_MS = 5 * 60 * 1000;
let commandMentionCache: {
  expiresAt: number;
  map: Map<string, string>;
} = {
  expiresAt: 0,
  map: new Map(),
};

export async function getCommandMentionMap(
  client: any
): Promise<Map<string, string>> {
  const now = Date.now();
  if (
    commandMentionCache.expiresAt > now &&
    commandMentionCache.map.size
  ) {
    return commandMentionCache.map;
  }

  const map = new Map<string, string>();
  try {
    const fetched = await client.application.commands.fetch();
    fetched.forEach((cmd: any) => {
      if (cmd?.name && cmd?.id) map.set(cmd.name, cmd.id);
    });
  } catch (_) {}

  commandMentionCache = {
    expiresAt: now + COMMAND_MENTION_CACHE_TTL_MS,
    map,
  };

  return map;
}

export function getCommandRef(
  name: string,
  mentionMap: Map<string, string>
): string {
  const id = mentionMap?.get?.(name);
  return id ? `</${name}:${id}>` : `/${name}`;
}

export function buildRandomTryHint(
  mentionMap: Map<string, string>
): string {
  const searchIcon = getEmoji("search") || "🔎";
  const pool = [
    "play",
    "queue",
    "search",
    "history",
    "filters",
    "trackinfo",
    "stats",
    "support",
  ];
  const picks: string[] = [];

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  for (const cmd of shuffled) {
    if (picks.length >= 3) break;
    picks.push(cmd);
  }

  const refs = [
    getCommandRef("help", mentionMap),
    ...picks.map((cmd) => getCommandRef(cmd, mentionMap)),
  ];
  return `${searchIcon} Try: ${refs.join(" • ")}`;
}

export const PLAYER_FAVORITES_NAME = "AutoFavourites";
export const LEGACY_PLAYER_FAVORITES_NAME = "__FAVORITES__";

export function stopCollector(guildId: string): void {
  const collector = interactionCollectors.get(guildId);
  if (collector) {
    collector.stop();
    interactionCollectors.delete(guildId);
  }
}

export async function restartCollector(
  client: any,
  guildId: string,
  channel: any,
  message: any
): Promise<any> {
  stopCollector(guildId);
  const player = client.riffy?.players?.get(guildId);
  if (!player || player.destroyed) return null;
  const { setupCollector } = await import("./player-interaction.js");
  return setupCollector(client, player, channel, message);
}
