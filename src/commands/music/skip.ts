import { SlashCommandBuilder } from 'discord.js';
import { checkVoiceChannel } from '../../utils/voiceChannel.js';
import { sendSuccessResponse, handleCommandError, safeDeferReply } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';
import { cleanupTrackMessages } from '../../music/player-cleanup.js';

const data = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("Skip the current song");

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.skip;

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

            await cleanupTrackMessages(client, player);
            player.stop();

            return await sendSuccessResponse(
                interaction,
                t.success.title + '\n\n' +
                t.success.message + '\n' +
                (player.queue.length > 0 ? t.success.nextSong : t.success.queueEmpty)
            );

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { skip: { errors: {} } } }));
            const t = lang.music?.skip?.errors || {};
            
            return await handleCommandError(
                interaction,
                error,
                'skip',
                (t.title || '## ? Error') + '\n\n' + (t.message || 'An error occurred while skipping the song.\nPlease try again later.')
            );
        }
    }
};
