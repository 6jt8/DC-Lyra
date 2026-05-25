import { MessageFlags } from "discord.js";
import { getLang } from "./language.js";
import { cardFromMessage } from "../ui/responseHandler.js";

export async function checkVoiceChannel(
  interaction: any,
  player: any
): Promise<{ allowed: boolean; response?: any }> {
  const lang = await getLang(interaction.guildId).catch(() => ({ utils: {} }));

  const utils = lang?.utils || {};
  const voiceCheck = utils?.voiceChannelCheck || {
    noVoiceChannel: {
      title: "## ❌ No Voice Channel",
      message:
        "You need to be in a voice channel to use this command.",
      note: "Please join a voice channel and try again.",
    },
    wrongChannel: {
      title: "## 🎵 Join Voice Channel",
      message:
        "The bot is currently active in **{channelName}**.",
      note: "Please join **{channelName}** to use music commands.",
    },
  };

  if (!interaction.member.voice.channelId) {
    const errorContainer = cardFromMessage(
      `${voiceCheck.noVoiceChannel.title}\n\n` +
        `${voiceCheck.noVoiceChannel.message}\n` +
        `${voiceCheck.noVoiceChannel.note}`,
      "Voice Channel Required"
    );
    return {
      allowed: false,
      response: {
        components: [errorContainer],
        flags:
          MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      },
    };
  }

  if (
    player &&
    player.voiceChannel &&
    interaction.member.voice.channelId !== player.voiceChannel
  ) {
    const botChannel = interaction.guild.channels.cache.get(
      player.voiceChannel
    );
    const channelName = botChannel
      ? botChannel.name
      : "the bot's voice channel";

    const errorContainer = cardFromMessage(
      `${voiceCheck.wrongChannel.title}\n\n` +
        `${voiceCheck.wrongChannel.message.replace(
          "{channelName}",
          channelName
        )}\n\n` +
        `${voiceCheck.wrongChannel.note.replace(
          "{channelName}",
          channelName
        )}`,
      "Join Correct Voice Channel"
    );
    return {
      allowed: false,
      response: {
        components: [errorContainer],
        flags:
          MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      },
    };
  }

  return { allowed: true };
}
