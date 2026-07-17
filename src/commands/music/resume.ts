import { SlashCommandBuilder } from 'discord.js';
import { checkVoiceChannel } from '../../utils/voiceChannel.js';
import { sendSuccessResponse, handleCommandError, safeDeferReply } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';

const data = new SlashCommandBuilder()
  .setName("resume")
  .setDescription("Resume the current song");

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.resume;

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
                    'resume',
                    (t.errors?.title || '## ❌ Error') + '\n\n' + (t.errors?.message || 'Player is not available. Please start playing a song first.')
                );
            }

            if (!player.paused) {
                return await sendSuccessResponse(
                    interaction,
                    '## ▶️ Already Playing\n\n' +
                    'The music is already playing.\n' +
                    'Use `/pause` to pause playback.'
                );
            }

            try {
                player.pause(false);
            } catch (resumeError) {
                console.warn(`[ RESUME ] Error resuming player: ${(resumeError as Error).message}`);
            }

            return await sendSuccessResponse(
                interaction,
                t.success.title + '\n\n' +
                t.success.message + '\n' +
                t.success.note
            );

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { resume: { errors: {} } } }));
            const t = lang.music?.resume?.errors || {};
            
            return await handleCommandError(
                interaction,
                error,
                'resume',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while resuming the music.\nPlease try again later.')
            );
        }
    }
};
