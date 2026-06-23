import { config } from "../config.js";

export default async (client: any, channel: any) => {
  if (channel.type !== 2) return;
  const guildId = channel.guild?.id;
  if (!guildId) return;
  const player = client.riffy?.players?.get(guildId);
  if (!player || player.destroyed) return;
  if (player.voiceChannel === channel.id) {
    if (config.voiceDebug) {
      console.log(`[ VOICE DEBUG ] Voice channel deleted in guild ${guildId}, cleaning up player`);
    }
    player.destroy();
  }
};
