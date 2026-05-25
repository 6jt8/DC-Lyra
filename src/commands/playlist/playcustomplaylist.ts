import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { getPlaylistCollection } from '../../database/database.js';
import { getEmoji } from '../../emoji/emoji.js';
import { sendErrorResponse, handleCommandError, safeDeferReply, buildPaleCard, sanitizeTitle } from '../../ui/responseHandler.js';
import { checkVoiceChannel as checkVC } from '../../utils/voiceChannel.js';
import { getLavalinkManager } from '../../music/lavalink.js';
import { getLang } from '../../utils/language.js';
import { createPlayerForGuild, destroyPlayerIfDifferentChannel, playWithRetries } from '../../music/player-connection.js';

const data = new SlashCommandBuilder()
  .setName("playcustomplaylist")
  .setDescription("Play a custom playlist")
  .addStringOption(option =>
    option.setName("name")
      .setDescription("Enter playlist name")
      .setRequired(true)
  );

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);

            const playlistName = interaction.options.getString('name');
            const userId = interaction.user.id;

            const existingPlayer = client.riffy.players.get(interaction.guildId);
            const voiceCheck = await checkVC(interaction, existingPlayer);
            if (!voiceCheck.allowed) {
                const reply = await interaction.editReply(voiceCheck.response);
                setTimeout(() => reply.delete().catch(() => {}), 5000);
                return reply;
            }

            const playlist = await getPlaylistCollection()!.findOne({ name: playlistName });
            if (!playlist) {
                return sendErrorResponse(
                    interaction,
                    `${lang.playlist.playcustomplaylist.notFound.title}\n\n` +
                    `${lang.playlist.playcustomplaylist.notFound.message.replace('{name}', playlistName)}\n` +
                    `${lang.playlist.playcustomplaylist.notFound.note}`,
                    5000
                );
            }

            if (playlist.isPrivate && playlist.userId !== userId) {
                return sendErrorResponse(
                    interaction,
                    `${lang.playlist.playcustomplaylist.accessDenied.title}\n\n` +
                    `${lang.playlist.playcustomplaylist.accessDenied.message}\n` +
                    `${lang.playlist.playcustomplaylist.accessDenied.note}`,
                    5000
                );
            }

            if (!playlist.songs.length) {
                return sendErrorResponse(
                    interaction,
                    `${lang.playlist.playcustomplaylist.empty.title}\n\n` +
                    `${lang.playlist.playcustomplaylist.empty.message.replace('{name}', playlistName)}\n` +
                    `${lang.playlist.playcustomplaylist.empty.note}`,
                    5000
                );
            }

            const nodeManager = getLavalinkManager();
            if (!nodeManager) {
                return sendErrorResponse(
                    interaction,
                    `${lang.playlist.playcustomplaylist.lavalinkManagerError.title}\n\n` +
                    `${lang.playlist.playcustomplaylist.lavalinkManagerError.message}\n` +
                    `${lang.playlist.playcustomplaylist.lavalinkManagerError.note}`,
                    5000
                );
            }
            
            try {
                await nodeManager.ensureNodeAvailable();
            } catch (error) {
                const nodeCount = nodeManager.getNodeCount();
                const totalCount = nodeManager.getTotalNodeCount();
                return sendErrorResponse(
                    interaction,
                    `${lang.playlist.playcustomplaylist.noNodes.title}\n\n` +
                    `${lang.playlist.playcustomplaylist.noNodes.message.replace('{connected}', nodeCount).replace('{total}', totalCount)}\n` +
                    `${lang.playlist.playcustomplaylist.noNodes.note}`,
                    5000
                );
            }

            const userVoiceChannel = interaction.member.voice.channelId;

            await destroyPlayerIfDifferentChannel(client, existingPlayer, userVoiceChannel);

            const player = await createPlayerForGuild(
                client,
                interaction.guildId,
                userVoiceChannel,
                interaction.channelId
            );



            for (const song of playlist.songs) {
                const query = song.url ? song.url : song.name;
                let resolve: any;
                try {
                    resolve = await client.riffy.resolve({ query: query, requester: interaction.user.username });
                } catch (err: any) {
                    const msg = err?.message || '';
                    if (msg.includes('fetch failed') || msg.includes('No nodes are available') || (err.cause && err.cause.code === 'ECONNREFUSED')) {
                        await nodeManager.reconnectNodesNow?.(5000).catch(() => {});
                        await nodeManager.ensureNodeAvailable();
                        resolve = await client.riffy.resolve({ query: query, requester: interaction.user.username });
                    } else {
                        throw err;
                    }
                }
                if (!resolve || typeof resolve !== 'object') {
                    throw new TypeError('Resolve response is not an object');
                }

                const { loadType, tracks } = resolve;
                if (loadType === 'track' || loadType === 'search') {
                    const track = tracks.shift();
                    track.info.requester = interaction.user.username;
                    player.queue.add(track);
                } else {
                    return sendErrorResponse(
                        interaction,
                        `${lang.playlist.playcustomplaylist.resolveError.title}\n\n` +
                        `${lang.playlist.playcustomplaylist.resolveError.message}\n` +
                        `${lang.playlist.playcustomplaylist.resolveError.note}`,
                        5000
                    );
                }
            }

            if (!player.playing && !player.paused && player.queue.length > 0) {
                await playWithRetries(
                    player, client, interaction.guildId,
                    userVoiceChannel, interaction.channelId
                );
            } else if (player.queue.length === 0) {
                return sendErrorResponse(
                    interaction,
                    `${lang.playlist.playcustomplaylist.resolveError.title}\n\n` +
                    `${lang.playlist.playcustomplaylist.resolveError.message}\n` +
                    `${lang.playlist.playcustomplaylist.resolveError.note}`,
                    5000
                );
            }

            const successCard = buildPaleCard(
                `${getEmoji('playlist')} ${sanitizeTitle(lang.playlist.playcustomplaylist.success.title, 'Playlist Added')}`,
                [
                    `### ${getEmoji('playlist')} Playlist\n${lang.playlist.playcustomplaylist.success.message.replace('{name}', playlistName)}`,
                    `### ${getEmoji('music')} Tracks\n${lang.playlist.playcustomplaylist.success.songs.replace('{count}', playlist.songs.length)}`
                ]
            );

            const reply = await interaction.editReply({
                components: [successCard],
                flags: MessageFlags.IsComponentsV2,
                fetchReply: true
            });
            setTimeout(() => reply.delete().catch(() => {}), 3000);
            return reply;

        } catch (error: any) {
            const lang = await getLang(interaction.guildId);
            return handleCommandError(
                interaction,
                error,
                'playcustomplaylist',
                `${lang.playlist.playcustomplaylist.errors.title}\n\n` +
                `${lang.playlist.playcustomplaylist.errors.message}`
            );
        }
    }
};
