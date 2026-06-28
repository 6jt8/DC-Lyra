import { Riffy } from "riffy";
import {
  AttachmentBuilder,
  PermissionsBitField,
  MessageFlags,
} from "discord.js";
import { config } from "../config.js";
import { colors } from "../ui/colors.js";

import { cardFromMessage } from "../ui/responseHandler.js";
import { getLangSync, getLang } from "../utils/language.js";
import { EnhancedMusicCard } from "../utils/musicCard.js";
import { initializeLavalinkManager, getLavalinkManager } from "./lavalink.js";
import { requesters, previousTrackMap } from "./player-store.js";
import { voteSkipMap } from "../commands/music/voteskip.js";
import {
  guildTrackMessages,
  nowPlayingMessages,
  progressUpdateIntervals,
  guildActiveFilter,
  getCommandMentionMap,
  stopCollector,
  pendingRecoverTimeouts,
  clearPendingRecover,
} from "./player-store.js";
import {
  buildNowPlayingContainer,
  buildPlayerActionRows,
  setTrackMediaCache,
  getTrackMediaCache,
  clearTrackMediaCache,
  sendMessageWithPermissionsCheck,
  sendTransientCard,
  createProgressBar,
} from "./player-ui.js";
import { setupCollector } from "./player-interaction.js";
import { cleanupTrackMessages } from "./player-cleanup.js";
import { applyFilterByKey } from "./player-filters.js";
import { getAutoplayCollection, getPlaylistCollection, incrementGlobalPlays, isDbConnected } from "../database/database.js";
import { cleanupPreviousTrackMessages, getTextChannel } from "./player-message-utils.js";
import { clearProgressUpdates, startProgressUpdates } from "./player-lifecycle.js";
import { savePlayerSession, deletePlayerSession } from "../database/player-sessions.js";
import {
  activateMaintenanceMode,
  clearMaintenanceMode,
  incrementAutoplayFailureCount,
  isMaintenanceMode,
  isTrackEventNotificationAllowed,
  resetAutoplayFailureCount,
} from "./player-autoplay.js";
import { hasConnectedNode, safeAutoplay } from "./riffy-utils.js";
const musicCard = new EnhancedMusicCard();
const useGeneratedSongCard = config.generateSongCard !== false;
const enableVoiceChannelIdPatch =
  config.enableVoiceChannelIdPatch === true;
const voiceDebug = config.voiceDebug === true;

function patchVoiceChannelIdSupport(player: any): void {
  const connection = player?.connection;
  if (!connection || connection.__voiceChannelIdPatchApplied) return;

  connection.__voiceChannelIdPatchApplied = true;
  connection.voice = connection.voice || {};

  if (!connection.voice.channelId && player.voiceChannel) {
    connection.voice.channelId = player.voiceChannel;
  }

  if (typeof connection.setStateUpdate === "function") {
    const originalSetStateUpdate =
      connection.setStateUpdate.bind(connection);
    connection.setStateUpdate = (data: any) => {
      originalSetStateUpdate(data);
      const channelId =
        data?.channel_id ||
        connection.voiceChannel ||
        player.voiceChannel ||
        null;
      if (channelId) {
        connection.voice.channelId = channelId;
      }
      if (voiceDebug) {
        console.log(
          `[ VOICE DEBUG ] stateUpdate guild=${player.guildId} channelId=${channelId || "null"} sessionId=${data?.session_id ? "yes" : "no"}`
        );
      }
    };
  }

  if (typeof connection.updatePlayerVoiceData === "function") {
    const originalUpdatePlayerVoiceData =
      connection.updatePlayerVoiceData.bind(connection);
    connection.updatePlayerVoiceData = () => {
      if (!connection.voice.channelId) {
        connection.voice.channelId =
          connection.voiceChannel ||
          player.voiceChannel ||
          null;
      }
      if (voiceDebug) {
        const v = connection.voice || {};
        console.log(
          `[ VOICE DEBUG ] updatePlayerVoiceData guild=${player.guildId} channelId=${v.channelId || "null"} sessionId=${v.sessionId ? "yes" : "no"} token=${v.token ? "yes" : "no"} endpoint=${v.endpoint ? "yes" : "no"}`
        );
      }
      originalUpdatePlayerVoiceData();
    };
  }
}

async function patchVoiceChannelOnStart(player: any): Promise<void> {
  if (enableVoiceChannelIdPatch) {
    patchVoiceChannelIdSupport(player);
  }
  if (voiceDebug) {
    console.log(
      `[ VOICE DEBUG ] playerCreate guild=${player.guildId} voiceChannel=${player.voiceChannel || "null"} patch=${enableVoiceChannelIdPatch ? "on" : "off"}`
    );
  }
}

async function handleAutoplayEmpty(
  client: any,
  player: any,
  channel: any,
  guildId: string,
  is24_7: boolean
): Promise<void> {
  await cleanupTrackMessages(client, player);
  const lang = await getLang(guildId).catch(() => ({
    console: { player: {} },
  }));
  const t = lang.console?.player || {};
  if (is24_7) {
    client.statusManager?.setDefaultStatus();
    client.statusManager?.clearVoiceChannelStatus(guildId);
    await sendTransientCard(
      channel,
      t.queueEnd?.twentyfoursevenEmpty ||
        "🔄 **24/7 Mode: Bot will stay in voice channel. Queue is empty.**",
      5000,
      "Queue Empty"
    );
  } else {
    await sendTransientCard(
      channel,
      t.queueEnd?.noMoreAutoplay ||
        "⚠️ **No more tracks to autoplay. Leaving in 60s...**",
      5000,
      "Autoplay Ended"
    );
    await new Promise((res) => setTimeout(res, 60000));
    if (player.queue.length === 0 && !player.playing) {
      client.statusManager?.onPlayerDisconnect(guildId);
      player.destroy();
    }
  }
}

export async function initializePlayer(client: any): Promise<void> {
  const nodeManager = await initializeLavalinkManager(client);
  client.riffy = nodeManager.riffy;
  client.lavalinkManager = nodeManager;
  client.nodeManager = nodeManager;

  client.riffy.on("playerCreate", async (player: any) => {
    try {
      await patchVoiceChannelOnStart(player);
      player.setVolume(20);
    } catch (err) {
      console.error("[PLAYER] Error in playerCreate handler:", err);
    }
  });

  client.riffy.on(
    "trackError",
    async (player: any, track: any, payload: any) => {
      try {
        const langSync = getLangSync();
        const errorMsg =
          payload?.exception?.message ||
          payload?.exception?.cause ||
          payload?.message ||
          (typeof payload === "string" ? payload : null) ||
          "Something broke when playing the track.";
        if (!payload?.exception?.message && !payload?.message) {
          console.warn(
            `[ LAVALINK ] ${colors.yellow}Track exception payload for guild ${player?.guildId}: ${JSON.stringify(payload)}${colors.reset}`
          );
        }
        const isTimeout =
          errorMsg.includes("timeout") ||
          errorMsg.includes("Read timed out") ||
          errorMsg.includes("SocketTimeoutException");

        if (isTimeout) {
          console.warn(
            `${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.yellow}Track timeout for guild ${player?.guildId || "unknown"}: ${errorMsg}${colors.reset}`
          );
        } else {
          console.error(
            `${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.red}${langSync.console?.player?.trackException?.replace("{guildId}", player?.guildId || "unknown").replace("{message}", errorMsg) || `Track Exception for guild ${player?.guildId || "unknown"}: ${errorMsg}`}${colors.reset}`
          );
        }

        const channel =
          player?.textChannel
            ? await getTextChannel(client, player.textChannel)
            : null;
        if (!channel) {
          console.warn(
            `[ LAVALINK ] Track error for guild ${player?.guildId || "unknown"}: text channel not found (${player?.textChannel || "none"}). Skipping error notification.`
          );
          if (player && !player.destroyed) {
            try { player.stop(); } catch (_) {}
            try { await cleanupTrackMessages(client, player); } catch (_) {}
            if (player.queue && player.queue.length > 0) {
              setTimeout(() => { try { player.play(); } catch (_) {} }, 1000);
            }
          }
          return;
        }

        const lang = await getLang(player.guildId).catch(() => ({
          console: { player: {} },
        }));
        const t = lang.console?.player || {};

        let errorMessage =
          t.trackError?.message ||
          "Failed to load the track.";
        if (isTimeout) {
          errorMessage =
            t.trackError?.timeoutMessage ||
            "Connection timeout while loading track. This is usually a network issue on the Lavalink server.";
        }

        if (isTrackEventNotificationAllowed(player.guildId)) {
          const trackErrorCard = cardFromMessage(
            `${t.trackError?.title || "## ⚠️ Track Error"}\n\n` +
              `${errorMessage}\n` +
              `${t.trackError?.skipping || "Skipping to next song..."}`,
            "Track Error"
          );
          channel
            .send({
              components: [trackErrorCard],
              flags: MessageFlags.IsComponentsV2,
            })
            .catch((e: any) => console.warn("[PLAYER] Failed to send track error card:", e?.message))
            .then((msg: any) => {
              if (msg)
                setTimeout(
                  () => msg.delete().catch((e: any) => console.warn("[PLAYER] Failed to delete error card:", e?.message)),
                  5000
                );
            });
        }

        if (player && !player.destroyed) {
          try {
            player.stop();
          } catch (stopError) {
            console.error("[PLAYER] Error stopping player after track exception:", stopError);
          }
          try {
            await cleanupTrackMessages(client, player);
          } catch (cleanupError) {
            console.error("[PLAYER] Error cleaning up after track exception:", cleanupError);
          }

          const guildId = player?.guildId;
          if (player.queue && player.queue.length > 0) {
            console.log(
              `${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.yellow}Skipping to next track after exception for guild ${guildId || "unknown"}${colors.reset}`
            );
            clearPendingRecover(guildId);
            const timeout = setTimeout(async () => {
              pendingRecoverTimeouts.delete(guildId);
              try {
                if (!player.connected) {
                  const { ensurePlayerConnected } = await import('./player-lifecycle.js');
                  const connected = await ensurePlayerConnected(
                    player, client, player.guildId,
                    player.voiceChannel, player.textChannel, 8000
                  );
                  if (!connected) {
                    console.error(`[PLAYER] Could not recover connection for guild ${player.guildId} after track error`);
                    return;
                  }
                }
                player.play();
              } catch (e) {
                console.error("[PLAYER] Error playing next track after exception:", e);
              }
            }, 1000);
            pendingRecoverTimeouts.set(guildId, timeout);
          }
        }
      } catch (err) {
        console.error("[PLAYER] Error in trackException handler:", err);
      }
    }
  );

  client.riffy.on("trackStuck", async (player: any, track: any, payload: any) => {
    try {
      const lang = getLangSync();
      const threshold = payload?.thresholdMs ? `${payload.thresholdMs}ms` : "unknown threshold";
      const trackTitle = track?.info?.title || "Unknown track";
      const errorMsg = `Stuck for ${threshold} (${trackTitle})`;
      const guildId = player?.guildId || "unknown";

      console.warn(
        `${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.yellow}${lang.console?.player?.trackStuck?.replace("{guildId}", guildId).replace("{message}", errorMsg) || `Track Stuck for guild ${guildId}: ${errorMsg}`}${colors.reset}`
      );

      if (player && !player.destroyed) {
        try {
          player.stop();
        } catch (stopError) {
          console.error("[PLAYER] Error stopping player after track stuck:", stopError);
        }
        try {
          await cleanupTrackMessages(client, player);
        } catch (cleanupError) {
          console.error("[PLAYER] Error cleaning up after track stuck:", cleanupError);
        }

        if (player.queue && player.queue.length > 0) {
          console.log(
            `${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.yellow}Skipping to next track in queue for guild ${guildId}${colors.reset}`
          );
          clearPendingRecover(guildId);
          const stuckRecover = async () => {
            await new Promise(r => setTimeout(r, 100));
            try {
              if (!player.connected) {
                const { ensurePlayerConnected } = await import('./player-lifecycle.js');
                const connected = await ensurePlayerConnected(
                  player, client, player.guildId,
                  player.voiceChannel, player.textChannel, 8000
                );
                if (!connected) {
                  console.error(`[PLAYER] Could not recover connection for guild ${player.guildId} after track stuck`);
                  return;
                }
              }
              player.play();
            } catch (playError) {
              console.error("[PLAYER] Error playing next track after stuck:", playError);
            }
          };
          stuckRecover().catch(() => {});
        } else {
          const channel = await getTextChannel(client, player.textChannel);
          if (channel) {
            const t = lang.console?.player || {};
            sendTransientCard(
              channel,
              t.queueEnd?.queueEndedAutoplayDisabled || "🎵 **Track stuck. Queue is empty.**",
              5000,
              "Track Stuck"
            ).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.error("[PLAYER] Error in trackStuck handler:", err);
    }
  });

  client.riffy.on("trackStart", async (player: any, track: any) => {
    try {
      const guildId = player?.guildId;
      if (!guildId) return;

      if (isMaintenanceMode(guildId)) {
        clearMaintenanceMode(guildId);
        const langSync = getLangSync();
        console.log(
          `${colors.cyan}[ AUTOPROTECT ]${colors.reset} ${colors.green}Maintenance mode cleared for guild ${guildId} because a track started successfully.${colors.reset}`
        );
        const playerForGuild = client.riffy.players.get(guildId);
        if (playerForGuild && !playerForGuild.destroyed && playerForGuild.queue && playerForGuild.queue.length > 0) {
          setTimeout(async () => {
            try {
              if (!playerForGuild.connected) {
                const { ensurePlayerConnected } = await import('./player-lifecycle.js');
                const connected = await ensurePlayerConnected(
                  playerForGuild, client, playerForGuild.guildId,
                  playerForGuild.voiceChannel, playerForGuild.textChannel, 8000
                );
                if (!connected) return;
              }
              playerForGuild.play();
            } catch (_) {}
          }, 1000);
        }
      }

      resetAutoplayFailureCount(guildId);

      if (!track || !track.info) {
        const lang = getLangSync();
        console.error(
          `[ LAVALINK ] ${lang.console?.player?.trackNull?.replace("{guildId}", guildId) || `Track is null or missing info for guild ${guildId} - ignoring event`}`
        );
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 200));

      const currentPlayer = client.riffy.players.get(guildId);
      if (
        !currentPlayer ||
        currentPlayer !== player ||
        player.destroyed
      ) {
        const lang = getLangSync();
        console.error(
          `[ LAVALINK ] ${lang.console?.player?.playerInvalid?.replace("{guildId}", guildId) || `Player invalid or destroyed for guild ${guildId} - ignoring event`}`
        );
        return;
      }

      if (client.statusManager && track.info.title) {
        await client.statusManager
          .onTrackStart(guildId)
          .catch((e: any) => console.warn("[PLAYER] onTrackStart failed:", e?.message));
      }

      incrementGlobalPlays().catch((e: any) => console.warn("[PLAYER] incrementGlobalPlays failed:", e?.message));

    const channel =
      player?.textChannel
        ? await getTextChannel(client, player.textChannel)
        : null;
    if (!channel) {
      const lang = getLangSync();
      console.error(
        `[ LAVALINK ] ${lang.console?.player?.channelNotFound?.replace("{guildId}", guildId) || `Channel not found for guild ${guildId}`}`
      );
      return;
    }
    const trackUri = track.info.uri;
    const requester = requesters.get(trackUri);
    const lang = await getLang(guildId).catch(() => {
      const langSync = getLangSync();
      console.error(
        `[ PLAYER ] Failed to load language for guild ${guildId}, using default: ${langSync.console ? "loaded" : "failed"}`
      );
      return langSync;
    });
    const t = lang.console?.player || {};

    if (!t.trackInfo && !t.controls) {
      const langSync = getLangSync();
      console.warn(
        `[ PLAYER ] Language object missing player keys for guild ${guildId}. Using sync fallback.`
      );
      if (langSync.console?.player) {
        Object.assign(t, langSync.console.player);
      }
    }

    if (isDbConnected() && config.lowMemoryMode !== true) {
      try {
        const col = getPlaylistCollection()!;
        const playlist = await col.findOne({ guildId, name: "__HISTORY__" });
        
        if (playlist) {
          // Get current songs, append new one, keep only last 100
          const currentSongs = playlist.songs || [];
          const updatedSongs = [...currentSongs, trackUri].slice(-100);
          await col.updateOne(
            { guildId, name: "__HISTORY__" },
            { songs: updatedSongs }
          );
        } else {
          // Create new history playlist
          await col.insertOne({
            guildId,
            name: "__HISTORY__",
            songs: [trackUri],
          });
        }
      } catch (error) {
        const lang = getLangSync();
        console.error(
          lang.console?.player?.errorSavingHistory ||
            "Error saving to history:",
          error
        );
      }
    }

    try {
      await cleanupPreviousTrackMessages(channel, guildId);

      await new Promise((resolve) => setTimeout(resolve, 500));
      const botMember = channel.guild.members.me;
      const canAttachFiles = botMember
        ? channel.permissionsFor(botMember)?.has(PermissionsBitField.Flags.AttachFiles)
        : false;

      let attachment: any = null;
      let cardBufferForCache: Buffer | null = null;

      if (useGeneratedSongCard && config.lowMemoryMode !== true) {
        let thumbnailURL = typeof track.info?.thumbnail === "string" ? track.info.thumbnail : "";
        const trackUri = track.info.uri || "";

        if (
          (typeof thumbnailURL !== "string" ||
            !thumbnailURL.startsWith("http")) &&
          trackUri
        ) {
          thumbnailURL = trackUri;
        }

        try {
          const cardBuffer = await musicCard.generateCard({
            thumbnailURL: thumbnailURL,
            trackURI: trackUri,
            songTitle: track.info.title,
            songArtist:
              track.info.author || "Unknown Artist",
            trackRequester: requester,
            isPlaying: true,
            showVisualizer:
              config.showVisualizer !== false,
            currentPositionMs: 0,
            totalDurationMs: track.info.length || 0,
          });
          if (cardBuffer && cardBuffer.length > 0) {
            cardBufferForCache = cardBuffer;
            attachment = new AttachmentBuilder(cardBuffer, {
              name: "song-banner.png",
            });
          }
        } catch (error: any) {
          const langSync = getLangSync();
          console.warn(
            langSync.console?.player?.errorMusicCard?.replace(
              "{message}",
              error.message
            ) ||
              `Music card render failed, sending embed without card: ${error.message}`
          );
        }
      }

      const commandMentionMap = await getCommandMentionMap(client);
      const actionRows = buildPlayerActionRows(
        player.paused,
        player.loop,
        guildActiveFilter.get(guildId) || null
      );
      const nowPlayingContainer = buildNowPlayingContainer(
        track,
        requester || "Unknown",
        t,
        config.showProgressBar !== false
          ? createProgressBar(0, track.info.length)
          : null,
        0,
        attachment && canAttachFiles
          ? "attachment://song-banner.png"
          : null,
        actionRows,
        {
          paused: player.paused,
          loop: player.loop,
          currentPosition: 0,
          queueLength: player.queue.length,
          commandMentionMap,
        }
      );
      const components = [nowPlayingContainer];

      const existingStored = nowPlayingMessages.get(guildId);
      let message = null;

      if (existingStored) {
        const existingChannel = await getTextChannel(client, existingStored.channelId);
        if (existingChannel) {
          const existingMsg = await existingChannel.messages
            .fetch(existingStored.messageId)
            .catch(() => null);
          if (existingMsg) {
            stopCollector(guildId);
            clearProgressUpdates(guildId);
            const editPayload: any = {
              components,
              flags: MessageFlags.IsComponentsV2,
            };
            if (canAttachFiles && attachment) {
              editPayload.files = [attachment];
            }
            await existingMsg.edit(editPayload).catch(() => {});
            message = existingMsg;
          }
        }
      }

      if (!message) {
        if (existingStored) {
          const oldChannel = await getTextChannel(client, existingStored.channelId);
          if (oldChannel) {
            const oldMsg = await oldChannel.messages
              .fetch(existingStored.messageId)
              .catch(() => null);
            if (oldMsg) {
              await oldMsg.delete().catch(() => {});
            }
          }
        }
        message = await sendMessageWithPermissionsCheck(
          channel,
          components,
          canAttachFiles ? attachment : null
        );
      }

      if (!message) {
        const langSync = getLangSync();
        console.error(
          langSync.console?.player?.errorSendingEmbed?.replace(
            "{guildId}",
            guildId
          ) ||
            `Failed to send embed for track ${track.info.title} in guild ${guildId}`
        );
        return;
      }

      if (config.lowMemoryMode !== true) {
        const sentMediaUrl =
          message.attachments?.first()?.url || null;
        if (sentMediaUrl || cardBufferForCache) {
          setTrackMediaCache(
            guildId,
            track.info.uri,
            sentMediaUrl,
            cardBufferForCache
          );
        } else {
          clearTrackMediaCache(guildId);
        }
      }

      if (!guildTrackMessages.has(guildId)) {
        guildTrackMessages.set(guildId, []);
      }
      guildTrackMessages.get(guildId)!.push({
        messageId: message.id,
        channelId: channel.id,
        type: "track",
      });

      nowPlayingMessages.set(guildId, {
        messageId: message.id,
        channelId: channel.id,
        player: player,
        trackUri: track.info.uri,
      });

      const intervalId = startProgressUpdates(
        client,
        guildId,
        message,
        player,
        track
      );
      if (intervalId) {
        progressUpdateIntervals.set(guildId, intervalId);
      }

      setupCollector(client, player, channel, message);

      savePlayerSession(guildId, {
        voiceChannelId: player.voiceChannel,
        textChannelId: channel.id,
        messageId: message.id,
        trackEncoded: track.track || null,
        position: 0,
        loopMode: player.loop || 'none',
        volume: player.volume || 20,
        filter: guildActiveFilter.get(guildId) || null,
        paused: player.paused || false,
        twentyfourseven: false,
        isActive: true,
      }).catch(() => {});
    } catch (error: any) {
      const langSync = getLangSync();
      console.error(
        langSync.console?.player?.errorMusicCard?.replace(
          "{message}",
          error.message
        ) || "Error creating or sending music card:",
        error.message
      );
      const lang = await getLang(guildId).catch(() => ({
        console: { player: {} },
      }));
      const t = lang.console?.player || {};
      const loadCardError = cardFromMessage(
        `${
          t.unableToLoadCard?.title ||
          "## ⚠️ Unable to Load Track Card"
        }\n\n` +
          (t.unableToLoadCard?.message ||
            "Unable to load track card. Continuing playback..."),
        "Track Card Error"
      );
      await channel
        .send({
          components: [loadCardError],
          flags: MessageFlags.IsComponentsV2,
        })
        .catch(() => {});
    }
    } catch (err) {
      console.error("[PLAYER] Error in trackStart handler:", err);
    }
  });

  client.riffy.on("trackEnd", async (player: any, track: any) => {
    try {
      const guildId = player.guildId;
      if (track?.info) previousTrackMap.set(guildId, track);
      clearTrackMediaCache(guildId);
      voteSkipMap.delete(guildId);
      clearPendingRecover(guildId);

      if (client.statusManager) {
        await client.statusManager
          .onTrackEnd(guildId)
          .catch(() => {});
      }

      clearProgressUpdates(guildId);

      await cleanupTrackMessages(client, player);
    } catch (err) {
      console.error("[PLAYER] Error in trackEnd handler:", err);
    }
  });

  client.riffy.on("queueEnd", async (player: any) => {
    try {
      const channel =
        await getTextChannel(client, player.textChannel);
      const guildId = player.guildId;
      clearTrackMediaCache(guildId);
      voteSkipMap.delete(guildId);

      if (!channel) {
        const lang = getLangSync();
        console.warn(
          lang.console?.player?.channelNotFound?.replace("{guildId}", guildId) ||
            `[ LAVALINK ] Channel not found for queueEnd guild ${guildId}. Skipping messages.`
        );
        if (player && !player.destroyed) {
          try { player.destroy(); } catch (_) {}
        }
        return;
      }

      const settings = await getAutoplayCollection()?.findOne({
        guildId,
      }).catch(() => null);
      const is24_7 = settings?.twentyfourseven;

      if (settings?.autoplay) {
        if (isMaintenanceMode(guildId)) {
          console.log(
            `${colors.cyan}[ AUTOPLAY ]${colors.reset} Guild ${guildId} in maintenance mode, skipping autoplay`
          );
          await cleanupTrackMessages(client, player);
          if (is24_7) {
            client.statusManager?.setDefaultStatus();
            client.statusManager?.clearVoiceChannelStatus(guildId);
            await sendTransientCard(
              channel,
              "🔧 **Autoplay temporarily disabled (maintenance). Bot stays in voice.**",
              5000,
              "Maintenance Mode"
            );
          } else {
            await sendTransientCard(
              channel,
              "🔧 **Autoplay temporarily disabled (maintenance). Leaving in 60s...**",
              5000,
              "Maintenance Mode"
            );
            await new Promise(res => setTimeout(res, 60000));
            if (player.queue.length === 0 && !player.playing) {
              client.statusManager?.onPlayerDisconnect(guildId);
              player.destroy();
            }
          }
          return;
        }

        if (!hasConnectedNode(client)) {
          console.warn(
            `${colors.yellow}[ AUTOPLAY ]${colors.reset} No connected nodes for guild ${guildId}, skipping autoplay`
          );
          const failures = incrementAutoplayFailureCount(guildId);
          if (failures >= 3) {
            activateMaintenanceMode(guildId, "no_connected_nodes");
          }
          await cleanupTrackMessages(client, player);
          if (is24_7) {
            client.statusManager?.setDefaultStatus();
            client.statusManager?.clearVoiceChannelStatus(guildId);
            await sendTransientCard(
              channel,
              "🔧 **Lavalink node unavailable. Autoplay paused.**",
              5000,
              "Node Unavailable"
            );
          } else {
            await sendTransientCard(
              channel,
              "🔧 **Lavalink node unavailable. Leaving in 60s...**",
              5000,
              "Node Unavailable"
            );
            await new Promise(res => setTimeout(res, 60000));
            if (player.queue.length === 0 && !player.playing) {
              client.statusManager?.onPlayerDisconnect(guildId);
              player.destroy();
            }
          }
          return;
        }

        await cleanupPreviousTrackMessages(channel, guildId);

        try {
          const nextTrack = await safeAutoplay(player, 2);

          if (!nextTrack) {
            await handleAutoplayEmpty(client, player, channel, guildId, is24_7);
          }
        } catch (autoplayError: any) {
          const failures = incrementAutoplayFailureCount(guildId);
          console.warn(
            `${colors.yellow}[ AUTOPLAY ]${colors.reset} Failed for guild ${guildId} (attempt ${failures}): ${autoplayError.message}`
          );

          if (failures >= 3) {
            activateMaintenanceMode(guildId, "autoplay_failures");
          }

          await cleanupTrackMessages(client, player);
          const lang = await getLang(guildId).catch(() => ({
            console: { player: {} },
          }));
          const t = lang.console?.player || {};
          if (is24_7) {
            client.statusManager?.setDefaultStatus();
            client.statusManager?.clearVoiceChannelStatus(guildId);
            await sendTransientCard(
              channel,
              t.queueEnd?.twentyfoursevenEmpty ||
                "🔄 **24/7 Mode: Bot will stay in voice channel. Queue is empty.**",
              5000,
              "Queue Empty"
            );
          } else {
            await sendTransientCard(
              channel,
              t.queueEnd?.noMoreAutoplay ||
                "⚠️ **No more tracks to autoplay. Leaving in 60s...**",
              5000,
              "Autoplay Ended"
            );
            await new Promise(res => setTimeout(res, 60000));
            if (player.queue.length === 0 && !player.playing) {
              client.statusManager?.onPlayerDisconnect(guildId);
              player.destroy();
            }
          }
        }
      } else {
        await cleanupTrackMessages(client, player);
        const lang = await getLang(guildId).catch(() => ({
          player: {},
          console: {},
        }));
        const t = lang.console?.player || {};
        const langSync = getLangSync();
        console.log(
          langSync.console?.player?.autoplayDisabled?.replace(
            "{guildId}",
            guildId
          ) || `Autoplay is disabled for guild: ${guildId}`
        );
        if (is24_7) {
          client.statusManager?.setDefaultStatus();
          client.statusManager?.clearVoiceChannelStatus(guildId);
          await sendTransientCard(
            channel,
            t.queueEnd?.twentyfoursevenEmpty ||
              "🔄 **24/7 Mode: Bot will stay in voice channel. Queue is empty.**",
            5000,
            "Queue Empty"
          );
        } else {
          await sendTransientCard(
            channel,
            t.queueEnd?.queueEndedAutoplayDisabled ||
              "🎶 **Queue has ended. Leaving in 60s...**",
            5000,
            "Queue Ended"
          );
          await new Promise(res => setTimeout(res, 60000));
          if (player.queue.length === 0 && !player.playing) {
            client.statusManager?.onPlayerDisconnect(guildId);
            player.destroy();
          }
        }
      }
    } catch (error) {
      const langSync = getLangSync();
      console.error(
        langSync.console?.player?.errorQueueEnd ||
          "Error handling queue end:",
        error
      );
      const guildId = player?.guildId;
      if (!guildId) return;
      await cleanupTrackMessages(client, player);
      let settings: any = null;
      try {
        const autoplayCollection = getAutoplayCollection();
        if (autoplayCollection) {
          settings = await autoplayCollection.findOne({ guildId }).catch(() => null);
        }
      } catch {
        settings = null;
      }
      const lang = await getLang(guildId).catch(() => ({
        console: { player: {} },
      }));
      const t = lang.console?.player || {};
      if (!settings?.twentyfourseven && player && !player.destroyed) {
        client.statusManager?.onPlayerDisconnect(guildId);
        try { player.destroy(); } catch (_) {}
        const channel = await getTextChannel(client, player.textChannel).catch(() => null);
        if (channel) {
          await sendTransientCard(
            channel,
            t.queueEnd?.queueEmpty ||
              "👾 **Queue Empty! Disconnecting...**",
            5000,
            "Queue Empty"
          );
        }
      } else if (player && !player.destroyed) {
        client.statusManager?.clearVoiceChannelStatus(guildId);
        client.statusManager?.setDefaultStatus();
      }
    }
  });
}

