import { AttachmentBuilder, MessageFlags, PermissionsBitField } from "discord.js";
import { getLang } from "../utils/language.js";
import { requesters } from "./player-store.js";
import {
  nowPlayingMessages,
  guildTrackMessages,
  progressUpdateIntervals,
  interactionCollectors,
  guildActiveFilter,
  getCommandMentionMap,
} from "./player-store.js";
import {
  buildNowPlayingContainer,
  buildPlayerActionRows,
  getTrackMediaCache,
  clearTrackMediaCache,
  createProgressBar,
  sendMessageWithPermissionsCheck,
} from "./player-ui.js";
import { stopCollector, restartCollector } from "./player-store.js";
import { config } from "../config.js";

export async function cleanupTrackMessages(
  client: any,
  player: any
): Promise<void> {
  const guildId = player.guildId;
  clearTrackMediaCache(guildId);

  stopCollector(guildId);

  const intervalId = progressUpdateIntervals.get(guildId);
  if (intervalId) {
    clearInterval(intervalId);
    progressUpdateIntervals.delete(guildId);
  }

  const messages = guildTrackMessages.get(guildId) || [];

  for (const messageInfo of messages) {
    try {
      const channel =
        client.channels.cache.get(messageInfo.channelId);
      if (channel) {
        const message = await channel.messages
          .fetch(messageInfo.messageId)
          .catch(() => null);
        if (message) {
          await message.delete().catch(() => {});
        }
      }
    } catch (error) {
      console.error(
        "Error cleaning up track message:",
        error
      );
    }
  }

  guildTrackMessages.set(guildId, []);
  nowPlayingMessages.delete(guildId);

  if (player.current?.info?.uri) {
    requesters.delete(player.current.info.uri);
  }
}

async function buildNowPlayingPayload(
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

async function resolveMediaForGuild(
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

export async function deleteAndSendNowPlaying(
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

  const oldMsg = await channel.messages
    .fetch(stored.messageId)
    .catch(() => null);
  if (oldMsg) {
    await oldMsg.delete().catch(() => {});
  }

  const { mediaUrl, mediaAttachment } = await resolveMediaForGuild(
    client, guildId, channel, track
  );

  const payload = await buildNowPlayingPayload(
    client, guildId, player, track, mediaUrl, mediaAttachment
  );
  if (!payload) return;

  const components = [payload.container];
  const newMessage = await sendMessageWithPermissionsCheck(
    channel,
    components,
    payload.attachment
  );
  if (!newMessage) return;

  nowPlayingMessages.set(guildId, {
    messageId: newMessage.id,
    channelId: channel.id,
    player: player,
    trackUri: track.info.uri,
  });

  const messages = guildTrackMessages.get(guildId) || [];
  const idx = messages.findIndex(
    (m: any) => m.messageId === stored.messageId
  );
  const newEntry = {
    messageId: newMessage.id,
    channelId: channel.id,
    type: "track",
  };
  if (idx !== -1) {
    messages[idx] = newEntry;
  } else {
    messages.push(newEntry);
  }

  restartCollector(client, guildId, channel, newMessage);
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

  await msg.edit(editPayload).catch(() => {});
}

export async function refreshNowPlayingPanel(
  client: any,
  guildId: string
): Promise<void> {
  const stored = nowPlayingMessages.get(guildId);
  if (!stored) return;

  const player = client.riffy.players.get(guildId);
  if (!player || player.destroyed || !player.current) return;

  const channel = client.channels.cache.get(stored.channelId);
  if (!channel) return;

  const msg = await channel.messages
    .fetch(stored.messageId)
    .catch(() => null);

  if (msg) {
    const track = player.current;
    const { mediaUrl } = await resolveMediaForGuild(
      client, guildId, channel, track
    );
    const payload = await buildNowPlayingPayload(
      client, guildId, player, track, mediaUrl, null
    );
    if (!payload) return;

    const editPayload: any = {
      components: [payload.container],
      flags: MessageFlags.IsComponentsV2,
    };

    await msg.edit(editPayload).catch(() => {
      deleteAndSendNowPlaying(client, guildId).catch(() => {});
    });
  } else {
    await deleteAndSendNowPlaying(client, guildId);
  }
}
