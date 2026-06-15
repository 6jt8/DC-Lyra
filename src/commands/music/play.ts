import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { config } from '../../config.js';
import SpotifyWebApi from 'spotify-web-api-node';
import getDataFactory from 'spotify-url-info';
const spotifyScraper = getDataFactory(globalThis.fetch);
const { getData, getTracks: spotifyScrapeTracks } = spotifyScraper;
import { sendErrorResponse, handleCommandError, safeDeferReply, buildPaleCard, sanitizeTitle, stripLeadingIcons } from '../../ui/responseHandler.js';
import { checkVoiceChannel as checkVC } from '../../utils/voiceChannel.js';
import { getLavalinkManager } from '../../music/lavalink.js';
import { getLang } from '../../utils/language.js';
import { getEmoji } from '../../emoji/emoji.js';
import { requesters } from '../../music/player-store.js';
import { cleanupTrackMessages } from '../../music/player-cleanup.js';

const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Play a song from a name or link")
  .addStringOption(option =>
    option.setName("name")
      .setDescription("Enter song name / link or playlist")
      .setRequired(true)
  );

const spotifyApi = new SpotifyWebApi({
    clientId: config.spotifyClientId, 
    clientSecret: config.spotifyClientSecret,
});

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

async function getSpotifyPlaylistTracks(playlistId: string) {
    try {
        const data = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(data.body.access_token);

        let tracks: string[] = [];
        let offset = 0;
        const limit = 100;
        let total = 0;

        do {
            const response = await spotifyApi.getPlaylistTracks(playlistId, { limit, offset });
            total = response.body.total;
            offset += limit;

            for (const item of response.body.items) {
                if (item.track && item.track.name && item.track.artists) {
                    const trackName = `${item.track.name} - ${item.track.artists.map((a: any) => a.name).join(', ')}`;
                    tracks.push(trackName);
                }
            }
        } while (tracks.length < total);

        return tracks;
    } catch (error: any) {
        const statusCode = error?.statusCode || error?.status;
        if (error?.body?.error === "invalid_client") {
            console.warn("[ SPOTIFY ] Invalid or missing Spotify API credentials.");
        } else if (statusCode === 403) {
            console.warn("[ SPOTIFY ] Spotify API 403 - server IP may be blocked. Falling back to scraping.");
        } else if (statusCode === 429) {
            console.warn("[ SPOTIFY ] Spotify API rate limited (429). Falling back to scraping.");
        } else {
            console.error("Error fetching Spotify playlist tracks:", error);
        }
        return [];
    }
}

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;

            const lang = await getLang(interaction.guildId);
            const t = lang.music.play;

            const query = interaction.options.getString('name');

            if (!client.riffy) {
                return sendErrorResponse(
                    interaction,
                    (lang.music?.play?.lavalinkManagerError?.title || '## ❌ Music System Not Ready') + '\n\n' +
                    (lang.music?.play?.lavalinkManagerError?.message || 'Music system is still initializing.') + '\n' +
                    (lang.music?.play?.lavalinkManagerError?.note || 'Please try again in a few seconds.'),
                    5000
                );
            }

            const existingPlayer = client.riffy.players.get(interaction.guildId);
            const voiceCheck = await checkVC(interaction, existingPlayer);
            if (!voiceCheck.allowed) {
                const reply = await interaction.editReply(voiceCheck.response);
                setTimeout(() => reply.delete().catch(() => {}), 5000);
                return reply;
            }

            const nodeManager = getLavalinkManager();
            if (!nodeManager) {
                return sendErrorResponse(
                    interaction,
                    t.lavalinkManagerError.title + '\n\n' +
                    t.lavalinkManagerError.message + '\n' +
                    t.lavalinkManagerError.note,
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
                    t.noNodes.title + '\n\n' +
                    t.noNodes.message
                        .replace('{connected}', nodeCount)
                        .replace('{total}', totalCount) + '\n' +
                    t.noNodes.note,
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



            const voiceConnected = await waitForPlayerConnection(player, 20000);
            if (!voiceConnected) {
                let retryConnected = false;
                for (let retry = 0; retry < 2; retry++) {
                    try {
                        if (player && !player.destroyed) player.destroy();
                    } catch (_) {}
                    await new Promise(res => setTimeout(res, 1000));
                    await nodeManager.reconnectNodesNow?.(5000).catch(() => {});
                    await nodeManager.ensureNodeAvailable();
                    try {
                        player = client.riffy.createConnection({
                            guildId: interaction.guildId,
                            voiceChannel: userVoiceChannel,
                            textChannel: interaction.channelId,
                            deaf: true,
                            defaultVolume: 20
                        });
                        retryConnected = await waitForPlayerConnection(player, 15000);
                        if (retryConnected) break;
                    } catch (_) {}
                }
                if (!retryConnected) {
                    throw new Error('Voice connection was not established. The bot did not join the voice channel.');
                }
            }

            let tracksToQueue: string[] = [];
            let isPlaylist = false;

            if (query.includes('spotify.com')) {
                try {
                    const spotifyData: any = await getData(query);

                    if (spotifyData.type === 'track') {
                        const trackName = `${spotifyData.name} - ${spotifyData.artists.map((a: any) => a.name).join(', ')}`;
                        tracksToQueue.push(trackName);
                    } else if (spotifyData.type === 'playlist') {
                        isPlaylist = true;
                        const playlistMatch = query.match(/\/playlist\/([a-zA-Z0-9]+)/);
                        const playlistId = playlistMatch ? playlistMatch[1] : '';

                        if (config.spotifyClientId && config.spotifyClientSecret) {
                            tracksToQueue = await getSpotifyPlaylistTracks(playlistId);
                        }

                        if (tracksToQueue.length === 0) {
                            console.log("[ SPOTIFY ] Using spotify-url-info fallback for playlist");
                            try {
                                const scrapedTracks = await spotifyScrapeTracks(query);
                                if (scrapedTracks && scrapedTracks.length > 0) {
                                    tracksToQueue = scrapedTracks.map((t: any) =>
                                        `${t.name} - ${t.artist}`
                                    );
                                }
                            } catch (scrapeErr) {
                                console.error("[ SPOTIFY ] Scraping fallback failed:", scrapeErr);
                            }
                        }

                        if (tracksToQueue.length === 0) {
                            return sendErrorResponse(
                                interaction,
                                `## ⚠️ Playlist Unavailable\n\n` +
                                `Could not fetch tracks from this playlist.\n` +
                                `Try a different source or check Spotify API credentials.`,
                                8000
                            );
                        }
                    } else if (spotifyData.type === 'album') {
                        isPlaylist = true;
                        try {
                            const albumTracks = await spotifyScrapeTracks(query);
                            if (albumTracks && albumTracks.length > 0) {
                                tracksToQueue = albumTracks.map((t: any) =>
                                    `${t.name} - ${t.artist}`
                                );
                            }
                        } catch (scrapeErr) {
                            console.error("[ SPOTIFY ] Album scraping failed:", scrapeErr);
                        }
                    }
                } catch (err) {
                    console.error('Error fetching Spotify data:', err);
                    return sendErrorResponse(
                        interaction,
                        t.spotifyError.title + '\n\n' +
                        t.spotifyError.message + '\n' +
                        t.spotifyError.note,
                        5000
                    );
                }
            } else {
                let resolve: any;
                try {
                    resolve = await client.riffy.resolve({ query, requester: interaction.user.username });
                } catch (err: any) {
                    const msg = err?.message || '';
                    if (msg.includes('fetch failed') || msg.includes('No nodes are available') || (err.cause && err.cause.code === 'ECONNREFUSED')) {
                        await nodeManager.reconnectNodesNow?.(5000).catch(() => {});
                        await nodeManager.ensureNodeAvailable();
                        resolve = await client.riffy.resolve({ query, requester: interaction.user.username });
                    } else {
                        throw err;
                    }
                }

                if (!resolve || typeof resolve !== 'object' || !Array.isArray(resolve.tracks)) {
                    return sendErrorResponse(
                        interaction,
                        t.invalidResponse.title + '\n\n' +
                        t.invalidResponse.message + '\n' +
                        t.invalidResponse.note,
                        5000
                    );
                }

                if (resolve.loadType === 'playlist') {
                    isPlaylist = true;
                    for (const track of resolve.tracks) {
                        track.info.requester = interaction.user.username;
                        player.queue.add(track);
                        requesters.set(track.info.uri, interaction.user.username);
                    }
                } else if (resolve.loadType === 'search' || resolve.loadType === 'track') {
                    const track = resolve.tracks.shift();
                    track.info.requester = interaction.user.username;
                    player.queue.add(track);
                    requesters.set(track.info.uri, interaction.user.username);
                } else {
                    return sendErrorResponse(
                        interaction,
                        t.noResults.title + '\n\n' +
                        t.noResults.message + '\n' +
                        t.noResults.note,
                        5000
                    );
                }
            }

            let queuedTracks = 0;

            const maxTracks = 200;
            for (let i = 0; i < Math.min(tracksToQueue.length, maxTracks); i++) {
                const trackQuery = tracksToQueue[i];
                try {
                    const resolve: any = await client.riffy.resolve({ query: trackQuery, requester: interaction.user.username });
                    if (resolve && resolve.tracks && resolve.tracks.length > 0) {
                        const trackInfo = resolve.tracks[0];
                        player.queue.add(trackInfo);
                        requesters.set(trackInfo.info.uri, interaction.user.username);
                        queuedTracks++;
                    }
                } catch (error) {
                    console.error(`Error resolving track ${trackQuery}:`, error);
                }
            }
            
            if (tracksToQueue.length > maxTracks) {
                console.warn(`Playlist truncated: ${tracksToQueue.length} tracks requested, only ${maxTracks} queued`);
            }

            if (queuedTracks === 0 && tracksToQueue.length > 0) {
                return sendErrorResponse(
                    interaction,
                    t.noResults.title + '\n\n' +
                    (t.noResults.message || 'No results found') + '\n' +
                    (t.noResults.note || 'Could not resolve Spotify tracks on YouTube. Try a different source.'),
                    5000
                );
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
                    t.noResults.title + '\n\n' +
                    t.noResults.message + '\n' +
                    t.noResults.note,
                    5000
                );
            }

            const successTitle = isPlaylist ? t.success.titlePlaylist : t.success.titleTrack;
            const titleIcon = isPlaylist ? (getEmoji('playlist') || '📚') : (getEmoji('music') || '🎵');
            const addedIcon = isPlaylist ? (getEmoji('playlist') || '📚') : (getEmoji('success') || '✅');
            const statusIcon = player.playing ? (getEmoji('play') || '▶️') : (getEmoji('pause') || '⏸️');
            const statusText = stripLeadingIcons(player.playing ? t.success.nowPlaying : t.success.queueReady);
            const successContainer = buildPaleCard(
                `${titleIcon} ${sanitizeTitle(successTitle, 'Play')}`,
                [
                    `### ${addedIcon} Added` + '\n' +
                    (isPlaylist
                        ? t.success.playlistAdded.replace('{count}', queuedTracks)
                        : t.success.trackAdded),
                    `### ${statusIcon} Status` + '\n' +
                    statusText
                ]
            );

            const message = await interaction.editReply({ 
                components: [successContainer],
                flags: MessageFlags.IsComponentsV2,
            }).catch(() => null);

            if (message) {
                setTimeout(() => {
                    message.delete().catch(() => {}); 
                }, 3000);
            }

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { play: { errors: {} } } }));
            const t = lang.music?.play?.errors || {};
            
            return handleCommandError(
                interaction,
                error,
                'play',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while processing the request.\nPlease try again later.')
            );
        }
    },
    requesters: requesters,
};


