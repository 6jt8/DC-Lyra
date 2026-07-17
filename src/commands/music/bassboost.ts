import { SlashCommandBuilder } from 'discord.js';
import { checkVoiceChannel } from '../../utils/voiceChannel.js';
import { sendSuccessResponse, handleCommandError, safeDeferReply } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';

const data = new SlashCommandBuilder()
  .setName("bassboost")
  .setDescription("Set the bass boost level")
  .addStringOption(option =>
    option.setName("level")
      .setDescription("Bass boost level")
      .setRequired(true)
      .addChoices(
        { name: 'Off', value: 'none' },
        { name: 'Low', value: 'low' },
        { name: 'Medium', value: 'medium' },
        { name: 'High', value: 'high' },
        { name: 'Extreme', value: 'extreme' }
      )
  );

const BOOST_VALUES: Record<string, number> = {
  none: 0,
  low: 0.5,
  medium: 1.5,
  high: 3,
  extreme: 5
};

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.bassboost;

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
                    'bassboost',
                    (t.errors?.title || '## ❌ Error') + '\n\n' + (t.errors?.message || 'Player is not available.')
                );
            }

            const level = interaction.options.getString('level') as string;
            const boostValue = BOOST_VALUES[level];

            if (level === 'none') {
                player.filters.clearFilters();
            } else {
                player.filters.setBassboost(true, { value: boostValue });
            }

            return await sendSuccessResponse(
                interaction,
                t.success.title + '\n\n' +
                t.success.level.replace('{level}', level.charAt(0).toUpperCase() + level.slice(1)) + '\n\n' +
                t.success.message
            );

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { bassboost: { errors: {} } } }));
            const t = lang.music?.bassboost?.errors || {};

            return await handleCommandError(
                interaction,
                error,
                'bassboost',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while setting bass boost.\nPlease try again later.')
            );
        }
    }
};
