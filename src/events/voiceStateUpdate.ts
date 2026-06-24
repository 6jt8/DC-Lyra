import { config } from "../config.js";

const disconnectTimers = new Map<string, any>();

function getDisconnectTimeoutMs(): number {
  return Number(process.env.AUTO_LEAVE_TIMEOUT) || 30000;
}

function getNonBotMembers(channel: any): number {
  if (!channel || !channel.members) return 0;
  return channel.members.filter((m: any) => !m.user?.bot).size;
}

function clearDisconnectTimer(guildId: string): void {
  const timer = disconnectTimers.get(guildId);
  if (timer) {
    clearTimeout(timer);
    disconnectTimers.delete(guildId);
  }
}

async function checkAloneAndDisconnect(
  client: any,
  guildId: string
): Promise<void> {
  const player = client.riffy?.players?.get(guildId);
  if (!player || player.destroyed) return;
  if (!player.voiceChannel) return;

  const channel = client.channels.cache.get(player.voiceChannel);
  if (!channel) return;

  const nonBotCount = getNonBotMembers(channel);

  if (nonBotCount === 0 && !disconnectTimers.has(guildId)) {
    const timeout = getDisconnectTimeoutMs();
    const timer = setTimeout(async () => {
      const currentPlayer = client.riffy?.players?.get(guildId);
      if (!currentPlayer || currentPlayer.destroyed) {
        disconnectTimers.delete(guildId);
        return;
      }
      const currentChannel = client.channels.cache.get(currentPlayer.voiceChannel);
      if (!currentChannel || getNonBotMembers(currentChannel) === 0) {
        if (config.voiceDebug) {
          console.log(`[ VOICE DEBUG ] Auto-leaving guild ${guildId} - no users in channel`);
        }
        await client.statusManager?.onPlayerDisconnect(guildId).catch(() => {});
        currentPlayer.destroy();
      }
      disconnectTimers.delete(guildId);
    }, timeout).unref();
    disconnectTimers.set(guildId, timer);

    if (config.voiceDebug) {
      console.log(`[ VOICE DEBUG ] Starting auto-leave timer for guild ${guildId} (${timeout}ms)`);
    }
  } else if (nonBotCount > 0 && disconnectTimers.has(guildId)) {
    clearDisconnectTimer(guildId);
    if (config.voiceDebug) {
      console.log(`[ VOICE DEBUG ] Cancelled auto-leave timer for guild ${guildId} - users present`);
    }
  }
}

export default (client: any, oldState: any, newState: any) => {
  if (newState.member?.id !== client.user?.id) {
    const guildId = newState.guild?.id || oldState.guild?.id;
    if (guildId && client.riffy?.players?.get(guildId)) {
      const player = client.riffy.players.get(guildId);
      if (player && !player.destroyed && player.voiceChannel) {
        checkAloneAndDisconnect(client, guildId).catch(() => {});
      }
    }
    return;
  }

  const guildId = newState.guild?.id;
  if (!guildId) return;
  const player = client.riffy?.players?.get(guildId);
  if (!player || player.destroyed) return;
  const newChannelId = newState.channelId;
  if (newChannelId && newChannelId !== player.voiceChannel) {
    player.voiceChannel = newChannelId;
    if (config.voiceDebug) {
      console.log(`[ VOICE DEBUG ] Bot moved to channel ${newChannelId} in guild ${guildId}`);
    }
  }
  if (!newChannelId && player.voiceChannel) {
    if (config.voiceDebug) {
      console.log(`[ VOICE DEBUG ] Bot disconnected from voice in guild ${guildId}`);
    }
    clearDisconnectTimer(guildId);
  }
};
