import { SlashCommandBuilder } from 'discord.js';
import { checkVoiceChannel } from '../../utils/voiceChannel.js';
import { sendErrorResponse, sendSuccessResponse, handleCommandError, safeDeferReply } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';

const data = new SlashCommandBuilder()
  .setName("speed")
  .setDescription("Change the playback speed of the current track")
  .addNumberOption(option =>
    option.setName("speed")
      .setDescription("Playback speed (0.5x - 3.0x, default: 1.0)")
      .setRequired(true)
      .setMinValue(0.5)
      .setMaxValue(3.0)
  );

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.speed;

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
                    'speed',
                    (t.errors?.title || '## ❌ Error') + '\n\n' + (t.errors?.message || 'Player is not available.')
                );
            }

            const speed = interaction.options.getNumber('speed') as number;

            if (speed < 0.5 || speed > 3.0) {
                return await sendErrorResponse(
                    interaction,
                    t.invalid.title + '\n\n' +
                    t.invalid.message + '\n' +
                    t.invalid.note
                );
            }

            if (Math.abs(speed - 1.0) < 0.01) {
                player.filters.setTimescale(false);
            } else {
                player.filters.setTimescale(true, { speed, pitch: speed, rate: 1.0 });
            }

            return await sendSuccessResponse(
                interaction,
                t.success.title + '\n\n' +
                t.success.message.replace('{speed}', speed.toFixed(1)) + 'x\n' +
                t.success.note
            );

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { speed: { errors: {} } } }));
            const t = lang.music?.speed?.errors || {};

            return await handleCommandError(
                interaction,
                error,
                'speed',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while changing the speed.\nPlease try again later.')
            );
        }
    }
};
