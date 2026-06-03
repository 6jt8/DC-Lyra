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
import { requesters } from "./player-store.js";
import {
  guildTrackMessages,
  nowPlayingMessages,
  progressUpdateIntervals,
  guildActiveFilter,
  getCommandMentionMap,
  stopCollector,
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
import { cleanupTrackMessages, editNowPlayingPanel } from "./player-cleanup.js";
import { applyFilterByKey } from "./player-filters.js";
import { getAutoplayCollection, getPlaylistCollection, incrementGlobalPlays, dbConnected } from "../database/database.js";

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

export async function cleanupPreviousTrackMessages(
  channel: any,
  guildId: string
): Promise<void> {
  const messages = guildTrackMessages.get(guildId) || [];

  for (const messageInfo of messages) {
    try {
      const fetchChannel =
        channel.client.channels.cache.get(messageInfo.channelId);
      if (fetchChannel) {
        const message = await fetchChannel.messages
          .fetch(messageInfo.messageId)
          .catch(() => null);
        if (message) {
          await message.delete().catch(() => {});
        }
      }
    } catch (error) {
      const lang = getLangSync();
      console.error(
        lang.console?.player?.errorCleanupPrevious ||
          "Error cleaning up previous track message:",
        error
      );
    }
  }

  guildTrackMessages.set(guildId, []);
}

async function startProgressUpdates(
  client: any,
  guildId: string,
  _message: any,
  player: any,
  track: any
): Promise<any> {
  if (config.lowMemoryMode === true) {
    return null;
  }

  const boundTrackUri = track.info.uri;

  const updateInterval = setInterval(async () => {
    try {
      const currentPlayer = client.riffy.players.get(guildId);
      if (!currentPlayer) {
        clearInterval(updateInterval);
        progressUpdateIntervals.delete(guildId);
        return;
      }

      const stored = nowPlayingMessages.get(guildId);
      if (!stored) {
        clearInterval(updateInterval);
        progressUpdateIntervals.delete(guildId);
        return;
      }

      if (
        !player ||
        !player.current ||
        player.current.info.uri !== boundTrackUri
      ) {
        clearInterval(updateInterval);
        progressUpdateIntervals.delete(guildId);
        return;
      }

      await editNowPlayingPanel(client, guildId);
    } catch (error) {
      clearInterval(updateInterval);
      progressUpdateIntervals.delete(guildId);
    }
  }, config.progressUpdateInterval || 15000);

  return updateInterval;
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
    "trackException",
    async (player: any, error: any) => {
      try {
        const langSync = getLangSync();
        const errorMsg = error?.message || "Unknown error";
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
          client.channels.cache.get(player?.textChannel);
        if (channel) {
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
            .catch(() => {})
            .then((msg: any) => {
              if (msg)
                setTimeout(
                  () => msg.delete().catch(() => {}),
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

          if (player.queue && player.queue.length > 0) {
            console.log(
              `${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.yellow}Skipping to next track after exception for guild ${player?.guildId || "unknown"}${colors.reset}`
            );
            setTimeout(() => {
              try { player.play(); } catch (e) {
                console.error("[PLAYER] Error playing next track after exception:", e);
              }
            }, 1000);
          }
        }
      } catch (err) {
        console.error("[PLAYER] Error in trackException handler:", err);
      }
    }
  );

  client.riffy.on("trackStuck", async (player: any, error: any) => {
    try {
      const lang = getLangSync();
      const errorMsg = error?.message || "Unknown error";
      const guildId = player?.guildId || "unknown";

      if (
        errorMsg.includes("Connect Timeout") ||
        errorMsg.includes("fetch failed") ||
        errorMsg.includes("timeout")
      ) {
        console.warn(
          `${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.yellow}Track stuck due to connection timeout for guild ${guildId} - will retry${colors.reset}`
        );
      } else {
        console.error(
          `${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.red}${lang.console?.player?.trackStuck?.replace("{guildId}", guildId).replace("{message}", errorMsg) || `Track Stuck for guild ${guildId}: ${errorMsg}`}${colors.reset}`
        );
      }

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
          try {
            player.play();
          } catch (playError) {
            console.error("[PLAYER] Error playing next track after stuck:", playError);
          }
        } else {
          const channel = client.channels.cache.get(player.textChannel);
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
      if (!track || !track.info) {
        const lang = getLangSync();
        console.error(
          `[ LAVALINK ] ${lang.console?.player?.trackNull?.replace("{guildId}", player.guildId) || `Track is null or missing info for guild ${player.guildId} - ignoring event`}`
        );
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 200));

      const currentPlayer = client.riffy.players.get(player.guildId);
      if (
        !currentPlayer ||
        currentPlayer !== player ||
        player.destroyed
      ) {
        const lang = getLangSync();
        console.error(
          `[ LAVALINK ] ${lang.console?.player?.playerInvalid?.replace("{guildId}", player.guildId) || `Player invalid or destroyed for guild ${player.guildId} - ignoring event`}`
        );
        return;
      }

      if (client.statusManager && track.info.title) {
      await client.statusManager
        .onTrackStart(player.guildId)
        .catch(() => {});
    }

    incrementGlobalPlays().catch(() => {});

    const channel =
      client.channels.cache.get(player.textChannel);
    if (!channel) {
      const lang = getLangSync();
      console.error(
        `[ LAVALINK ] ${lang.console?.player?.channelNotFound?.replace("{guildId}", player.guildId) || `Channel not found for guild ${player.guildId}`}`
      );
      return;
    }

    const guildId = player.guildId;
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

    if (dbConnected && config.lowMemoryMode !== true) {
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
        let thumbnailURL = track.info.thumbnail || "";
        const trackUri = track.info.uri || "";

        if (
          (!thumbnailURL ||
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
        const existingChannel = client.channels.cache.get(existingStored.channelId);
        if (existingChannel) {
          const existingMsg = await existingChannel.messages
            .fetch(existingStored.messageId)
            .catch(() => null);
          if (existingMsg) {
            stopCollector(guildId);
            const oldInterval = progressUpdateIntervals.get(guildId);
            if (oldInterval) {
              clearInterval(oldInterval);
              progressUpdateIntervals.delete(guildId);
            }
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
          const oldChannel = client.channels.cache.get(existingStored.channelId);
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

  client.riffy.on("trackEnd", async (player: any) => {
    try {
      const guildId = player.guildId;
      clearTrackMediaCache(guildId);

      if (client.statusManager) {
        await client.statusManager
          .onTrackEnd(guildId)
          .catch(() => {});
      }

      const intervalId = progressUpdateIntervals.get(guildId);
      if (intervalId) {
        clearInterval(intervalId);
        progressUpdateIntervals.delete(guildId);
      }

      await cleanupTrackMessages(client, player);
    } catch (err) {
      console.error("[PLAYER] Error in trackEnd handler:", err);
    }
  });

  client.riffy.on("queueEnd", async (player: any) => {
    try {
      const channel =
        client.channels.cache.get(player.textChannel);
      const guildId = player.guildId;
      clearTrackMediaCache(guildId);

    try {
      const settings = await getAutoplayCollection()?.findOne({
        guildId,
      });
      const is24_7 = settings?.twentyfourseven;

      if (settings?.autoplay) {
        await cleanupPreviousTrackMessages(channel, guildId);

        try {
          const nextTrack = await player.autoplay(player);

          if (!nextTrack) {
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
        } catch (autoplayError: any) {
          const langSync = getLangSync();
          console.warn(
            `${colors.yellow}[ AUTOPLAY ]${colors.reset} Autoplay failed for guild ${guildId}: ${autoplayError.message}`
          );
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
      await cleanupTrackMessages(client, player);
      let settings: any = null;
      try {
        const autoplayCollection = getAutoplayCollection();
        if (autoplayCollection) {
          settings = await autoplayCollection.findOne({ guildId });
        }
      } catch {
        settings = null;
      }
      const lang = await getLang(guildId).catch(() => ({
        console: { player: {} },
      }));
      const t = lang.console?.player || {};
      if (!settings?.twentyfourseven) {
        client.statusManager?.onPlayerDisconnect(guildId);
        player.destroy();
        await sendTransientCard(
          channel,
          t.queueEnd?.queueEmpty ||
            "👾 **Queue Empty! Disconnecting...**",
          5000,
          "Queue Empty"
        );
      } else {
        client.statusManager?.clearVoiceChannelStatus(guildId);
        client.statusManager?.setDefaultStatus();
      }
    }
    } catch (outerErr) {
      console.error("[PLAYER] Error in queueEnd handler:", outerErr);
    }
  });
}
