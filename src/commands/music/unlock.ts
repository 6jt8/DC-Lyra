import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { checkVoiceChannel } from '../../utils/voiceChannel.js';
import { sendSuccessResponse, handleCommandError, safeDeferReply } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';
import { setQueueLock } from './lock.js';

const data = new SlashCommandBuilder()
  .setName("unlock")
  .setDescription("Unlock the queue so others can add songs")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.unlock;

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

            setQueueLock(interaction.guildId, false);

            return await sendSuccessResponse(
                interaction,
                t.success.title + '\n\n' +
                t.success.message + '\n' +
                t.success.note
            );

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { unlock: { errors: {} } } }));
            const t = lang.music?.unlock?.errors || {};

            return await handleCommandError(
                interaction,
                error,
                'unlock',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while unlocking the queue.\nPlease try again later.')
            );
        }
    }
};
