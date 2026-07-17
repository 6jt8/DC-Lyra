import { SlashCommandBuilder } from 'discord.js';
import { checkVoiceChannel } from '../../utils/voiceChannel.js';
import { sendErrorResponse, sendSuccessResponse, handleCommandError, safeDeferReply } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';

const data = new SlashCommandBuilder()
  .setName("equalizer")
  .setDescription("Adjust the audio equalizer with presets or custom bands")
  .addStringOption(option =>
    option.setName("preset")
      .setDescription("EQ preset to apply")
      .setRequired(true)
      .addChoices(
        { name: 'Flat (Reset)', value: 'flat' },
        { name: 'Bass Boost', value: 'bass' },
        { name: 'Treble Boost', value: 'treble' },
        { name: 'Rock', value: 'rock' },
        { name: 'Pop', value: 'pop' },
        { name: 'Jazz', value: 'jazz' },
        { name: 'Classical', value: 'classical' },
        { name: 'Electronic', value: 'electronic' },
        { name: 'Full Bass', value: 'fullbass' },
        { name: 'Full Treble', value: 'fulltreble' },
        { name: 'Headphones', value: 'headphones' }
      )
  );

const EQ_PRESETS: Record<string, { band: number; gain: number }[]> = {
  flat: [],
  bass: [
    { band: 0, gain: 0.6 }, { band: 1, gain: 0.5 }, { band: 2, gain: 0.4 },
    { band: 3, gain: 0.2 }, { band: 4, gain: 0.1 }
  ],
  treble: [
    { band: 8, gain: 0.3 }, { band: 9, gain: 0.4 }, { band: 10, gain: 0.5 },
    { band: 11, gain: 0.6 }, { band: 12, gain: 0.7 }, { band: 13, gain: 0.6 },
    { band: 14, gain: 0.5 }
  ],
  rock: [
    { band: 0, gain: 0.3 }, { band: 1, gain: 0.2 }, { band: 2, gain: 0.1 },
    { band: 3, gain: 0.05 }, { band: 4, gain: 0.0 }, { band: 5, gain: -0.05 },
    { band: 6, gain: -0.1 }, { band: 7, gain: -0.1 }, { band: 8, gain: 0.1 },
    { band: 9, gain: 0.2 }, { band: 10, gain: 0.3 }, { band: 11, gain: 0.4 },
    { band: 12, gain: 0.5 }, { band: 13, gain: 0.6 }, { band: 14, gain: 0.7 }
  ],
  pop: [
    { band: 0, gain: -0.1 }, { band: 1, gain: 0.15 }, { band: 2, gain: 0.2 },
    { band: 3, gain: 0.1 }, { band: 4, gain: -0.1 }, { band: 5, gain: -0.2 },
    { band: 6, gain: -0.1 }, { band: 7, gain: 0.1 }, { band: 8, gain: 0.2 },
    { band: 9, gain: 0.3 }, { band: 10, gain: 0.4 }, { band: 11, gain: 0.3 },
    { band: 12, gain: 0.2 }, { band: 13, gain: 0.1 }, { band: 14, gain: 0.0 }
  ],
  jazz: [
    { band: 0, gain: 0.2 }, { band: 1, gain: 0.15 }, { band: 2, gain: 0.1 },
    { band: 3, gain: 0.05 }, { band: 4, gain: 0.0 }, { band: 5, gain: 0.05 },
    { band: 6, gain: 0.1 }, { band: 7, gain: 0.15 }, { band: 8, gain: 0.2 },
    { band: 9, gain: 0.15 }, { band: 10, gain: 0.1 }, { band: 11, gain: 0.05 },
    { band: 12, gain: 0.0 }, { band: 13, gain: -0.05 }, { band: 14, gain: -0.1 }
  ],
  classical: [
    { band: 0, gain: 0.3 }, { band: 1, gain: 0.2 }, { band: 2, gain: 0.1 },
    { band: 3, gain: 0.0 }, { band: 4, gain: -0.1 }, { band: 5, gain: -0.1 },
    { band: 6, gain: -0.1 }, { band: 7, gain: 0.0 }, { band: 8, gain: 0.1 },
    { band: 9, gain: 0.2 }, { band: 10, gain: 0.3 }, { band: 11, gain: 0.4 },
    { band: 12, gain: 0.5 }, { band: 13, gain: 0.6 }, { band: 14, gain: 0.7 }
  ],
  electronic: [
    { band: 0, gain: 0.4 }, { band: 1, gain: 0.3 }, { band: 2, gain: 0.2 },
    { band: 3, gain: 0.1 }, { band: 4, gain: 0.0 }, { band: 5, gain: -0.1 },
    { band: 6, gain: -0.2 }, { band: 7, gain: -0.1 }, { band: 8, gain: 0.1 },
    { band: 9, gain: 0.2 }, { band: 10, gain: 0.3 }, { band: 11, gain: 0.4 },
    { band: 12, gain: 0.5 }, { band: 13, gain: 0.6 }, { band: 14, gain: 0.7 }
  ],
  fullbass: [
    { band: 0, gain: 0.8 }, { band: 1, gain: 0.7 }, { band: 2, gain: 0.6 },
    { band: 3, gain: 0.5 }, { band: 4, gain: 0.4 }, { band: 5, gain: 0.3 },
    { band: 6, gain: 0.2 }, { band: 7, gain: 0.1 }
  ],
  fulltreble: [
    { band: 8, gain: 0.3 }, { band: 9, gain: 0.5 }, { band: 10, gain: 0.7 },
    { band: 11, gain: 0.8 }, { band: 12, gain: 0.9 }, { band: 13, gain: 0.8 },
    { band: 14, gain: 0.7 }
  ],
  headphones: [
    { band: 0, gain: 0.3 }, { band: 1, gain: 0.2 }, { band: 2, gain: 0.1 },
    { band: 3, gain: 0.05 }, { band: 4, gain: 0.0 }, { band: 5, gain: -0.05 },
    { band: 6, gain: -0.1 }, { band: 7, gain: 0.0 }, { band: 8, gain: 0.05 },
    { band: 9, gain: 0.1 }, { band: 10, gain: 0.2 }, { band: 11, gain: 0.3 },
    { band: 12, gain: 0.4 }, { band: 13, gain: 0.5 }, { band: 14, gain: 0.6 }
  ]
};

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.equalizer;

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
                    'equalizer',
                    (t.errors?.title || '## ❌ Error') + '\n\n' + (t.errors?.message || 'Player is not available.')
                );
            }

            const preset = interaction.options.getString('preset') as string;
            const bands = EQ_PRESETS[preset] || [];

            if (bands.length === 0) {
                player.filters.clearFilters();
            } else {
                player.filters.setEqualizer(true, { bands });
            }

            return await sendSuccessResponse(
                interaction,
                t.success.title + '\n\n' +
                t.success.preset.replace('{preset}', preset.charAt(0).toUpperCase() + preset.slice(1)) + '\n\n' +
                t.success.message
            );

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { equalizer: { errors: {} } } }));
            const t = lang.music?.equalizer?.errors || {};

            return await handleCommandError(
                interaction,
                error,
                'equalizer',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while setting the equalizer.\nPlease try again later.')
            );
        }
    }
};
