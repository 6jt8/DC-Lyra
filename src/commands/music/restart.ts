import { SlashCommandBuilder } from 'discord.js';
import { sendSuccessResponse, handleCommandError } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';
import { checkCurrentTrack } from '../../utils/playerValidation.js';
import { deferOrReturn, replyWithValidation, replyWithVoiceCheck } from '../../utils/music-command-helpers.js';

const data = new SlashCommandBuilder()
  .setName("restart")
  .setDescription("Restart the current track from the beginning");

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            if (!await deferOrReturn(interaction)) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.restart;

            const player = client.riffy.players.get(interaction.guildId);
            const voiceReply = await replyWithVoiceCheck(client, interaction, player);
            if (voiceReply) return voiceReply;

            const trackCheck = await checkCurrentTrack(player, null, interaction.guildId);
            const validationReply = await replyWithValidation(interaction, trackCheck);
            if (validationReply) return validationReply;

            if (!player.current.info.isSeekable) {
                return await handleCommandError(
                    interaction,
                    new Error('Track not seekable'),
                    'restart',
                    (t.errors?.notSeekable?.title || '## ❌ Cannot Restart') + '\n\n' +
                    (t.errors?.notSeekable?.message || 'This track does not support restarting from the beginning.')
                );
            }

            player.seek(0);

            return await sendSuccessResponse(
                interaction,
                t.success.title + '\n\n' +
                t.success.message.replace('{title}', player.current.info.title) + '\n' +
                t.success.note
            );

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { restart: { errors: {} } } }));
            const t = lang.music?.restart?.errors || {};

            return await handleCommandError(
                interaction,
                error,
                'restart',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while restarting the track.\nPlease try again later.')
            );
        }
    }
};
