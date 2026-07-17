import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { checkVoiceChannel } from '../../utils/voiceChannel.js';
import { sendSuccessResponse, handleCommandError, safeDeferReply } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';

const queueLocks = new Map<string, boolean>();

export function isQueueLocked(guildId: string): boolean {
    return queueLocks.get(guildId) === true;
}

export function setQueueLock(guildId: string, locked: boolean): void {
    queueLocks.set(guildId, locked);
}

const data = new SlashCommandBuilder()
  .setName("lock")
  .setDescription("Lock the queue so others cannot add songs")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.lock;

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

            setQueueLock(interaction.guildId, true);

            return await sendSuccessResponse(
                interaction,
                t.success.title + '\n\n' +
                t.success.message + '\n' +
                t.success.note
            );

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { lock: { errors: {} } } }));
            const t = lang.music?.lock?.errors || {};

            return await handleCommandError(
                interaction,
                error,
                'lock',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while locking the queue.\nPlease try again later.')
            );
        }
    }
};
