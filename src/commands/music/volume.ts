import { SlashCommandBuilder } from 'discord.js';
import { checkVoiceChannel } from '../../utils/voiceChannel.js';
import { sendErrorResponse, sendSuccessResponse, handleCommandError, safeDeferReply } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';

const data = new SlashCommandBuilder()
  .setName("volume")
  .setDescription("Set the volume of the current song")
  .addIntegerOption(option =>
    option.setName("level")
      .setDescription("Volume level (0-100)")
      .setRequired(true)
      .setMinValue(0)
      .setMaxValue(100)
  );

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.volume;

            const player = client.riffy.players.get(interaction.guildId);
            const volume = interaction.options.getInteger('level');
            const check = await checkVoiceChannel(interaction, player);
            
            if (!check.allowed) {
                const reply = await interaction.editReply({
                    ...check.response,
                    fetchReply: true
                });
                setTimeout(() => reply.delete().catch(() => {}), 5000);
                return reply;
            }

            if (volume < 0 || volume > 100) {
                return await sendErrorResponse(
                    interaction,
                    t.invalid.title + '\n\n' +
                    t.invalid.message + '\n' +
                    t.invalid.note
                );
            }

            player.setVolume(volume);

            let volumeLevel;
            if (volume === 0) volumeLevel = t.success.muted;
            else if (volume < 30) volumeLevel = t.success.low;
            else if (volume < 70) volumeLevel = t.success.medium;
            else volumeLevel = t.success.high;

            return await sendSuccessResponse(
                interaction,
                t.success.title + '\n\n' +
                t.success.message.replace('{volume}', volume) + '\n\n' +
                volumeLevel
            );

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { volume: { errors: {} } } }));
            const t = lang.music?.volume?.errors || {};
            
            return await handleCommandError(
                interaction,
                error,
                'volume',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while setting the volume.\nPlease try again later.')
            );
        }
    }
};
