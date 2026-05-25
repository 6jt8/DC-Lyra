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
import { applyFilterByKey } from "./player-filters.js";
import { refreshNowPlayingPanel, cleanupTrackMessages } from "./player-cleanup.js";
import { getPlaylistCollection } from "../database/database.js";
import { AttachmentBuilder, PermissionsBitField } from "discord.js";

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
  });

  collector.on("end", () => {
    interactionCollectors.delete(channel.guildId);
  });

  interactionCollectors.set(channel.guildId, collector);

  return collector;
}

export function stopCollector(guildId: string): void {
  const collector = interactionCollectors.get(guildId);
  if (collector) {
    collector.stop();
    interactionCollectors.delete(guildId);
  }
}

export function restartCollector(
  client: any,
  guildId: string,
  channel: any,
  message: any
): any {
  stopCollector(guildId);
  const player = client.riffy?.players?.get(guildId);
  if (!player || player.destroyed) return null;
  return setupCollector(client, player, channel, message);
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

  switch (i.customId) {
    case "loopToggle": {
      toggleLoop(player, channel, t);
      await refreshNowPlayingPanel(client, player.guildId);
      break;
    }
    case "skipTrack": {
      const guildId = player.guildId;
      clearProgressUpdates(guildId);
      player.stop();
      await sendEmbed(
        channel,
        t.controls?.skip || "⏭️ **Skipping to next song...**"
      );
      break;
    }
    case "disableLoop": {
      disableLoop(player, channel, t);
      break;
    }
    case "showLyrics": {
      const { showLyrics } = await import("./player-lyrics.js");
      await showLyrics(client, channel, player);
      break;
    }
    case "clearQueue": {
      player.queue.clear();
      await sendEmbed(
        channel,
        t.controls?.queueCleared || "🗑️ **Queue has been cleared!**"
      );
      break;
    }
    case "stopTrack": {
      await cleanupTrackMessages(client, player);
      client.statusManager?.onPlayerDisconnect(player.guildId);
      player.stop();
      player.destroy();
      await sendEmbed(
        channel,
        t.controls?.playbackStopped ||
          "⏹️ **Playback has been stopped and player destroyed!**"
      );
      break;
    }
    case "togglePlayback": {
      try {
        if (!player || player.destroyed) {
          await sendEmbed(
            channel,
            t.controls?.playerDestroyed ||
              "❌ **Player is not available!**"
          );
          return;
        }
        if (player.paused) {
          player.pause(false);
          await sendEmbed(
            channel,
            t.controls?.playbackResumed ||
              "▶️ **Playback has been resumed!**"
          );
        } else {
          player.pause(true);
          await sendEmbed(
            channel,
            t.controls?.playbackPaused ||
              "⏸️ **Playback has been paused!**"
          );
        }
        await refreshNowPlayingPanel(client, player.guildId);
      } catch (error: any) {
        const langSync = getLangSync();
        console.warn(
          `${colors.cyan}[ PLAYER ]${colors.reset} ${colors.yellow}Toggle playback error: ${error.message}${colors.reset}`
        );
        await sendEmbed(
          channel,
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
          await sendEmbed(
            channel,
            "❌ **No active song to favorite.**"
          );
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
              { $set: { name: playlistName, isPrivate: true } }
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

        const songEntry = { url: current.uri };
        await getPlaylistCollection()!.updateOne(
          { name: playlistName, userId, serverId },
          { $addToSet: { songs: songEntry } }
        );

        await sendEmbed(channel, "✅ **Added to Favorites.**");
      } catch (error) {
        await sendEmbed(
          channel,
          "⚠️ **Failed to add favorite.**"
        );
      }
      break;
    }
    case "player_filter_select": {
      const selectedFilter = i.values?.[0];
      if (selectedFilter === "__clear__") {
        player.filters.clearFilters();
        guildActiveFilter.delete(player.guildId);
        await refreshNowPlayingPanel(client, player.guildId);
        await sendEmbed(channel, "🧹 **Filters cleared.**");
        break;
      }
      const applied = await applyFilterByKey(player, selectedFilter);
      if (!applied) {
        await sendEmbed(
          channel,
          "⚠️ **Invalid filter selection.**"
        );
        return;
      }
      guildActiveFilter.set(player.guildId, selectedFilter);
      await refreshNowPlayingPanel(client, player.guildId);
      await sendEmbed(
        channel,
        `🎛️ **Filter applied:** ${selectedFilter}`
      );
      break;
    }
    case "player_filter_clear": {
      player.filters.clearFilters();
      guildActiveFilter.delete(player.guildId);
      await refreshNowPlayingPanel(client, player.guildId);
      await sendEmbed(channel, "🧹 **Filters cleared.**");
      break;
    }
    case "player_queue": {
      if (!player.queue.length) {
        await sendEmbed(channel, "📭 **Queue is empty.**");
        return;
      }
      const preview = player.queue
        .slice(0, 8)
        .map(
          (item: any, index: number) =>
            `${index + 1}. ${item.info?.title || "Unknown title"}`
        )
        .join("\n");
      await sendEmbed(
        channel,
        `📄 **Upcoming Queue**\n\n${preview}`
      );
      break;
    }
    case "player_shuffle": {
      if (player.queue.length < 2) {
        await sendEmbed(
          channel,
          "🔀 **Need at least 2 songs in queue to shuffle.**"
        );
        return;
      }
      player.queue.shuffle();
      await refreshNowPlayingPanel(client, player.guildId);
      await sendEmbed(channel, "🔀 **Queue shuffled.**");
      break;
    }
    case "volumeUp": {
      adjustVolume(player, channel, 10, t);
      await refreshNowPlayingPanel(client, player.guildId);
      break;
    }
    case "volumeDown": {
      adjustVolume(player, channel, -10, t);
      await refreshNowPlayingPanel(client, player.guildId);
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

      const { requesters } = await import("./player-store.js");
      let added = 0;
      if (resolve.loadType === "playlist") {
        for (const track of resolve.tracks) {
          track.info.requester = modal.user.username;
          player.queue.add(track);
          requesters.set(track.info.uri, modal.user.username);
          added++;
        }
      } else {
        const track = resolve.tracks[0];
        track.info.requester = modal.user.username;
        player.queue.add(track);
        requesters.set(track.info.uri, modal.user.username);
        added = 1;
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

      await getPlaylistCollection()!.updateOne(
        { name: playlistName, userId, serverId },
        { $addToSet: { songs: { url: current.uri } } }
      );

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

async function adjustVolume(
  player: any,
  channel: any,
  amount: number,
  t: any = {}
): Promise<void> {
  const newVolume = Math.min(
    100,
    Math.max(10, player.volume + amount)
  );
  if (newVolume === player.volume) {
    await sendEmbed(
      channel,
      amount > 0
        ? t.controls?.volumeMax ||
            "🔊 **Volume is already at maximum!**"
        : t.controls?.volumeMin ||
            "🔉 **Volume is already at minimum!**"
    );
  } else {
    player.setVolume(newVolume);
    await sendEmbed(
      channel,
      (
        t.controls?.volumeChanged ||
        "🔊 **Volume changed to {volume}%!**"
      ).replace("{volume}", newVolume)
    );
  }
}

async function toggleLoop(
  player: any,
  channel: any,
  t: any = {}
): Promise<void> {
  const currentMode = player.loop || "none";
  const nextMode =
    currentMode === "none"
      ? "track"
      : currentMode === "track"
        ? "queue"
        : "none";

  player.setLoop(nextMode);

  if (nextMode === "track") {
    await sendEmbed(
      channel,
      t.controls?.trackLoopActivated ||
        "🔁 **Track loop is activated!**"
    );
  } else if (nextMode === "queue") {
    await sendEmbed(
      channel,
      t.controls?.queueLoopActivated ||
        "🔁 **Queue loop is activated!**"
    );
  } else {
    await sendEmbed(
      channel,
      t.controls?.loopDisabled || "❌ **Loop is disabled!**"
    );
  }
}

async function disableLoop(
  player: any,
  channel: any,
  t: any = {}
): Promise<void> {
  player.setLoop("none");
  await sendEmbed(
    channel,
    t.controls?.loopDisabled || "❌ **Loop is disabled!**"
  );
}

function clearProgressUpdates(guildId: string): void {
  const {
    progressUpdateIntervals,
  } = require("./player-store");
  const intervalId = progressUpdateIntervals.get(guildId);
  if (intervalId) {
    clearInterval(intervalId);
    progressUpdateIntervals.delete(guildId);
  }
}
