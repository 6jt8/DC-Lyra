import { SlashCommandBuilder } from 'discord.js';
import { sendSuccessResponse, handleCommandError } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';
import { cleanupTrackMessages } from '../../music/player-cleanup.js';
import { deferOrReturn, replyWithVoiceCheck } from '../../utils/music-command-helpers.js';

const data = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("Skip the current song");

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            if (!await deferOrReturn(interaction)) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.skip;

            const player = client.riffy.players.get(interaction.guildId);
            const voiceReply = await replyWithVoiceCheck(client, interaction, player);
            if (voiceReply) return voiceReply;

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
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while skipping the song.\nPlease try again later.')
            );
        }
    }
};
