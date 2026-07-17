import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { checkVoiceChannel } from "../../utils/voiceChannel.js";
import { sendErrorResponse, handleCommandError, safeDeferReply, buildPaleCard, sanitizeTitle } from "../../ui/responseHandler.js";
import { getLang } from "../../utils/language.js";
import { getEmoji } from "../../emoji/emoji.js";
import { previousTrackMap, requesters } from "../../music/player-store.js";
import { createPlayerForGuild, destroyPlayerIfDifferentChannel, playWithRetries } from "../../music/player-connection.js";

const data = new SlashCommandBuilder()
  .setName("previous")
  .setDescription("Play the previous track again");

export default {
  data: data,
  run: async (client: any, interaction: any) => {
    try {
      const deferred = await safeDeferReply(interaction);
      if (!deferred && !interaction.deferred && !interaction.replied) return;
      const lang = await getLang(interaction.guildId);
      const t = lang.music.previous;

      const guildId = interaction.guildId;
      const previousTrack = previousTrackMap.get(guildId);
      if (!previousTrack?.info) {
        return sendErrorResponse(
          interaction,
          t.noPrevious.title + "\n\n" +
          t.noPrevious.message + "\n" +
          t.noPrevious.note,
          5000
        );
      }

      const existingPlayer = client.riffy.players.get(guildId);
      const voiceCheck = await checkVoiceChannel(interaction, existingPlayer);
      if (!voiceCheck.allowed) {
        const reply = await interaction.editReply(voiceCheck.response);
        setTimeout(() => reply.delete().catch(() => {}), 5000);
        return reply;
      }

      const userVoiceChannel = interaction.member.voice.channelId;

      await destroyPlayerIfDifferentChannel(client, existingPlayer, userVoiceChannel);

      const player = await createPlayerForGuild(
        client,
        guildId,
        userVoiceChannel,
        interaction.channelId
      );

      previousTrack.info.requester = interaction.user.username;
      player.queue.add(previousTrack);
      requesters.set(previousTrack.info.uri, interaction.user.username);

      await playWithRetries(
        player, client, guildId,
        userVoiceChannel, interaction.channelId
      );

      const container = buildPaleCard(
        `${getEmoji("music")} ${sanitizeTitle(t.success.title, "Previous")}`,
        [
          `### ${getEmoji("music")} ${t.success.message}`,
          `[${sanitizeTitle(previousTrack.info.title)}](${previousTrack.info.uri})`
        ]
      );

      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      }).then((msg: any) => setTimeout(() => msg.delete().catch(() => {}), 3000));

    } catch (error) {
      const lang = await getLang(interaction.guildId).catch(() => ({ music: { previous: { errors: {} } } }));
      const t = lang.music?.previous?.errors || {};

      return handleCommandError(
        interaction,
        error,
        "previous",
        (t.title || "## ❌ Error") + "\n\n" + (t.message || "An error occurred while playing the previous track.\nPlease try again later.")
      );
    }
  },
};
