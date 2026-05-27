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
import { createPlayerForGuild, destroyPlayerIfDifferentChannel, playWithRetries } from '../../music/player-connection.js';

const MAX_QUEUE_SIZE = 500;

function isLavalinkConnectionError(err: any): boolean {
    let current = err;
    for (let i = 0; i < 5 && current; i++) {
        const code = current.code;
        const msg = String(current.message || '').toLowerCase();
        if (
            code === 'ECONNREFUSED' ||
            code === 'ECONNRESET' ||
            code === 'ETIMEDOUT' ||
            code === 'ENOTFOUND' ||
            code === 'ECONNABORTED' ||
            msg.includes('econnrefused') ||
            msg.includes('econnreset') ||
            msg.includes('etimedout') ||
            msg.includes('enotfound') ||
            msg.includes('unable to connect') ||
            msg.includes('fetch failed') ||
            msg.includes('no nodes are available') ||
            msg.includes('connectionrefused') ||
            msg.includes('there was an error while making node request')
        ) {
            return true;
        }
        current = current.cause;
    }
    return false;
}

async function resolveWithRetry(
    client: any,
    query: string,
    requester: string,
    nodeManager: ReturnType<typeof getLavalinkManager>
): Promise<any> {
    const maxAttempts = 3;
    let lastErr: any;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await client.riffy.resolve({ query, requester });
        } catch (err) {
            lastErr = err;
            if (!isLavalinkConnectionError(err)) throw err;
            console.warn(`[ RiffY ] Resolve attempt ${attempt + 1}/${maxAttempts} failed for "${query}": ${String((err as any)?.message || err)}`);
            if (attempt < maxAttempts - 1) {
                await nodeManager?.reconnectNodesNow?.(4000).catch(() => {});
                await new Promise((r) => setTimeout(r, 1500));
            }
        }
    }
    throw lastErr;
}

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

            await destroyPlayerIfDifferentChannel(client, existingPlayer, userVoiceChannel);

            const player = await createPlayerForGuild(
                client,
                interaction.guildId,
                userVoiceChannel,
                interaction.channelId
            );

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
                    resolve = await resolveWithRetry(client, query, interaction.user.username, nodeManager);
                } catch (err: any) {
                    if (isLavalinkConnectionError(err)) {
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
                    throw err;
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
                        if (player.queue.length >= MAX_QUEUE_SIZE) break;
                        track.info.requester = interaction.user.username;
                        player.queue.add(track);
                        requesters.set(track.info.uri, interaction.user.username);
                    }
                } else if (resolve.loadType === 'search' || resolve.loadType === 'track') {
                    const track = resolve.tracks.shift();
                    if (player.queue.length < MAX_QUEUE_SIZE) {
                        track.info.requester = interaction.user.username;
                        player.queue.add(track);
                        requesters.set(track.info.uri, interaction.user.username);
                    }
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
                    const resolve: any = await resolveWithRetry(client, trackQuery, interaction.user.username, nodeManager);
                    if (resolve && resolve.tracks && resolve.tracks.length > 0) {
                        if (player.queue.length >= MAX_QUEUE_SIZE) break;
                        const trackInfo = resolve.tracks[0];
                        player.queue.add(trackInfo);
                        requesters.set(trackInfo.info.uri, interaction.user.username);
                        queuedTracks++;
                    }
                } catch (error) {
                    if (isLavalinkConnectionError(error)) {
                        console.error(`Error resolving track ${trackQuery}: Lavalink node unreachable, stopping playlist import.`);
                        break;
                    }
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
                await playWithRetries(
                    player, client, interaction.guildId,
                    userVoiceChannel, interaction.channelId
                );
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


