import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { checkVoiceChannel } from '../../utils/voiceChannel.js';
import { checkQueueOrTrack } from '../../utils/playerValidation.js';
import { handleCommandError, safeDeferReply, buildPaleCard, sanitizeTitle, stripLeadingIcons } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';
import { getEmoji, getButtonEmoji } from '../../emoji/emoji.js';

const data = new SlashCommandBuilder()
  .setName("queue")
  .setDescription("Show the current song queue");

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.queue;

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

            const queueCheck = await checkQueueOrTrack(player, null, interaction.guildId);
            
            if (!queueCheck.valid) {
                const reply = await interaction.editReply({
                    ...queueCheck.response,
                    fetchReply: true
                });
                setTimeout(() => reply.delete().catch(() => {}), 5000);
                return reply;
            }

            const currentTrack = player.current;
            const queue = player.queue;
            const songsPerPage = 10;
            const totalPages = Math.ceil(queue.length / songsPerPage) || 1;
            let currentPage = 1;

            function generateQueuePage(page: number) {
                const queueItems: string[] = [];
                
                if (page === 1 && currentTrack) {
                    queueItems.push(
                        `### ${getEmoji('play')} Now Playing` + '\n' +
                        t.track
                            .replace('{title}', currentTrack.info.title)
                            .replace('{uri}', currentTrack.info.uri) + '\n' +
                        `${getEmoji('users')} ` + t.requestedBy.replace('{requester}', currentTrack.info.requester || 'Unknown')
                    );
                }

                const queueStartIndex = (page - 1) * songsPerPage;
                const queueEndIndex = Math.min(queueStartIndex + songsPerPage, queue.length);
                const paginatedQueue = queue.slice(queueStartIndex, queueEndIndex);

                if (paginatedQueue.length) {
                    queueItems.push(`### ${getEmoji('queue')} Up Next`);
                }
                
                paginatedQueue.forEach((track: any, index: number) => {
                    const position = queueStartIndex + index + 1;
                    queueItems.push(
                        `${getEmoji('music')} ` + t.trackNumber.replace('{number}', position) + ' ' +
                        t.track
                            .replace('{title}', track.info.title)
                            .replace('{uri}', track.info.uri) + '\n   ' +
                        `${getEmoji('users')} ` + t.requestedBy.replace('{requester}', track.info.requester || 'Unknown')
                    );
                });

                return queueItems.join('\n\n') || t.noMoreSongs;
            }

            const initialTitle = totalPages > 1
                ? t.titlePaginated
                    .replace('{currentPage}', currentPage)
                    .replace('{totalPages}', totalPages)
                : t.title;
            const queueContainer = buildPaleCard(
                `${getEmoji('queue')} ${sanitizeTitle(initialTitle, 'Queue')}`,
                [generateQueuePage(currentPage)]
            );

            const prevButton = new ButtonBuilder()
                .setCustomId(`queue_prev_${interaction.id}`)
                .setLabel(stripLeadingIcons(t.buttons.previous))
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === 1);
            const prevEmoji = getButtonEmoji('back');
            if (prevEmoji) prevButton.setEmoji(prevEmoji);

            const nextButton = new ButtonBuilder()
                .setCustomId(`queue_next_${interaction.id}`)
                .setLabel(stripLeadingIcons(t.buttons.next))
                .setStyle(ButtonStyle.Primary)
                .setDisabled(currentPage === totalPages);
            const nextEmoji = getButtonEmoji('next');
            if (nextEmoji) nextButton.setEmoji(nextEmoji);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(prevButton, nextButton);

            const response = await interaction.editReply({ 
                components: [queueContainer, row], 
                flags: MessageFlags.IsComponentsV2,
                fetchReply: true 
            });
            setTimeout(() => response.delete().catch(() => {}), 30000);

            if (totalPages > 1) {
                const collector = response.createMessageComponentCollector({
                    filter: (i: any) => i.user.id === interaction.user.id && (i.customId.startsWith('queue_prev_') || i.customId.startsWith('queue_next_')),
                    time: 60000
                });

                collector.on('collect', async (i: any) => {
                    if (i.customId.startsWith('queue_prev_') && currentPage > 1) {
                        currentPage--;
                    } else if (i.customId.startsWith('queue_next_') && currentPage < totalPages) {
                        currentPage++;
                    }

                    const updatedTitle = t.titlePaginated
                        .replace('{currentPage}', currentPage)
                        .replace('{totalPages}', totalPages);
                    const updatedContainer = buildPaleCard(
                        `${getEmoji('queue')} ${sanitizeTitle(updatedTitle, 'Queue')}`,
                        [generateQueuePage(currentPage)]
                    );

                    prevButton.setDisabled(currentPage === 1);
                    nextButton.setDisabled(currentPage === totalPages);

                    await i.update({ 
                        components: [updatedContainer, row],
                        flags: MessageFlags.IsComponentsV2,
                    });
                });

                collector.on('end', async () => {
                    try {
                        await response.edit({ components: [queueContainer] }).catch(() => {});
                    } catch (error) {
                    }
                });
            }

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { queue: { errors: {} } } }));
            const t = lang.music?.queue?.errors || {};
            
            return await handleCommandError(
                interaction,
                error,
                'queue',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while fetching the queue.\nPlease try again later.')
            );
        }
    }
};
