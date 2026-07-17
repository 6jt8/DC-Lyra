import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { checkVoiceChannel } from '../../utils/voiceChannel.js';
import { getLavalinkManager } from '../../music/lavalink.js';
import { sendSuccessResponse, sendErrorResponse, handleCommandError, safeDeferReply, buildPaleCard, sanitizeTitle } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';
import { getEmoji } from '../../emoji/emoji.js';
import { createPlayerForGuild } from '../../music/player-connection.js';

const data = new SlashCommandBuilder()
  .setName("join")
  .setDescription("Make the bot join your voice channel");

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.join;

            const player = client.riffy.players.get(interaction.guildId);

            if (player && !player.destroyed && player.connected) {
                const card = buildPaleCard(
                    `${getEmoji('info')} ${sanitizeTitle(t.alreadyConnected?.title || '## Already Connected', 'Already Connected')}`,
                    [
                        `### ${getEmoji('info')} ${t.alreadyConnected?.message || 'Info'}\n` +
                        (t.alreadyConnected?.note || 'The bot is already in a voice channel.')
                    ]
                );
                const reply = await interaction.editReply({
                    components: [card],
                    flags: MessageFlags.IsComponentsV2,
                    fetchReply: true
                });
                setTimeout(() => reply.delete().catch(() => {}), 5000);
                return reply;
            }

            const voiceCheck = await checkVoiceChannel(interaction, player);

            if (!voiceCheck.allowed) {
                const reply = await interaction.editReply({
                    ...voiceCheck.response,
                    fetchReply: true
                });
                setTimeout(() => reply.delete().catch(() => {}), 5000);
                return reply;
            }

            const nodeManager = getLavalinkManager();
            if (!nodeManager) {
                return sendErrorResponse(
                    interaction,
                    t.nodeManagerError?.title + '\n\n' +
                    t.nodeManagerError?.message + '\n' +
                    t.nodeManagerError?.note,
                    5000
                );
            }

            try {
                await nodeManager.ensureNodeAvailable();
            } catch (error) {
                const available = nodeManager.getAvailableNodeIds();
                if (available.length === 0) {
                    await nodeManager.reconnectNodesNow?.(5000).catch(() => {});
                }
                const retryAvailable = nodeManager.getAvailableNodeIds();
                if (retryAvailable.length === 0) {
                    return sendErrorResponse(
                        interaction,
                        t.noNodes?.title + '\n\n' +
                        t.noNodes?.message + '\n' +
                        t.noNodes?.note,
                        5000
                    );
                }
            }

            const userVoiceChannel = interaction.member.voice.channelId;

            await createPlayerForGuild(
                client,
                interaction.guildId,
                userVoiceChannel,
                interaction.channelId
            );

            const card = buildPaleCard(
                `${getEmoji('play')} ${sanitizeTitle(t.success?.title || '## 👋 Joined Voice Channel', 'Joined')}`,
                [
                    `### ${getEmoji('success')} ${t.success?.message || 'Joined'}\n` +
                    (t.success?.note || 'Use `/play` to start playing music.')
                ]
            );

            const reply = await interaction.editReply({
                components: [card],
                flags: MessageFlags.IsComponentsV2,
                fetchReply: true
            });
            setTimeout(() => reply.delete().catch(() => {}), 5000);
            return reply;

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { join: { errors: {} } } }));
            const t = lang.music?.join?.errors || {};

            return await handleCommandError(
                interaction,
                error,
                'join',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while joining the voice channel.\nPlease try again later.')
            );
        }
    }
};
