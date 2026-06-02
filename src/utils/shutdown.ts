import { colors } from "../ui/colors.js";
import {
  guildTrackMessages,
  nowPlayingMessages,
  progressUpdateIntervals,
  interactionCollectors,
  stopCollector,
} from "../music/player-store.js";

export async function gracefulShutdown(client: any, signal: string): Promise<void> {
  console.log(`\n${colors.yellow}[ SHUTDOWN ]${colors.reset} Received ${signal}. Cleaning up...`);

  if (client.commandRouter) {
    client.commandRouter.deactivate(client);
  }

  if (client.statusManager) {
    client.statusManager.stopPresenceRefresh();
    await client.statusManager.onPlayerDisconnect().catch(() => {});
  }

  if (client.riffy) {
    for (const [, player] of client.riffy.players) {
      try {
        player.destroy();
      } catch (e) {
        console.warn("[SHUTDOWN] Error destroying player:", e);
      }
    }
  }

  for (const guildId of interactionCollectors.keys()) {
    stopCollector(guildId);
  }
  interactionCollectors.clear();
  progressUpdateIntervals.clear();
  guildTrackMessages.clear();
  nowPlayingMessages.clear();

  try {
    const { getAdapter } = await import('../database/manager.js');
    getAdapter().disconnect?.();
  } catch (_) {}

  client.destroy();
  setTimeout(() => process.exit(0), 2000).unref();
}
