import axios from "axios";
import {
  ContainerBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from "discord.js";
import { safeDeferUpdate } from "../ui/responseHandler.js";
import { getLang, getLangSync } from "../utils/language.js";
import { config } from "../config.js";
import { guildTrackMessages } from "./player-store.js";

export async function getLyrics(
  trackName: string,
  artistName: string,
  duration: number
): Promise<string | null> {
  try {
    trackName = trackName
      .replace(
        /\b(Official|Audio|Video|Lyrics|Theme|Soundtrack|Music|Full Version|HD|4K|Visualizer|Radio Edit|Live|Remix|Mix|Extended|Cover|Parody|Performance|Version|Unplugged|Reupload)\b/gi,
        ""
      )
      .replace(/\s*[-_/|]\s*/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    artistName = artistName
      .replace(
        /\b(Topic|VEVO|Records|Label|Productions|Entertainment|Ltd|Inc|Band|DJ|Composer|Performer)\b/gi,
        ""
      )
      .replace(/ x /gi, " & ")
      .replace(/\s+/g, " ")
      .trim();

    if (!trackName || !artistName) return null;

    let response = await axios.get("https://lrclib.net/api/get", {
      params: {
        track_name: trackName,
        artist_name: artistName,
        duration,
      },
      timeout: 5000,
    });

    if (
      response.data &&
      (response.data.syncedLyrics || response.data.plainLyrics)
    ) {
      return response.data.syncedLyrics || response.data.plainLyrics;
    }

    response = await axios.get("https://lrclib.net/api/get", {
      params: { track_name: trackName, artist_name: artistName },
      timeout: 5000,
    });

    if (
      response.data &&
      (response.data.syncedLyrics || response.data.plainLyrics)
    ) {
      return response.data.syncedLyrics || response.data.plainLyrics;
    }

    return null;
  } catch (error: any) {
    console.error(
      "Lyrics fetch error:",
      error.response?.data?.message || error.message
    );
    return null;
  }
}

export async function showLyrics(
  client: any,
  channel: any,
  player: any
): Promise<void> {
  const lang = await getLang(player.guildId).catch(() => ({
    console: { player: {} },
  }));
  const t = lang.console?.player || {};

  if (!player || !player.current || !player.current.info) {
    const { sendEmbed } = await import("./player-ui.js");
    await sendEmbed(
      channel,
      t.lyrics?.error || "❌ **Error loading lyrics!**"
    );
    return;
  }

  const track = player.current;
  const lyrics = await getLyrics(track.info.title, track.info.author, Math.floor(track.info.length / 1000));

  if (!lyrics) {
    const { sendEmbed } = await import("./player-ui.js");
    await sendEmbed(
      channel,
      t.lyrics?.notFound || "❌ **Lyrics not found!**"
    );
    return;
  }

  const lines = lyrics
    .split("\n")
    .map((line: string) => line.trim())
    .filter(Boolean);
  const songDuration = Math.floor(track.length / 1000);

  const components: any[] = [];

  const lyricsContainer = new ContainerBuilder().addTextDisplayComponents(
    (textDisplay: any) =>
      textDisplay.setContent(
        `${(t.lyrics?.liveTitle || "## 🎵 Live Lyrics: {title}").replace("{title}", track.title)}\n\n` +
          (t.lyrics?.syncing || "🔄 Syncing lyrics...")
      )
  );
  components.push(lyricsContainer);

  const stopButton = new ButtonBuilder()
    .setCustomId("stopLyrics")
    .setLabel(t.lyrics?.stopButton || "Stop Lyrics")
    .setStyle(ButtonStyle.Danger);

  const fullButton = new ButtonBuilder()
    .setCustomId("fullLyrics")
    .setLabel(t.lyrics?.fullButton || "Full Lyrics")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(fullButton, stopButton);

  const message = await channel.send({
    components: [...components, row],
    flags: MessageFlags.IsComponentsV2,
  });

  const guildId = player.guildId;
  if (!guildTrackMessages.has(guildId)) {
    guildTrackMessages.set(guildId, []);
  }
  guildTrackMessages.get(guildId)!.push({
    messageId: message.id,
    channelId: channel.id,
    type: "lyrics",
  });

  const updateLyrics = async () => {
    const currentTime = Math.floor(player.position / 1000);
    const totalLines = lines.length;
    const linesPerSecond = totalLines / songDuration;
    const currentLineIndex = Math.floor(currentTime * linesPerSecond);

    const start = Math.max(0, currentLineIndex - 3);
    const end = Math.min(totalLines, currentLineIndex + 3);
    const visibleLines = lines.slice(start, end).join("\n");

    const lang = await getLang(player.guildId).catch(() => ({
      console: { player: {} },
    }));
    const t = lang.console?.player || {};
    const updatedContainer =
      new ContainerBuilder().addTextDisplayComponents((textDisplay: any) =>
        textDisplay.setContent(
          `${(t.lyrics?.liveTitle || "## 🎵 Live Lyrics: {title}").replace("{title}", track.title)}\n\n` +
            visibleLines
        )
      );
    await message
      .edit({
        components: [updatedContainer, row],
        flags: MessageFlags.IsComponentsV2,
      })
      .catch((err: any) => {
        if (err?.code === 10008 || err?.message?.includes("Unknown Message") || err?.message?.includes("Missing Access")) {
          clearInterval(interval);
        }
      });
  };

  const interval = setInterval(updateLyrics, 3000);
  updateLyrics();

  const collector = message.createMessageComponentCollector({
    time: 300000,
  });

  collector.on("collect", async (i: any) => {
    const deferred = await safeDeferUpdate(i);
    if (!deferred && !i.deferred && !i.replied) return;

    if (i.customId === "stopLyrics") {
      clearInterval(interval);
      await message.delete().catch(() => {});
    } else if (i.customId === "fullLyrics") {
      clearInterval(interval);
      const lang = await getLang(player.guildId).catch(() => ({
        console: { player: {} },
      }));
      const t = lang.console?.player || {};
      const fullLyricsContainer =
        new ContainerBuilder().addTextDisplayComponents(
          (textDisplay: any) =>
            textDisplay.setContent(
              `${(t.lyrics?.fullTitle || "## 🎵 Full Lyrics: {title}").replace("{title}", track.title)}\n\n` +
                lines.join("\n")
            )
        );

      const deleteButton = new ButtonBuilder()
        .setCustomId("deleteLyrics")
        .setLabel(t.lyrics?.deleteButton || "Delete")
        .setStyle(ButtonStyle.Danger);

      const deleteRow = new ActionRowBuilder().addComponents(deleteButton);

      await message
        .edit({
          components: [fullLyricsContainer, deleteRow],
          flags: MessageFlags.IsComponentsV2,
        })
        .catch(() => {});
    } else if (i.customId === "deleteLyrics") {
      await message.delete().catch(() => {});
    }
  });

  collector.on("end", () => {
    clearInterval(interval);
    message.delete().catch(() => {});
  });
}
