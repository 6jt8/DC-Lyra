import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { requesters } from '../../music/player-store.js';
import { sendErrorResponse, handleCommandError, safeDeferReply, safeDeferUpdate, buildPaleCard, sanitizeTitle, sanitizeMentions, stripLeadingIcons } from '../../ui/responseHandler.js';
import { checkVoiceChannel as checkVC } from '../../utils/voiceChannel.js';
import { getLavalinkManager } from '../../music/lavalink.js';
import { getLang } from '../../utils/language.js';
import { getEmoji, getButtonEmoji } from '../../emoji/emoji.js';
import { createPlayerForGuild, destroyPlayerIfDifferentChannel, playWithRetries } from '../../music/player-connection.js';
import { formatDuration } from '../../music/player-ui.js';

const data = new SlashCommandBuilder()
  .setName("search")
  .setDescription("Search for a song and select from results")
  .addStringOption(option =>
    option.setName("query")
      .setDescription("Search query for the song")
      .setRequired(true)
  );

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const lang = await getLang(interaction.guildId);
            const t = lang.music.search;

            const query = interaction.options.getString('query');

            const deferred = await safeDeferReply(interaction);

            if (!deferred && !interaction.deferred && !interaction.replied) return;
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

            const existingPlayer = client.riffy.players.get(interaction.guildId);
            const voiceCheck = await checkVC(interaction, existingPlayer);
            if (!voiceCheck.allowed) {
                const reply = await interaction.editReply(voiceCheck.response);
                setTimeout(() => reply.delete().catch(() => {}), 5000);
                return reply;
            }

            const userVoiceChannel = interaction.member.voice.channelId;

            await destroyPlayerIfDifferentChannel(client, existingPlayer, userVoiceChannel);

            const player = await createPlayerForGuild(
                client,
                interaction.guildId,
                userVoiceChannel,
                interaction.channelId
            );



            let resolve: any;
            try {
                resolve = await client.riffy.resolve({ query, requester: interaction.user.username });
            } catch (err) {
                const msg = (err as Error)?.message || '';
                if (msg.includes('fetch failed') || msg.includes('No nodes are available') || ((err as any).cause && (err as any).cause.code === 'ECONNREFUSED')) {
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
                    t.noResults.title + '\n\n' +
                    t.noResults.message + '\n' +
                    t.noResults.note,
                    5000
                );
            }

            if (resolve.loadType === 'playlist') {
                return sendErrorResponse(
                    interaction,
                    t.playlistNotSupported.title + '\n\n' +
                    t.playlistNotSupported.message + '\n' +
                    t.playlistNotSupported.note,
                    5000
                );
            }

            const tracks = resolve.tracks.slice(0, 5);
            
            if (tracks.length === 0) {
                return sendErrorResponse(
                    interaction,
                    t.noResults.title + '\n\n' +
                    t.noResults.message + '\n' +
                    t.noResults.note,
                    5000
                );
            }

            const searchResults = tracks.map((track: any, index: number) => {
                return t.results.track
                    .replace('{number}', index + 1)
                    .replace('{title}', sanitizeMentions(track.info.title))
                    .replace('{uri}', track.info.uri)
                    .replace('{author}', track.info.author || 'Unknown')
                    .replace('{duration}', formatDuration(track.info.length));
            }).join('\n\n');

            const resultsContainer = buildPaleCard(
                `${getEmoji('search')} ${sanitizeTitle(t.results.title, 'Search Results')}`,
                [
                    `### ${getEmoji('search')} Query\n` + t.results.query.replace('{query}', query),
                    `### ${getEmoji('music')} Results\n` + searchResults
                ]
            );

            const buttons = [];
            for (let i = 0; i < tracks.length; i++) {
                buttons.push(
                    new ButtonBuilder()
                        .setCustomId(`search_select_${i}_${interaction.id}`)
                        .setLabel(`${i + 1}`)
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji(getButtonEmoji('music')!)
                );
            }

            const cancelButton = new ButtonBuilder()
                .setCustomId(`search_cancel_${interaction.id}`)
                .setLabel(stripLeadingIcons(t.buttons.cancel))
                .setStyle(ButtonStyle.Danger);
            const cancelEmoji = getButtonEmoji('stop');
            if (cancelEmoji) cancelButton.setEmoji(cancelEmoji);

            buttons.push(cancelButton);

            const rows = [];
            for (let i = 0; i < buttons.length; i += 5) {
                rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
            }

            const message = await interaction.editReply({ 
                components: [resultsContainer, ...rows], 
                flags: MessageFlags.IsComponentsV2,
                fetchReply: true 
            });

            const collector = message.createMessageComponentCollector({
                filter: (i: any) => i.user.id === interaction.user.id && (i.customId.startsWith('search_select_') || i.customId.startsWith('search_cancel_')) && i.customId.endsWith(`_${interaction.id}`),
                time: 15000
            });

            collector.on('collect', async (i: any) => {
                const deferredUpdate = await safeDeferUpdate(i);
                if (!deferredUpdate && !i.deferred && !i.replied) return;
                if (i.customId.startsWith('search_cancel_')) {
                    collector.stop();
                    setTimeout(() => {
                        message.delete().catch(() => {});
                    }, 1000);
                    return;
                }

                const trackIndex = parseInt(i.customId.split('_')[2]);
                if (isNaN(trackIndex) || trackIndex < 0 || trackIndex >= tracks.length) {
                    return;
                }

                const selectedTrack = tracks[trackIndex];
                selectedTrack.info.requester = interaction.user.username;
                player.queue.add(selectedTrack);
                requesters.set(selectedTrack.info.uri, interaction.user.username);

                await playWithRetries(
                    player, client, interaction.guildId,
                    userVoiceChannel, interaction.channelId
                );

                collector.stop();
                setTimeout(() => {
                    message.delete().catch(() => {});
                }, 500);
            });

            collector.on('end', async () => {
                try {
                    setTimeout(() => {
                        message.delete().catch(() => {});
                    }, 500);
                } catch (error) {
                }
            });

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { search: { errors: {} } } }));
            const t = lang.music?.search?.errors || {};
            
            return handleCommandError(
                interaction,
                error,
                'search',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while searching.\nPlease try again later.')
            );
        }
    }
};
