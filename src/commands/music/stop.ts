import { SlashCommandBuilder } from 'discord.js';
import { getAutoplayCollection } from '../../database/database.js';
import { cleanupTrackMessages } from '../../music/player-cleanup.js';
import { checkVoiceChannel } from '../../utils/voiceChannel.js';
import { sendSuccessResponse, handleCommandError, safeDeferReply } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';

const data = new SlashCommandBuilder()
  .setName("stop")
  .setDescription("Stop the current song and destroy the player");

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.stop;

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

            const settings = await getAutoplayCollection()?.findOne({ guildId: interaction.guildId });
            const is24_7 = settings?.twentyfourseven;

            await cleanupTrackMessages(client, player);

            client.statusManager?.onPlayerDisconnect(interaction.guildId);

            player.queue.clear();
            
            player.stop();
            
            if (!is24_7) {
                player.destroy();
            }

            return await sendSuccessResponse(
                interaction,
                t.success.title + '\n\n' +
                (is24_7 ? t.success.message24_7 : t.success.messageNormal) + '\n' +
                t.success.note
            );

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { stop: { errors: {} } } }));
            const t = lang.music?.stop?.errors || {};
            
            return await handleCommandError(
                interaction,
                error,
                'stop',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while stopping the music.\nPlease try again later.')
            );
        }
    }
};
