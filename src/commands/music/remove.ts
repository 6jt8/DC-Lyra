import { SlashCommandBuilder } from 'discord.js';
import { sendErrorResponse, sendSuccessResponse, handleCommandError } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';
import { checkQueue } from '../../utils/playerValidation.js';
import { deferOrReturn, replyWithValidation, replyWithVoiceCheck } from '../../utils/music-command-helpers.js';

const data = new SlashCommandBuilder()
  .setName("remove")
  .setDescription("Remove a song from the queue by its position")
  .addIntegerOption(option =>
    option.setName("position")
      .setDescription("Position of the song to remove from the queue")
      .setRequired(true)
  );

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            if (!await deferOrReturn(interaction)) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.remove;

            const position = interaction.options.getInteger('position');
            const player = client.riffy.players.get(interaction.guildId);
            const voiceReply = await replyWithVoiceCheck(client, interaction, player);
            if (voiceReply) return voiceReply;

            const queueCheck = await checkQueue(player, 
                t.queueEmpty.title + '\n\n' +
                t.queueEmpty.message + '\n' +
                t.queueEmpty.note,
                interaction.guildId
            );
            const validationReply = await replyWithValidation(interaction, queueCheck);
            if (validationReply) return validationReply;

            if (position < 1 || position > player.queue.length) {
                return await sendErrorResponse(
                    interaction,
                    t.invalidPosition.title + '\n\n' +
                    t.invalidPosition.message.replace('{max}', player.queue.length) + '\n' +
                    t.invalidPosition.note
                        .replace('{count}', player.queue.length)
                        .replace('{plural}', player.queue.length > 1 ? 's' : '')
                );
            }

            const removedTrack = player.queue[position - 1];
            player.queue.remove(position - 1, 1);

            return await sendSuccessResponse(
                interaction,
                t.success.title + '\n\n' +
                t.success.removed
                    .replace('{title}', removedTrack.info.title)
                    .replace('{uri}', removedTrack.info.uri) + '\n' +
                t.success.position.replace('{position}', position) + '\n\n' +
                t.success.message
            );

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { remove: { errors: {} } } }));
            const t = lang.music?.remove?.errors || {};
            
            return await handleCommandError(
                interaction,
                error,
                'remove',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while removing the song.\nPlease try again later.')
            );
        }
    }
};
