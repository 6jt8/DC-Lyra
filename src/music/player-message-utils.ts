import { getLangSync } from "../utils/language.js";
import { guildTrackMessages } from "./player-store.js";

export async function getTextChannel(
  client: any,
  channelId: string | undefined
): Promise<any> {
  if (!channelId || !client?.channels) return null;

  const cached = client.channels.cache.get(channelId);
  if (cached) return cached;

  return client.channels.fetch(channelId).catch(() => null);
}

export async function deleteMessageIfExists(
  channel: any,
  messageId: string | undefined
): Promise<void> {
  if (!channel || !messageId) return;

  const message = await channel.messages.fetch(messageId).catch(() => null);
  if (message) {
    await message.delete().catch(() => {});
  }
}

export async function cleanupPreviousTrackMessages(
  channel: any,
  guildId: string
): Promise<void> {
  const messages = guildTrackMessages.get(guildId) || [];

  for (const messageInfo of messages) {
    try {
      const client = channel?.client;
      const fetchChannel =
        client?.channels?.cache?.get(messageInfo.channelId) ||
        (await getTextChannel(client, messageInfo.channelId));

      if (fetchChannel) {
        await deleteMessageIfExists(fetchChannel, messageInfo.messageId);
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
