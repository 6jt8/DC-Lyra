import { MessageFlags } from "discord.js";
import { requesters } from "./player-store.js";
import {
  nowPlayingMessages,
  guildTrackMessages,
  guildActiveFilter,
  getCommandMentionMap,
} from "./player-store.js";
import {
  clearTrackMediaCache,
  sendMessageWithPermissionsCheck,
} from "./player-ui.js";
import { stopCollector } from "./player-store.js";
import { restartCollector } from "./player-interaction.js";
import { deletePlayerSession } from "../database/player-sessions.js";
import { config } from "../config.js";
import { deleteMessageIfExists, getTextChannel } from "./player-message-utils.js";
import {
  buildNowPlayingPayload,
  clearProgressUpdates,
  resolveMediaForGuild,
} from "./player-lifecycle.js";

export async function cleanupTrackMessages(
  client: any,
  player: any
): Promise<void> {
  const guildId = player.guildId;
  clearTrackMediaCache(guildId);
  stopCollector(guildId);
  clearProgressUpdates(guildId);

  const messages = guildTrackMessages.get(guildId) || [];

  for (const messageInfo of messages) {
    try {
      const fetchChannel =
        client.channels.cache.get(messageInfo.channelId) ||
        (await getTextChannel(client, messageInfo.channelId));

      if (fetchChannel) {
        await deleteMessageIfExists(fetchChannel, messageInfo.messageId);
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
    await oldMsg.delete().catch((e: any) => console.warn("[PLAYER] Failed to delete old now-playing:", e?.message));
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

