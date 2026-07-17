import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { sendSuccessResponse, handleCommandError } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';
import { cleanupTrackMessages } from '../../music/player-cleanup.js';
import { deferOrReturn, replyWithVoiceCheck } from '../../utils/music-command-helpers.js';

const data = new SlashCommandBuilder()
  .setName("forceskip")
  .setDescription("Force skip the current song (admin only)")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            if (!await deferOrReturn(interaction)) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.forceskip;

            const player = client.riffy.players.get(interaction.guildId);
            const voiceReply = await replyWithVoiceCheck(client, interaction, player);
            if (voiceReply) return voiceReply;

            if (!player || !player.current || player.destroyed) {
                return await handleCommandError(
                    interaction,
                    new Error('No track playing'),
                    'forceskip',
                    (t.errors?.title || '## ❌ Error') + '\n\n' + (t.errors?.message || 'No song is currently playing.')
                );
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
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { forceskip: { errors: {} } } }));
            const t = lang.music?.forceskip?.errors || {};

            return await handleCommandError(
                interaction,
                error,
                'forceskip',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while force skipping.\nPlease try again later.')
            );
        }
    }
};
