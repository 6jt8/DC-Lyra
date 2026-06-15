import { colors } from "../ui/colors.js";
import { getLavalinkManager } from "./lavalink.js";
import { getAllActiveSessions, deletePlayerSession } from "../database/player-sessions.js";
import { nowPlayingMessages, stopCollector } from "./player-store.js";
import { setupCollector } from "./player-interaction.js";
import { buildNowPlayingContainer, buildPlayerActionRows, sendMessageWithPermissionsCheck } from "./player-ui.js";
import { requesters } from "./player-store.js";
import { getLangSync } from "../utils/language.js";
import { cardFromMessage } from "../ui/responseHandler.js";
import { MessageFlags } from "discord.js";

function findNodeWithRest(riffy: any): any {
  if (!riffy || !riffy.nodes) return null;
  if (riffy.nodes instanceof Map) {
    for (const [, node] of riffy.nodes) {
      if (node?.connected && node?.rest) return node;
    }
  } else if (Array.isArray(riffy.nodes)) {
    for (const node of riffy.nodes) {
      if (node?.connected && node?.rest) return node;
    }
  }
  return null;
}

async function getGuild(client: any, guildId: string): Promise<any | null> {
  try {
    return await client.guilds.fetch(guildId);
  } catch {
    return client.guilds.cache.get(guildId) || null;
  }
}

export async function restoreAllPlayerSessions(client: any): Promise<void> {
  const lang = getLangSync();
  const sessions = await getAllActiveSessions();
  if (sessions.length === 0) return;

  console.log(
    `${colors.cyan}[ RESTORE ]${colors.reset} ${colors.yellow}${lang.console?.lavalink?.restoringSessions?.replace("{count}", sessions.length) || `Restoring ${sessions.length} player session(s)...`}${colors.reset}`
  );

  const nodeManager = getLavalinkManager();
  if (!nodeManager || !nodeManager.riffy) {
    console.warn(
      `${colors.cyan}[ RESTORE ]${colors.reset} ${colors.red}Lavalink not ready, skipping session restore${colors.reset}`
    );
    return;
  }

  const riffy = nodeManager.riffy;
  let restored = 0;

  for (const session of sessions) {
    try {
      const guild = await getGuild(client, session.guildId);
      if (!guild) {
        await deletePlayerSession(session.guildId);
        continue;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (riffy.players.get(session.guildId)) {
        const player = riffy.players.get(session.guildId);
        if (player && !player.destroyed) {
          console.log(
            `${colors.cyan}[ RESTORE ]${colors.reset} ${colors.green}Player already exists for ${session.guildId}, reusing${colors.reset}`
          );
        }
      } else {
        const voiceChannel = guild.channels.cache.get(session.voiceChannelId) ||
          (await guild.channels.fetch(session.voiceChannelId).catch(() => null));
        if (!voiceChannel) {
          console.warn(
            `${colors.cyan}[ RESTORE ]${colors.reset} ${colors.yellow}Voice channel ${session.voiceChannelId} not found for ${session.guildId}, skipping${colors.reset}`
          );
          await deletePlayerSession(session.guildId);
          continue;
        }

        const textChannel = guild.channels.cache.get(session.textChannelId) ||
          (await guild.channels.fetch(session.textChannelId).catch(() => null));
        if (!textChannel) {
          await deletePlayerSession(session.guildId);
          continue;
        }

        const player = riffy.createConnection({
          guildId: session.guildId,
          voiceChannel: session.voiceChannelId,
          textChannel: session.textChannelId,
          deaf: true,
          defaultVolume: session.volume || 20,
        });

        const startedAt = Date.now();
        let connected = false;
        while (Date.now() - startedAt < 15000) {
          if (player?.connected) { connected = true; break; }
          await new Promise(r => setTimeout(r, 200));
        }

        if (!connected) {
          console.warn(
            `${colors.cyan}[ RESTORE ]${colors.reset} ${colors.yellow}Could not establish voice connection for ${session.guildId}${colors.reset}`
          );
          await deletePlayerSession(session.guildId);
          continue;
        }

        if (player && !player.destroyed) {
          player.position = session.position || 0;
        }

        if (session.trackEncoded) {
          try {
            const node = findNodeWithRest(riffy);
            if (node) {
              const decoded = await node.rest.decodeTrack(session.trackEncoded);
              if (decoded) {
                const { Track } = await import("riffy");
                const track = new Track(decoded, "System Restore", node);
                player.queue.add(track);
                if (!player.playing && !player.paused) {
                  player.play();
                }
              }
            }
          } catch (decodeErr) {
            console.warn(
              `${colors.cyan}[ RESTORE ]${colors.reset} ${colors.yellow}Failed to decode track for ${session.guildId}: ${decodeErr}${colors.reset}`
            );
          }
        }

        if (session.loopMode && session.loopMode !== "none") {
          try { player.setLoop(session.loopMode); } catch (_) {}
        }
      }

      const riffyPlayer = riffy.players.get(session.guildId);
      if (!riffyPlayer || riffyPlayer.destroyed) {
        await deletePlayerSession(session.guildId);
        continue;
      }

      const textChannel = guild.channels.cache.get(session.textChannelId) ||
        (await guild.channels.fetch(session.textChannelId).catch(() => null));
      if (!textChannel) {
        await deletePlayerSession(session.guildId);
        continue;
      }

      if (session.messageId) {
        try {
          const existingMsg = await textChannel.messages.fetch(session.messageId).catch(() => null);
          if (existingMsg) {
            stopCollector(session.guildId);
            setupCollector(client, riffyPlayer, textChannel, existingMsg);

            nowPlayingMessages.set(session.guildId, {
              messageId: session.messageId,
              channelId: session.textChannelId,
              player: riffyPlayer,
              trackUri: session.trackEncoded,
            });

            const restoredCard = cardFromMessage(
              "## ?? Session Restored\n\nThe bot has reconnected after a restart.\nUse the buttons below to control playback.",
              "Session Restored"
            );
            await existingMsg.edit({
              components: [restoredCard],
              flags: MessageFlags.IsComponentsV2,
            }).catch(() => {});

            console.log(
              `${colors.cyan}[ RESTORE ]${colors.reset} ${colors.green}Restored panel for ${session.guildId} (message ${session.messageId})${colors.reset}`
            );
            restored++;
          }
        } catch (_) {}
      }

      await deletePlayerSession(session.guildId);
    } catch (err: any) {
      console.warn(
        `${colors.cyan}[ RESTORE ]${colors.reset} ${colors.red}Failed to restore session for ${session.guildId}: ${err.message}${colors.reset}`
      );
      await deletePlayerSession(session.guildId).catch(() => {});
    }
  }

  console.log(
    `${colors.cyan}[ RESTORE ]${colors.reset} ${colors.green}Restored ${restored}/${sessions.length} player session(s)${colors.reset}`
  );
}
