import { SlashCommandBuilder } from 'discord.js';
import { checkVoiceChannel } from '../../utils/voiceChannel.js';
import { sendSuccessResponse, handleCommandError, safeDeferReply } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';

const data = new SlashCommandBuilder()
  .setName("clear")
  .setDescription("Clear the entire queue");

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            
            const lang = await getLang(interaction.guildId);
            const t = lang.music.clear;

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

            
            if (!player || (player && player.destroyed)) {
                return await handleCommandError(
                    interaction,
                    new Error('Player not available'),
                    'clear',
                    (t.errors?.title || '## ❌ Error') + '\n\n' + (t.errors?.message || 'Player is not available. Please start playing a song first.')
                );
            }

            
            if (player.queue.length === 0) {
                return await sendSuccessResponse(
                    interaction,
                    '## 📄 Queue Already Empty\n\n' +
                    'The queue is already empty.\n' +
                    'Use `/play` to add songs to the queue.'
                );
            }

            
            const queueSize = player.queue.length;

            
            player.queue.clear();

            return await sendSuccessResponse(
                interaction,
                t.success.title + '\n\n' +
                t.success.message.replace('{count}', queueSize) + '\n' +
                t.success.note
            );

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { clear: { errors: {} } } }));
            const t = lang.music?.clear?.errors || {};
            
            return await handleCommandError(
                interaction,
                error,
                'clear',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while clearing the queue.\nPlease try again later.')
            );
        }
    }
};
