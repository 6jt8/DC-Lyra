import { config } from "../config.js";

export default (client: any, oldState: any, newState: any) => {
  if (newState.member?.id !== client.user?.id) return;
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
  }
};
