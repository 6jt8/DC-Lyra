import {
  ContainerBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  MediaGalleryBuilder,
  AttachmentBuilder,
  PermissionsBitField,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { getEmoji, getButtonEmoji } from "../emoji/emoji.js";
import { cardFromMessage, sanitizeMentions } from "../ui/responseHandler.js";
import { config } from "../config.js";
import { getLangSync, getLang } from "../utils/language.js";
import {
  getCommandMentionMap,
  buildRandomTryHint,
  guildTrackMediaCache,
} from "./player-store.js";
import { PLAYER_FILTER_OPTIONS } from "./player-filters.js";

export function formatSourceName(sourceName: string): string {
  const raw = String(sourceName || "Unknown").toLowerCase();
  if (raw === "youtube") return "YouTube";
  if (raw === "soundcloud") return "SoundCloud";
  if (raw === "spotify") return "Spotify";
  if (raw === "applemusic") return "Apple Music";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  return [hours > 0 ? `${hours}h` : null, minutes > 0 ? `${minutes}m` : null, `${seconds}s`]
    .filter(Boolean)
    .join(" ");
}

export function createProgressBar(
  current: number,
  total: number,
  length: number = 20
): string {
  const progress = Math.round((current / total) * length);
  const emptyProgress = length - progress;
  const progressText = "▓".repeat(progress);
  const emptyProgressText = "░".repeat(emptyProgress);

  const currentTime = formatDuration(current);
  const totalTime = formatDuration(total);

  return `\`${currentTime}\` ${progressText}${emptyProgressText} \`${totalTime}\``;
}

export function setTrackMediaCache(
  guildId: string,
  trackUri: string,
  mediaUrl: string | null = null,
  cardBuffer: Buffer | null = null
): void {
  if (!guildId || !trackUri) return;
  guildTrackMediaCache.set(guildId, { trackUri, mediaUrl, cardBuffer });
}

export function getTrackMediaCache(
  guildId: string,
  trackUri: string
): any {
  const cached = guildTrackMediaCache.get(guildId);
  if (!cached || cached.trackUri !== trackUri) return null;
  return cached;
}

export function clearTrackMediaCache(guildId: string): void {
  guildTrackMediaCache.delete(guildId);
}

export function createAddSongModal(): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId("player_modal_addsong")
    .setTitle("Add Song to Queue");

  const input = new TextInputBuilder()
    .setCustomId("query")
    .setLabel("Song Name or URL")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("e.g. Adele Skyfall or https://...")
    .setRequired(true)
    .setMaxLength(200);

  modal.addComponents(new ActionRowBuilder().addComponents(input) as any);
  return modal;
}

export function createVolumeModal(currentVolume: number = 100): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId("player_modal_volume")
    .setTitle("Set Volume");

  const input = new TextInputBuilder()
    .setCustomId("volume")
    .setLabel("Volume (1-100)")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(String(Math.min(100, Math.max(1, currentVolume || 100))))
    .setRequired(true)
    .setMaxLength(3);

  modal.addComponents(new ActionRowBuilder().addComponents(input) as any);
  return modal;
}

export function createSaveSongModal(): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId("player_modal_save_song")
    .setTitle("Save Song to Playlist");

  const input = new TextInputBuilder()
    .setCustomId("playlistName")
    .setLabel("Playlist Name")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("My Favorites")
    .setRequired(true)
    .setMaxLength(80);

  modal.addComponents(new ActionRowBuilder().addComponents(input) as any);
  return modal;
}

export function buildNowPlayingContainer(
  track: any,
  requesterName: string,
  t: any,
  progressBar: string | null,
  progressPercent: number,
  mediaUrl: string | null,
  actionRows: any = {},
  playerState: any = {}
): any {
  const musicIcon = getEmoji("music") || "🎵";
  const titleIcon = getEmoji("music") || "🎧";
  const infoIcon = getEmoji("info") || "ℹ️";
  const timeIcon = getEmoji("uptime") || "⏱️";
  const queueIcon = getEmoji("queue") || "📄";
  const userIcon = getEmoji("users") || "👤";
  const sourceIcon = getEmoji("servers") || "🌐";
  const playIcon = getEmoji("play") || "▶️";
  const pauseIcon = getEmoji("pause") || "⏸️";
  const loopIcon = getEmoji("settings") || "🔁";
  const controlsIcon = getEmoji("settings") || "⚙️";
  const manageIcon = getEmoji("owner") || "👑";
  const filterIcon = getEmoji("servers") || "🌐";
  const byText = t.trackInfo?.by || "by";
  const isPaused = playerState.paused === true;
  const loopMode = playerState.loop || "none";
  const isLoopOn = loopMode !== "none";
  const sourceName = formatSourceName(track.info?.sourceName);
  const stateLabel = isPaused
    ? t.playerState?.paused || "Paused"
    : t.playerState?.playing || "Playing";
  const loopStateLabel = isLoopOn
    ? t.playerState?.loopOn || "Loop On"
    : t.playerState?.loopOff || "Loop Off";
  const infoLine = `${timeIcon} ${formatDuration(track.info.length)} • ${userIcon} ${requesterName || (t.trackInfo?.unknown || "Unknown")} • ${sourceIcon} ${sourceName}`;
  const stateLine1 = `${isPaused ? pauseIcon : playIcon} ${stateLabel}`;
  const stateLine2 = `${loopIcon} ${loopStateLabel}`;
  const durationLine = `${timeIcon} ${formatDuration(track.info.length)}`;
  const requesterLine = `${userIcon} ${requesterName || (t.trackInfo?.unknown || "Unknown")}`;
  const sourceLine = `${sourceIcon} ${sourceName}`;
  const queueHint = `${queueIcon} ${playerState.queueLength || 0} ${playerState.queueLength === 1 ? "song" : "songs"} in queue`;
  const tryHint = buildRandomTryHint(playerState.commandMentionMap);
  const showTitleBlock = !mediaUrl;

  const container = new ContainerBuilder();

  if (mediaUrl) {
    const mediaGallery = new MediaGalleryBuilder().addItems(
      (mediaItem: any) =>
        mediaItem
          .setURL(mediaUrl)
          .setDescription(
            `${track.info?.title || "Unknown Title"} - ${track.info?.author || "Unknown Artist"}`
          )
    );

    container
      .addSeparatorComponents((separator: any) => separator)
      .addMediaGalleryComponents(mediaGallery);
  }

  if (showTitleBlock) {
    container.addTextDisplayComponents((textDisplay: any) =>
      textDisplay.setContent(
        `### ${titleIcon} ${sanitizeMentions(track.info.title || "Unknown Title")}\n` +
          `${byText} ${sanitizeMentions(track.info.author || (t.trackInfo?.unknownArtist || "Unknown Artist"))}`
      )
    );
  }

  const showSongDetails = !mediaUrl || config.metadataTag === true;
  if (showSongDetails) {
    container
      .addSeparatorComponents((separator: any) => separator)
      .addTextDisplayComponents(
        (textDisplay: any) =>
          textDisplay.setContent(
            `### ${infoIcon} ${t.songDetailsTitle || "Song Details"}\n` +
              `${stateLine1}\n` +
              `${stateLine2}\n` +
              `${durationLine}\n` +
              `${requesterLine}\n` +
              `${sourceLine}\n` +
              `${queueHint}`
          )
      );
  }

  if (actionRows?.playbackRow) {
    container
      .addSeparatorComponents((separator: any) => separator)
      .addTextDisplayComponents((textDisplay: any) =>
        textDisplay.setContent(`### ${controlsIcon} Playback`)
      )
      .addActionRowComponents(actionRows.playbackRow);
  }

  if (actionRows?.manageRow) {
    container
      .addSeparatorComponents((separator: any) => separator)
      .addTextDisplayComponents((textDisplay: any) =>
        textDisplay.setContent(`### ${manageIcon} Library`)
      )
      .addActionRowComponents(actionRows.manageRow);
  }

  if (actionRows?.filterRow) {
    container
      .addSeparatorComponents((separator: any) => separator)
      .addTextDisplayComponents((textDisplay: any) =>
        textDisplay.setContent(`### ${filterIcon} Effects`)
      )
      .addActionRowComponents(actionRows.filterRow);
  }

  container
    .addSeparatorComponents((separator: any) => separator)
    .addTextDisplayComponents((textDisplay: any) =>
      textDisplay.setContent(tryHint)
    );

  return container;
}

export function createPlaybackActionRow(
  disabled: boolean,
  paused: boolean = false,
  loopMode: string = "none"
): any {
  const playEmoji = getButtonEmoji("play") || "▶️";
  const pauseEmoji = getButtonEmoji("pause") || "⏸️";
  const skipEmoji = getButtonEmoji("next") || "⏭️";
  const volumeEmoji = getButtonEmoji("volume") || "🔊";
  const loopEmoji = getButtonEmoji("settings") || "🔁";
  const stopEmoji = getButtonEmoji("stop") || "⏹️";
  const loopEnabled = loopMode !== "none";
  const playbackEmoji = paused ? playEmoji : pauseEmoji;
  const playbackLabel = paused ? "Play" : "Pause";
  const playbackStyle = paused ? ButtonStyle.Success : ButtonStyle.Secondary;

  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("togglePlayback")
      .setEmoji(playbackEmoji)
      .setLabel(playbackLabel)
      .setStyle(playbackStyle)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId("skipTrack")
      .setEmoji(skipEmoji)
      .setLabel("Skip")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId("player_volume")
      .setEmoji(volumeEmoji)
      .setLabel("Volume")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId("loopToggle")
      .setEmoji(loopEmoji)
      .setLabel("Loop")
      .setStyle(loopEnabled ? ButtonStyle.Success : ButtonStyle.Secondary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId("stopTrack")
      .setEmoji(stopEmoji)
      .setLabel("Stop")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(disabled)
  );
}

export function createManageSongActionRow(disabled: boolean): any {
  const favoriteEmoji = getButtonEmoji("welcome") || "⭐";
  const addEmoji = getButtonEmoji("play") || "➕";
  const queueEmoji = getButtonEmoji("queue") || "📄";
  const saveEmoji = getButtonEmoji("folder") || "💾";
  const shuffleEmoji = getButtonEmoji("servers") || "🌐";

  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("player_favorite")
      .setEmoji(favoriteEmoji)
      .setLabel("Favorite")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId("player_add_song")
      .setEmoji(addEmoji)
      .setLabel("Add")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId("player_queue")
      .setEmoji(queueEmoji)
      .setLabel("Queue")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId("player_save_song")
      .setEmoji(saveEmoji)
      .setLabel("Save")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId("player_shuffle")
      .setEmoji(shuffleEmoji)
      .setLabel("Shuffle")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled)
  );
}

export function createFilterRow(
  disabled: boolean,
  activeFilter: string | null = null
): any {
  const select = new StringSelectMenuBuilder()
    .setCustomId("player_filter_select")
    .setPlaceholder(
      activeFilter ? `Filter: ${activeFilter}` : "Select audio filter"
    )
    .setDisabled(disabled)
    .addOptions(
      [
        { label: "Clear Filters", value: "__clear__" },
        ...PLAYER_FILTER_OPTIONS,
      ].map((item: any) => ({
        label: item.label,
        value: item.value,
        default: item.value === activeFilter,
      }))
    );

  return new ActionRowBuilder().addComponents(select);
}

export function buildPlayerActionRows(
  paused: boolean,
  loopMode: string,
  activeFilter: string | null
): any {
  return {
    playbackRow: createPlaybackActionRow(false, paused, loopMode),
    manageRow: createManageSongActionRow(false),
    filterRow: createFilterRow(false, activeFilter),
  };
}

export function stripMediaGallery(components: any[] = []): any[] {
  return components.filter(
    (component) => !(component instanceof MediaGalleryBuilder)
  );
}

export async function sendMessageWithPermissionsCheck(
  channel: any,
  components: any[],
  attachment: any
): Promise<any> {
  try {
    const permissions = channel.permissionsFor(channel.guild.members.me);
    const needsAttachPermission = !!attachment;
    if (
      !permissions.has(PermissionsBitField.Flags.SendMessages) ||
      !permissions.has(PermissionsBitField.Flags.EmbedLinks)
    ) {
      const lang = getLangSync();
      console.error(
        lang.console?.player?.lacksPermissions ||
          "Bot lacks necessary permissions to send messages in this channel."
      );
      return;
    }

    let safeComponents = components;
    let safeAttachment = attachment;
    if (
      needsAttachPermission &&
      !permissions.has(PermissionsBitField.Flags.AttachFiles)
    ) {
      safeComponents = stripMediaGallery(components);
      safeAttachment = null;
    }

    const messageOptions: any = {
      components: safeComponents,
      flags: MessageFlags.IsComponentsV2,
    };

    if (safeAttachment) {
      messageOptions.files = [safeAttachment];
    }

    try {
      const message = await channel.send(messageOptions);
      return message;
    } catch (sendError) {
      const fallbackComponents = stripMediaGallery(components);
      const fallbackOptions = {
        components: fallbackComponents,
        flags: MessageFlags.IsComponentsV2,
      };
      const message = await channel.send(fallbackOptions);
      return message;
    }
  } catch (error: any) {
    const langSync = getLangSync();
    console.error(
      langSync.console?.player?.errorSendingMessage?.replace(
        "{message}",
        error.message
      ) || "Error sending message:",
      error.message
    );
    const lang = await getLang(channel.guildId).catch(() => ({
      console: { player: {} },
    }));
    const t = lang.console?.player || {};
    const errorContainer = cardFromMessage(
      `${t.unableToSendMessage?.title || "## ⚠️ Unable to Send Message"}\n\n` +
        `${t.unableToSendMessage?.message || "Unable to send message. Check bot permissions."}`,
      "Unable to Send Message"
    );
    await channel
      .send({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2,
      })
      .catch(() => {});
  }
}

export async function sendTransientCard(
  channel: any,
  message: string,
  deleteMs: number = 5000,
  fallbackTitle: string = "Notice"
): Promise<any> {
  const container = cardFromMessage(message, fallbackTitle);
  const sent = await channel.send({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });
  setTimeout(() => sent.delete().catch(() => {}), deleteMs);
  return sent;
}

export async function sendEmbed(
  channel: any,
  message: string
): Promise<void> {
  const container = cardFromMessage(message, "Player Update");
  const sentMessage = await channel
    .send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    })
    .catch(() => null);
  if (sentMessage) {
    setTimeout(
      () => sentMessage.delete().catch(() => {}),
      config.embedTimeout * 1000
    );
  }
}
