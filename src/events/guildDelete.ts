import { cleanupTrackMessages } from "../music/player-cleanup.js";
import { stopCollector, progressUpdateIntervals, guildTrackMessages, nowPlayingMessages } from "../music/player-store.js";

export default async (client: any, guild: any) => {
  const guildId = guild.id;
  const player = client.riffy?.players?.get(guildId);
  if (player && !player.destroyed) {
    await cleanupTrackMessages(client, player).catch(() => {});
    await client.statusManager?.onPlayerDisconnect(guildId).catch(() => {});
    try {
      player.destroy();
    } catch (e) {
      console.warn(`[GUILD DELETE] Error destroying player for ${guildId}:`, e);
    }
  } else {
    await client.statusManager?.clearVoiceChannelStatus(guildId).catch(() => {});
  }
  stopCollector(guildId);
  progressUpdateIntervals.delete(guildId);
  guildTrackMessages.delete(guildId);
  nowPlayingMessages.delete(guildId);
};
