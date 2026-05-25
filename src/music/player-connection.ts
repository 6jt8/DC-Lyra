import { getLavalinkManager } from "./lavalink.js";
import { cleanupTrackMessages } from "./player-cleanup.js";
import { ensurePlayerConnected } from "./player-lifecycle.js";

export async function waitForPlayerConnection(
  player: any,
  timeoutMs = 15000
): Promise<boolean> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (player?.connected) return true;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return false;
}

export async function destroyPlayerIfDifferentChannel(
  client: any,
  existingPlayer: any,
  userVoiceChannel: string
): Promise<void> {
  if (!existingPlayer || existingPlayer.voiceChannel === userVoiceChannel) return;

  try {
    await cleanupTrackMessages(client, existingPlayer);
    existingPlayer.queue.clear();
    existingPlayer.stop();
    await new Promise((resolve) => setTimeout(resolve, 300));
    existingPlayer.destroy();
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error) {
    console.error("Error destroying old player:", error);
    try {
      if (!existingPlayer.destroyed) {
        existingPlayer.destroy();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (_) {}
  }
}

export async function createPlayerForGuild(
  client: any,
  guildId: string,
  voiceChannel: string,
  textChannel: string
): Promise<any> {
  const nodeManager = getLavalinkManager();
  if (!nodeManager) throw new Error("Lavalink manager not available");

  await nodeManager.checkAllNodesHealth().catch(() => {});
  await nodeManager.forceConnectAllNodes().catch(() => {});
  await new Promise((res) => setTimeout(res, 400));

  let player: any;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    let nodesAvailable = false;
    try {
      await nodeManager.ensureNodeAvailable();
      nodesAvailable = true;
    } catch (_) {
      nodesAvailable = false;
    }

    if (!nodesAvailable) {
      attempts++;
      if (attempts < maxAttempts) {
        await nodeManager.reconnectNodesNow?.(5000).catch(() => {});
        await new Promise((res) => setTimeout(res, 700));
        continue;
      }
      if (attempts >= maxAttempts) {
        await nodeManager.refreshRiffy?.();
        try {
          await nodeManager.ensureNodeAvailable();
          nodesAvailable = true;
        } catch (_) {
          throw new Error(
            "No Lavalink nodes are currently available. Please check your node configuration."
          );
        }
      }
    }

    if (nodesAvailable) {
      try {
        player = client.riffy.createConnection({
          guildId,
          voiceChannel,
          textChannel,
          deaf: true,
          defaultVolume: 20,
        });
        break;
      } catch (err: any) {
        attempts++;
        const msg = err?.message || "";
        if (
          attempts < maxAttempts &&
          (msg.includes("No nodes are available") || msg.includes("fetch failed"))
        ) {
          await nodeManager.reconnectNodesNow?.(5000).catch(() => {});
          await new Promise((res) => setTimeout(res, 700));
          continue;
        }
        if (attempts >= maxAttempts) {
          await nodeManager.refreshRiffy?.();
          await nodeManager.ensureNodeAvailable().catch(() => {});
          player = client.riffy.createConnection({
            guildId,
            voiceChannel,
            textChannel,
            deaf: true,
            defaultVolume: 20,
          });
          break;
        }
        throw err;
      }
    }
  }

  const connected = await waitForPlayerConnection(player, 20000);
  if (!connected) {
    let retryConnected = false;
    for (let retry = 0; retry < 2; retry++) {
      try {
        if (player && !player.destroyed) player.destroy();
      } catch (_) {}
      await new Promise((res) => setTimeout(res, 1000));
      await nodeManager.reconnectNodesNow?.(5000).catch(() => {});
      await nodeManager.ensureNodeAvailable().catch(() => {});
      try {
        player = client.riffy.createConnection({
          guildId,
          voiceChannel,
          textChannel,
          deaf: true,
          defaultVolume: 20,
        });
        retryConnected = await waitForPlayerConnection(player, 15000);
        if (retryConnected) break;
      } catch (_) {}
    }
    if (!retryConnected) {
      throw new Error(
        "Voice connection was not established. The bot did not join the voice channel."
      );
    }
  }

  return player;
}

export async function playWithRetries(
  player: any,
  client: any,
  guildId: string,
  voiceChannel: string,
  textChannel: string,
  maxAttempts = 3
): Promise<void> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (!player || player.destroyed) {
      await new Promise((r) => setTimeout(r, 1500));
      continue;
    }
    const connected = await ensurePlayerConnected(
      player,
      client,
      guildId,
      voiceChannel,
      textChannel,
      8000
    );
    if (!connected) {
      await new Promise((r) => setTimeout(r, 1500));
      continue;
    }
    try {
      await player.play();
      return;
    } catch (playErr: any) {
      const msg = playErr?.message || "";
      if (
        attempt < maxAttempts - 1 &&
        (msg.includes("Player connection is not initiated") ||
          msg.includes("null is not an object") ||
          msg.includes("DAVE") ||
          msg.includes("external sender"))
      ) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw playErr;
    }
  }
}
