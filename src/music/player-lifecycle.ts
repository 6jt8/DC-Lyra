import { config } from "../config.js";
import { getLang } from "../utils/language.js";
import {
  AttachmentBuilder,
  MessageFlags,
  PermissionsBitField,
} from "discord.js";
import {
  guildTrackMessages,
  guildActiveFilter,
  nowPlayingMessages,
  progressUpdateIntervals,
  requesters,
  stopCollector,
  getCommandMentionMap,
} from "./player-store.js";
import {
  buildNowPlayingContainer,
  buildPlayerActionRows,
  clearTrackMediaCache,
  createProgressBar,
  getTrackMediaCache,
} from "./player-ui.js";
import { savePlayerSession, deletePlayerSession } from "../database/player-sessions.js";

export function clearProgressUpdates(guildId: string): void {
  const intervalId = progressUpdateIntervals.get(guildId);
  if (intervalId) {
    clearInterval(intervalId);
    progressUpdateIntervals.delete(guildId);
  }
}

export function resetGuildPlayerState(client: any, player: any): void {
  const guildId = player?.guildId;
  if (!guildId) return;

  clearTrackMediaCache(guildId);
  clearProgressUpdates(guildId);
  stopCollector(guildId);
  guildTrackMessages.set(guildId, []);
  nowPlayingMessages.delete(guildId);
  guildActiveFilter.delete(guildId);
  deletePlayerSession(guildId).catch(() => {});

  if (player?.current?.info?.uri) {
    requesters.delete(player.current.info.uri);
  }
}

export async function cleanupPlayerAndDisconnect(
  client: any,
  player: any,
  options: { disconnect?: boolean; destroy?: boolean } = {}
): Promise<void> {
  const { disconnect = true, destroy = true } = options;
  const guildId = player?.guildId;
  if (!guildId) return;

  resetGuildPlayerState(client, player);

  if (disconnect) {
    client.statusManager?.onPlayerDisconnect(guildId).catch(() => {});
  }

  if (!player || player.destroyed) return;

  try {
    player.stop();
  } catch (error) {
    console.error("[PLAYER] Error stopping player during cleanup:", error);
  }

  if (destroy) {
    try {
      player.destroy();
    } catch (error) {
      console.error("[PLAYER] Error destroying player during cleanup:", error);
    }
  }
}

export async function startProgressUpdates(
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

export async function editNowPlayingPanel(
  client: any,
  guildId: string
): Promise<void> {
  const stored = nowPlayingMessages.get(guildId);
  if (!stored) return;

  const player = client.riffy.players.get(guildId);
  if (!player || player.destroyed || !player.current) return;

  const channel = client.channels.cache.get(stored.channelId);
  if (!channel) return;

  const track = player.current;

  const msg = await channel.messages
    .fetch(stored.messageId)
    .catch(() => null);
  if (!msg) return;

  const { mediaUrl, mediaAttachment } = await resolveMediaForGuild(
    client, guildId, channel, track
  );

  const payload = await buildNowPlayingPayload(
    client, guildId, player, track, mediaUrl, mediaAttachment
  );
  if (!payload) return;

  const editPayload: any = {
    components: [payload.container],
    flags: MessageFlags.IsComponentsV2,
  };
  if (payload.attachment) {
    editPayload.files = [payload.attachment];
  }

  savePlayerSession(guildId, {
    voiceChannelId: player.voiceChannel,
    textChannelId: stored.channelId,
    messageId: stored.messageId,
    trackEncoded: track.track || null,
    position: player.position || 0,
    loopMode: player.loop || "none",
    volume: player.volume || 20,
    filter: guildActiveFilter.get(guildId) || null,
    paused: player.paused || false,
    twentyfourseven: false,
    isActive: true,
  }).catch(() => {});

  await msg.edit(editPayload).catch(() => {});
}

export async function resolveMediaForGuild(
  client: any,
  guildId: string,
  channel: any,
  track: any
): Promise<{ mediaUrl: string | null; mediaAttachment: any }> {
  const canAttachFiles = channel.permissionsFor(
    channel.guild.members.me
  )?.has(PermissionsBitField.Flags.AttachFiles);
  const useGeneratedSongCard = config.generateSongCard !== false;
  const cachedMedia = useGeneratedSongCard
    ? getTrackMediaCache(guildId, track.info.uri)
    : null;

  let mediaUrl: string | null = null;
  let mediaAttachment: any = null;

  if (useGeneratedSongCard) {
    if (cachedMedia?.cardBuffer && canAttachFiles) {
      mediaAttachment = new AttachmentBuilder(
        cachedMedia.cardBuffer,
        { name: "song-banner.png" }
      );
      mediaUrl = "attachment://song-banner.png";
    } else if (cachedMedia?.mediaUrl) {
      mediaUrl = cachedMedia.mediaUrl;
    }
    if (!mediaUrl && cachedMedia?.cardBuffer && canAttachFiles) {
      mediaAttachment = new AttachmentBuilder(
        cachedMedia.cardBuffer,
        { name: "song-banner.png" }
      );
      mediaUrl = "attachment://song-banner.png";
    }
  }

  return { mediaUrl, mediaAttachment };
}

export async function buildNowPlayingPayload(
  client: any,
  guildId: string,
  player: any,
  track: any,
  mediaUrl: string | null,
  mediaAttachment: any
): Promise<{ container: any; attachment: any } | null> {
  const lang = await getLang(guildId).catch(() => ({
    console: { player: {} },
  }));
  const t = lang.console?.player || {};
  const requester =
    requesters.get(track.info.uri) ||
    t.trackInfo?.unknown ||
    "Unknown";
  const commandMentionMap = await getCommandMentionMap(client);
  const progressBar = createProgressBar(
    player.position || 0,
    track.info.length || 1
  );
  const actionRows = buildPlayerActionRows(
    player.paused,
    player.loop,
    guildActiveFilter.get(guildId) || null
  );

  const container = buildNowPlayingContainer(
    track,
    requester,
    t,
    config.showProgressBar !== false ? progressBar : null,
    Math.min(
      100,
      Math.round(
        ((player.position || 0) / (track.info.length || 1)) * 100
      )
    ),
    mediaUrl,
    actionRows,
    {
      paused: player.paused,
      loop: player.loop,
      currentPosition: player.position || 0,
      queueLength: player.queue.length,
      commandMentionMap,
    }
  );

  return { container, attachment: mediaAttachment };
}

