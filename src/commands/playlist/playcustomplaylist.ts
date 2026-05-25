import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { getPlaylistCollection } from '../../database/database.js';
import { getEmoji } from '../../emoji/emoji.js';
import { sendErrorResponse, handleCommandError, safeDeferReply, buildPaleCard, sanitizeTitle } from '../../ui/responseHandler.js';
import { checkVoiceChannel as checkVC } from '../../utils/voiceChannel.js';
import { getLavalinkManager } from '../../music/lavalink.js';
import { getLang } from '../../utils/language.js';
import { cleanupTrackMessages } from '../../music/player-cleanup.js';

async function waitForPlayerConnection(player: any, timeoutMs = 15000) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
        if (player?.connected) {
            return true;
        }
        await new Promise((resolve) => setTimeout(resolve, 150));
    }
    return false;
}

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
            
            if (existingPlayer && existingPlayer.voiceChannel !== userVoiceChannel) {
                try {
                    await cleanupTrackMessages(client, existingPlayer);
                    existingPlayer.queue.clear();
                    existingPlayer.stop();
                    await new Promise(resolve => setTimeout(resolve, 300));
                    existingPlayer.destroy();
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error) {
                    console.error('Error destroying old player:', error);
                    try {
                        if (!existingPlayer.destroyed) {
                            existingPlayer.destroy();
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                    } catch (e) {}
                }
            }

            await nodeManager.checkAllNodesHealth().catch(() => {});
            await nodeManager.forceConnectAllNodes().catch(() => {});
            await new Promise(res => setTimeout(res, 400));
            let player: any;
            let attempts = 0;
            const maxAttempts = 3;
            while (attempts < maxAttempts) {
                await nodeManager.ensureNodeAvailable();
                try {
                    player = client.riffy.createConnection({
                        guildId: interaction.guildId,
                        voiceChannel: userVoiceChannel,
                        textChannel: interaction.channelId,
                        deaf: true,
                        defaultVolume: 20
                    });
                    break;
                } catch (err: any) {
                    attempts++;
                    const msg = err?.message || '';
                    if (attempts < maxAttempts && (msg.includes('No nodes are available') || msg.includes('fetch failed'))) {
                        await nodeManager.reconnectNodesNow?.(5000).catch(() => {});
                        await nodeManager.ensureNodeAvailable();
                        await new Promise(res => setTimeout(res, 700));
                        continue;
                    }
                    if (attempts >= maxAttempts) {
                        await nodeManager.refreshRiffy?.();
                        await nodeManager.ensureNodeAvailable();
                        player = client.riffy.createConnection({
                            guildId: interaction.guildId,
                            voiceChannel: userVoiceChannel,
                            textChannel: interaction.channelId,
                            deaf: true,
                            defaultVolume: 20
                        });
                        break;
                    }
                    throw err;
            }
            }



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

            const connected = await waitForPlayerConnection(player);
            if (!connected) {
                throw new Error('Voice connection was not established. The bot did not join the voice channel.');
            }

            if (!player.playing && !player.paused && player.queue.length > 0) {
                for (let attempt = 0; attempt < 3; attempt++) {
                    if (!player || player.destroyed || !player.connection) {
                        await new Promise(r => setTimeout(r, 1500));
                        continue;
                    }
                    try {
                        player.play();
                        break;
                    } catch (playErr: any) {
                        const msg = playErr?.message || "";
                        if (attempt < 2 && (msg.includes("Player connection is not initiated") || msg.includes("null is not an object"))) {
                            await new Promise(r => setTimeout(r, 1500));
                            continue;
                        }
                        throw playErr;
                    }
                }
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
