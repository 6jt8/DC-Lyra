import { SlashCommandBuilder } from 'discord.js';
import { sendSuccessResponse, handleCommandError, safeDeferReply } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';
import { getLavalinkManager } from '../../music/lavalink.js';
import { createPlayerForGuild } from '../../music/player-connection.js';

const data = new SlashCommandBuilder()
  .setName("summon")
  .setDescription("Summon the bot to your voice channel");

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.summon;

            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) {
                return await handleCommandError(
                    interaction,
                    new Error('No voice channel'),
                    'summon',
                    (t.errors?.noVoice?.title || '## ❌ No Voice Channel') + '\n\n' +
                    (t.errors?.noVoice?.message || 'You need to be in a voice channel to summon the bot.')
                );
            }

            const lavalink = getLavalinkManager();
            if (!lavalink) {
                return await handleCommandError(
                    interaction,
                    new Error('Lavalink manager not available'),
                    'summon',
                    (t.errors?.nodeManager?.title || '## ❌ Lavalink Error') + '\n\n' +
                    (t.errors?.nodeManager?.message || 'Lavalink node manager is not initialized.')
                );
            }

            const existingPlayer = client.riffy.players.get(interaction.guildId);
            if (existingPlayer && !existingPlayer.destroyed) {
                if (existingPlayer.voiceChannel === voiceChannel.id) {
                    return await handleCommandError(
                        interaction,
                        new Error('Already connected'),
                        'summon',
                        (t.errors?.alreadyConnected?.title || '## ℹ️ Already Connected') + '\n\n' +
                        (t.errors?.alreadyConnected?.message || 'I am already in your voice channel.')
                    );
                }
                existingPlayer.destroy();
            }

            const player = await createPlayerForGuild(
                client,
                interaction.guildId,
                voiceChannel.id,
                interaction.channelId
            );

            if (!player) {
                return await handleCommandError(
                    interaction,
                    new Error('Failed to create player'),
                    'summon',
                    (t.errors?.createFailed?.title || '## ❌ Connection Failed') + '\n\n' +
                    (t.errors?.createFailed?.message || 'Failed to connect to the voice channel.')
                );
            }

            return await sendSuccessResponse(
                interaction,
                t.success.title + '\n\n' +
                t.success.message.replace('{channel}', voiceChannel.name) + '\n' +
                t.success.note
            );

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { summon: { errors: {} } } }));
            const t = lang.music?.summon?.errors || {};

            return await handleCommandError(
                interaction,
                error,
                'summon',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while summoning the bot.\nPlease try again later.')
            );
        }
    }
};
