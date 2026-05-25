import { SlashCommandBuilder } from 'discord.js';
import { checkVoiceChannel } from '../../utils/voiceChannel.js';
import { sendSuccessResponse, handleCommandError, safeDeferReply } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';

const data = new SlashCommandBuilder()
  .setName("loop")
  .setDescription("Set the loop mode for the current queue")
  .addStringOption(option =>
    option.setName("mode")
      .setDescription("Loop mode")
      .setRequired(true)
      .addChoices(
        { name: "Track", value: "track" },
        { name: "Queue", value: "queue" },
        { name: "Off", value: "off" }
      )
  );

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.loop;

            const mode = interaction.options.getString('mode');

            const player = client.riffy.players.get(interaction.guildId);
            const check = await checkVoiceChannel(interaction, player);

            if (!check.allowed) {
                const reply = await interaction.editReply({
                    ...check.response,
                    fetchReply: true
                });
                setTimeout(() => reply.delete().catch(() => {}), 5000);
                return reply;
            }

            if (!player || player.destroyed) {
                return await handleCommandError(
                    interaction,
                    new Error('Player not available'),
                    'loop',
                    (t.errors?.title || '## ❌ Error') + '\n\n' + (t.errors?.message || 'Player is not available. Please start playing a song first.')
                );
            }

            player.setLoop(mode === "off" ? "none" : mode);

            const content = mode === "track"
                ? t.track.title + '\n\n' + t.track.message + '\n' + t.track.note
                : mode === "queue"
                    ? t.queue.title + '\n\n' + t.queue.message + '\n' + t.queue.note
                    : t.off.title + '\n\n' + t.off.message + '\n' + t.off.note;

            return await sendSuccessResponse(interaction, content);

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { loop: { errors: {} } } }));
            const t = lang.music?.loop?.errors || {};

            return await handleCommandError(
                interaction,
                error,
                'loop',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while setting loop mode.\nPlease try again later.')
            );
        }
    }
};
