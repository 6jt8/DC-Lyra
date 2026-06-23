import { MessageFlags } from "discord.js";
import { cardFromMessage, safeDeferUpdate } from "../ui/responseHandler.js";
import { config } from "../config.js";
import { colors } from "../ui/colors.js";
import { getLang, getLangSync } from "../utils/language.js";
import {
  nowPlayingMessages,
  guildActiveFilter,
  interactionCollectors,
  PLAYER_FAVORITES_NAME,
  LEGACY_PLAYER_FAVORITES_NAME,
  getCommandMentionMap,
  requesters,
} from "./player-store.js";
import {
  sendEmbed,
  sendMessageWithPermissionsCheck,
  buildNowPlayingContainer,
  buildPlayerActionRows,
  clearTrackMediaCache,
  getTrackMediaCache,
  setTrackMediaCache,
} from "./player-ui.js";
import { stopCollector, restartCollector } from "./player-store.js";
import { refreshNowPlayingPanel, cleanupTrackMessages } from "./player-cleanup.js";
import { applyFilterByKey } from "./player-filters.js";
import { getPlaylistCollection } from "../database/database.js";
import { clearProgressUpdates } from "./player-lifecycle.js";

export function setupCollector(
  client: any,
  player: any,
  channel: any,
  message: any
): any {
  const filter = (i: any) =>
    [
      "loopToggle",
      "skipTrack",
      "stopTrack",
      "togglePlayback",
      "player_favorite",
      "player_add_song",
      "player_volume",
      "player_save_song",
      "player_queue",
      "player_shuffle",
      "player_filter_select",
      "player_filter_clear",
    ].includes(i.customId);

  const collector = message.createMessageComponentCollector({
    filter,
    time: 1800000,
  });

  collector.on("collect", async (i: any) => {
    const member = i.member;
    const voiceChannel = member.voice.channel;
    const playerChannel = player.voiceChannel;

    if (!voiceChannel || voiceChannel.id !== playerChannel) {
      const lang = await getLang(channel.guildId).catch(() => ({
        console: { player: {} },
      }));
      const t = lang.console?.player || {};
      const vcContainer = cardFromMessage(
        `${
          t.voiceChannelRequired?.title ||
          "## 🔒 Voice Channel Required"
        }\n\n` +
          (t.voiceChannelRequired?.message ||
            "You need to be in the same voice channel to use the controls!"),
        "Voice Channel Required"
      );
      const sentMessage = await channel
        .send({
          components: [vcContainer],
          flags: MessageFlags.IsComponentsV2,
        })
        .catch(() => {});
      if (sentMessage) {
        setTimeout(
          () => sentMessage.delete().catch(() => {}),
          config.embedTimeout * 1000
        );
      }
      return;
    }

    if (i.customId === "player_add_song") {
      const { createAddSongModal } = await import("./player-ui.js");
      await i.showModal(createAddSongModal()).catch(() => {});
      const modal = await i
        .awaitModalSubmit({
          filter: (m: any) =>
            m.customId === "player_modal_addsong" &&
            m.user.id === i.user.id,
          time: 60000,
        })
        .catch(() => null);
      if (modal) {
        await handlePlayerModalSubmit(client, modal, player, channel);
      }
      return;
    }

    if (i.customId === "player_volume") {
      const { createVolumeModal } = await import("./player-ui.js");
      await i.showModal(createVolumeModal(player.volume)).catch(() => {});
      const modal = await i
        .awaitModalSubmit({
          filter: (m: any) =>
            m.customId === "player_modal_volume" &&
            m.user.id === i.user.id,
          time: 60000,
        })
        .catch(() => null);
      if (modal) {
        await handlePlayerModalSubmit(client, modal, player, channel);
      }
      return;
    }

    if (i.customId === "player_save_song") {
      const { createSaveSongModal } = await import("./player-ui.js");
      await i.showModal(createSaveSongModal()).catch(() => {});
      const modal = await i
        .awaitModalSubmit({
          filter: (m: any) =>
            m.customId === "player_modal_save_song" &&
            m.user.id === i.user.id,
          time: 60000,
        })
        .catch(() => null);
      if (modal) {
        await handlePlayerModalSubmit(client, modal, player, channel);
      }
      return;
    }

    const deferred = await safeDeferUpdate(i);
    if (!deferred && !i.deferred && !i.replied) return;

    await handleInteraction(client, i, player, channel);
    collector.resetTimer();
  });

  collector.on("end", () => {
    interactionCollectors.delete(channel.guildId);
  });

  interactionCollectors.set(channel.guildId, collector);

  return collector;
}

async function sendEphemeralReply(
  interaction: any,
  message: string
): Promise<void> {
  const container = cardFromMessage(message, "Player Update");
  try {
    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    });
  } catch (e: any) {
    console.warn("[PLAYER] Failed to send ephemeral reply:", e?.message);
  }
}

async function handleInteraction(
  client: any,
  i: any,
  player: any,
  channel: any
): Promise<void> {
  const lang = await getLang(channel.guildId).catch(() => ({
    console: { player: {} },
  }));
  const t = lang.console?.player || {};
  const guildId = player.guildId;

  switch (i.customId) {
    case "loopToggle": {
      const msg = toggleLoop(player, channel, t);
      await refreshNowPlayingPanel(client, guildId);
      if (msg) await sendEphemeralReply(i, msg);
      break;
    }
    case "skipTrack": {
      clearProgressUpdates(guildId);
      player.stop();
      await sendEphemeralReply(
        i,
        t.controls?.skip || "⏭️ **Skipping to next song...**"
      );
      break;
    }
    case "disableLoop": {
      disableLoop(player, channel, t);
      await refreshNowPlayingPanel(client, guildId);
      break;
    }
    case "showLyrics": {
      const { showLyrics } = await import("./player-lyrics.js");
      await showLyrics(client, channel, player);
      break;
    }
    case "clearQueue": {
      player.queue.clear();
      await refreshNowPlayingPanel(client, guildId);
      await sendEphemeralReply(
        i,
        t.controls?.queueCleared || "🗑️ **Queue has been cleared!**"
      );
      break;
    }
    case "stopTrack": {
      await cleanupTrackMessages(client, player);
      client.statusManager?.onPlayerDisconnect(guildId);
      player.stop();
      player.destroy();
      await sendEphemeralReply(
        i,
        t.controls?.playbackStopped ||
          "⏹️ **Playback has been stopped and player destroyed!**"
      );
      break;
    }
    case "togglePlayback": {
      try {
        if (!player || player.destroyed) {
          await sendEphemeralReply(
            i,
            t.controls?.playerDestroyed || "❌ **Player is not available!**"
          );
          return;
        }
        if (player.paused) {
          player.pause(false);
          await sendEphemeralReply(
            i,
            t.controls?.playbackResumed || "▶️ **Playback has been resumed!**"
          );
        } else {
          player.pause(true);
          await sendEphemeralReply(
            i,
            t.controls?.playbackPaused || "⏸️ **Playback has been paused!**"
          );
        }
        await refreshNowPlayingPanel(client, guildId);
      } catch (error: any) {
        const langSync = getLangSync();
        console.warn(
          `${colors.cyan}[ PLAYER ]${colors.reset} ${colors.yellow}Toggle playback error: ${error.message}${colors.reset}`
        );
        await sendEphemeralReply(
          i,
          t.controls?.resumeError ||
            "⚠️ **Failed to change playback state. Please try again.**"
        );
      }
      break;
    }
    case "player_favorite": {
      try {
        const current = player.current?.info;
        if (!current?.uri) {
          await sendEphemeralReply(i, "❌ **No active song to favorite.**");
          return;
        }

        const userId = i.user.id;
        const serverId = channel.guild.id;
        const serverName = channel.guild.name;
        const playlistName = PLAYER_FAVORITES_NAME;
        const legacyPlaylistName = `${LEGACY_PLAYER_FAVORITES_NAME}_${userId}`;
        let existing = await getPlaylistCollection()!.findOne({
          name: playlistName,
          userId,
          serverId,
        });

        if (!existing) {
          const legacy = await getPlaylistCollection()!.findOne({
            name: legacyPlaylistName,
            userId,
            serverId,
          });
          if (legacy) {
            await getPlaylistCollection()!.updateOne(
              { _id: legacy._id },
              { name: playlistName, isPrivate: true }
            );
            existing = await getPlaylistCollection()!.findOne({
              _id: legacy._id,
            });
          }
        }

        if (!existing) {
          await getPlaylistCollection()!.insertOne({
            name: playlistName,
            songs: [],
            isPrivate: true,
            userId,
            serverId,
            serverName,
          });
        }

        const col = getPlaylistCollection()!;
        const playlist = await col.findOne({ name: playlistName, userId, serverId });
        const currentSongs = playlist?.songs || [];
        const songEntry = { url: current.uri };

        const exists = currentSongs.some((s: any) => s.url === songEntry.url);
        if (!exists) {
          const updatedSongs = [...currentSongs, songEntry];
          await col.updateOne(
            { name: playlistName, userId, serverId },
            { songs: updatedSongs }
          );
        }

        await sendEphemeralReply(i, "✅ **Added to Favorites.**");
      } catch (error) {
        await sendEphemeralReply(i, "⚠️ **Failed to add favorite.**");
      }
      break;
    }
    case "player_filter_select": {
      const selectedFilter = i.values?.[0];
      if (selectedFilter === "__clear__") {
        player.filters.clearFilters();
        guildActiveFilter.delete(guildId);
        await refreshNowPlayingPanel(client, guildId);
        await sendEphemeralReply(i, "🧹 **Filters cleared.**");
        break;
      }
      const applied = await applyFilterByKey(player, selectedFilter);
      if (!applied) {
        await sendEphemeralReply(i, "⚠️ **Invalid filter selection.**");
        return;
      }
      guildActiveFilter.set(guildId, selectedFilter);
      await refreshNowPlayingPanel(client, guildId);
      await sendEphemeralReply(
        i,
        `🎛️ **Filter applied:** ${selectedFilter}`
      );
      break;
    }
    case "player_filter_clear": {
      player.filters.clearFilters();
      guildActiveFilter.delete(guildId);
      await refreshNowPlayingPanel(client, guildId);
      await sendEphemeralReply(i, "🧹 **Filters cleared.**");
      break;
    }
    case "player_queue": {
      if (!player.queue.length) {
        await sendEphemeralReply(i, "📭 **Queue is empty.**");
        return;
      }
      const preview = player.queue
        .slice(0, 8)
        .map(
          (item: any, index: number) =>
            `${index + 1}. ${item.info?.title || "Unknown title"}`
        )
        .join("\n");
      await sendEphemeralReply(
        i,
        `📄 **Upcoming Queue**\n\n${preview}`
      );
      break;
    }
    case "player_shuffle": {
      if (player.queue.length < 2) {
        await sendEphemeralReply(
          i,
          "🔀 **Need at least 2 songs in queue to shuffle.**"
        );
        return;
      }
      player.queue.shuffle();
      await refreshNowPlayingPanel(client, guildId);
      await sendEphemeralReply(i, "🔀 **Queue shuffled.**");
      break;
    }
    case "volumeUp": {
      const msg = adjustVolume(player, channel, 10, t);
      await refreshNowPlayingPanel(client, guildId);
      await sendEphemeralReply(i, msg);
      break;
    }
    case "volumeDown": {
      const msg = adjustVolume(player, channel, -10, t);
      await refreshNowPlayingPanel(client, guildId);
      await sendEphemeralReply(i, msg);
      break;
    }
  }
}

async function handlePlayerModalSubmit(
  client: any,
  modal: any,
  player: any,
  channel: any
): Promise<void> {
  await modal
    .deferReply({ flags: MessageFlags.Ephemeral })
    .catch(() => {});

  try {
    if (modal.customId === "player_modal_addsong") {
      const query = modal.fields.getTextInputValue("query")?.trim();
      if (!query) {
        await modal
          .editReply({
            content: "❌ Please provide a valid song name or URL.",
          })
          .catch(() => {});
        return;
      }

      const resolve = await client.riffy.resolve({
        query,
        requester: modal.user.username,
      });
      if (
        !resolve ||
        !Array.isArray(resolve.tracks) ||
        !resolve.tracks.length
      ) {
        await modal
          .editReply({ content: "❌ No results found for that query." })
          .catch(() => {});
        return;
      }

      let added = 0;
      if (resolve.loadType === "playlist") {
        for (const track of resolve.tracks) {
          if (player.queue.length >= 500) break;
          track.info.requester = modal.user.username;
          player.queue.add(track);
          requesters.set(track.info.uri, modal.user.username);
          added++;
        }
      } else {
        if (player.queue.length < 500) {
          const track = resolve.tracks[0];
          track.info.requester = modal.user.username;
          player.queue.add(track);
          requesters.set(track.info.uri, modal.user.username);
          added = 1;
        }
      }

      if (
        !player.playing &&
        !player.paused &&
        !player.current &&
        player.queue.length > 0
      ) {
        player.play();
      }

      await refreshNowPlayingPanel(client, player.guildId);
      await modal
        .editReply({
          content: `✅ Added ${added} track${added === 1 ? "" : "s"} to queue.`,
        })
        .catch(() => {});
      return;
    }

    if (modal.customId === "player_modal_volume") {
      const raw = modal.fields.getTextInputValue("volume")?.trim();
      const volume = Number.parseInt(raw, 10);
      if (Number.isNaN(volume) || volume < 1 || volume > 100) {
        await modal
          .editReply({
            content:
              "❌ Volume must be a number between 1 and 100.",
          })
          .catch(() => {});
        return;
      }

      player.setVolume(volume);
      await refreshNowPlayingPanel(client, player.guildId);
      await modal
        .editReply({ content: `🔊 Volume set to ${volume}%.` })
        .catch(() => {});
      return;
    }

    if (modal.customId === "player_modal_save_song") {
      const current = player.current?.info;
      if (!current?.uri) {
        await modal
          .editReply({ content: "❌ No active song to save." })
          .catch(() => {});
        return;
      }

      const rawPlaylistName = modal.fields
        .getTextInputValue("playlistName")
        ?.trim();
      const playlistName = rawPlaylistName?.slice(0, 80);
      if (!playlistName) {
        await modal
          .editReply({ content: "❌ Playlist name is required." })
          .catch(() => {});
        return;
      }

      const userId = modal.user.id;
      const serverId = channel.guild.id;
      const serverName = channel.guild.name;

      const existing = await getPlaylistCollection()!.findOne({
        name: playlistName,
        userId,
        serverId,
      });
      if (!existing) {
        await getPlaylistCollection()!.insertOne({
          name: playlistName,
          songs: [],
          isPrivate: false,
          userId,
          serverId,
          serverName,
        });
      }

      // Get current songs and add new song (avoid duplicates)
        const col = getPlaylistCollection()!;
        const playlist = await col.findOne({ name: playlistName, userId, serverId });
        const currentSongs = playlist?.songs || [];
        const songEntry = { url: current.uri };
        
        const exists = currentSongs.some((s: any) => s.url === songEntry.url);
        if (!exists) {
          const updatedSongs = [...currentSongs, songEntry];
          await col.updateOne(
            { name: playlistName, userId, serverId },
            { songs: updatedSongs }
          );
        }

      await modal
        .editReply({
          content: `💾 Saved current song to playlist: ${playlistName}`,
        })
        .catch(() => {});
    }
  } catch (error) {
    await modal
      .editReply({ content: "⚠️ Failed to process modal action." })
      .catch(() => {});
  }
}

function adjustVolume(
  player: any,
  channel: any,
  amount: number,
  t: any = {}
): string {
  const newVolume = Math.min(
    100,
    Math.max(10, player.volume + amount)
  );
  if (newVolume === player.volume) {
    return amount > 0
      ? t.controls?.volumeMax || "🔊 **Volume is already at maximum!**"
      : t.controls?.volumeMin || "🔉 **Volume is already at minimum!**";
  } else {
    player.setVolume(newVolume);
    return (
      t.controls?.volumeChanged || "🔊 **Volume changed to {volume}%!**"
    ).replace("{volume}", String(newVolume));
  }
}

function toggleLoop(
  player: any,
  channel: any,
  t: any = {}
): string | null {
  const currentMode = player.loop || "none";
  const nextMode =
    currentMode === "none"
      ? "track"
      : currentMode === "track"
        ? "queue"
        : "none";

  player.setLoop(nextMode);

  if (nextMode === "track") {
    return t.controls?.trackLoopActivated || "🔁 **Track loop is activated!**";
  } else if (nextMode === "queue") {
    return t.controls?.queueLoopActivated || "🔁 **Queue loop is activated!**";
  } else {
    return t.controls?.loopDisabled || "❌ **Loop is disabled!**";
  }
}

function disableLoop(
  player: any,
  channel: any,
  t: any = {}
): string {
  player.setLoop("none");
  return t.controls?.loopDisabled || "❌ **Loop is disabled!**";
}
