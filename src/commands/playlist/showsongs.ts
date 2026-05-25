import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { getPlaylistCollection } from '../../database/database.js';
import { getEmoji } from '../../emoji/emoji.js';
import { sendErrorResponse, handleCommandError, safeDeferReply, buildPaleCard, sanitizeTitle } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';

const data = new SlashCommandBuilder()
  .setName("showsongs")
  .setDescription("Show all songs in a playlist")
  .addStringOption(option =>
    option.setName("playlist")
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

            const playlistName = interaction.options.getString('playlist');
            const userId = interaction.user.id;

            const playlist = await getPlaylistCollection()!.findOne({ name: playlistName });
            if (!playlist) {
                return sendErrorResponse(
                    interaction,
                    `${lang.playlist.showsongs.notFound.title}\n\n` +
                    `${lang.playlist.showsongs.notFound.message.replace('{name}', playlistName)}\n` +
                    `${lang.playlist.showsongs.notFound.note}`,
                    5000
                );
            }

            if (playlist.isPrivate && playlist.userId !== userId) {
                return sendErrorResponse(
                    interaction,
                    `${lang.playlist.showsongs.accessDenied.title}\n\n` +
                    `${lang.playlist.showsongs.accessDenied.message}\n` +
                    `${lang.playlist.showsongs.accessDenied.note}`,
                    5000
                );
            }

            const chunkSize = 10;
            const songChunks: any[] = [];
            for (let i = 0; i < playlist.songs.length; i += chunkSize) {
                songChunks.push(playlist.songs.slice(i, i + chunkSize));
            }

            if (songChunks.length === 0) {
                const emptyTitle = lang.playlist.showsongs.empty.title.replace('{name}', playlistName);
                const emptyContainer = buildPaleCard(
                    `${getEmoji('playlist')} ${sanitizeTitle(emptyTitle, 'Playlist Songs')}`,
                    [lang.playlist.showsongs.empty.message]
                );

                const reply = await interaction.editReply({
                    components: [emptyContainer],
                    flags: MessageFlags.IsComponentsV2,
                    fetchReply: true
                });
                setTimeout(() => reply.delete().catch(() => {}), 30000);
                return reply;
            }

            const components: any[] = [];

            for (const [index, chunk] of songChunks.entries()) {
                const songList = chunk
                    .map((song: any, i: number) => `${index * chunkSize + i + 1}. ${song.name || song.url}`)
                    .join('\n');

                const title = lang.playlist.showsongs.title
                    .replace('{name}', playlistName)
                    .replace('{currentPage}', index + 1)
                    .replace('{totalPages}', songChunks.length);

                components.push(
                    buildPaleCard(
                        `${getEmoji('playlist')} ${sanitizeTitle(title, 'Playlist Songs')}`,
                        [`### ${getEmoji('music')} Songs\n${songList}`]
                    )
                );
            }

            const reply = await interaction.editReply({
                components: components,
                flags: MessageFlags.IsComponentsV2,
                fetchReply: true
            });
            setTimeout(() => reply.delete().catch(() => {}), 30000);
            return reply;

        } catch (error) {
            const lang = await getLang(interaction.guildId);
            return handleCommandError(
                interaction,
                error,
                'showsongs',
                `${lang.playlist.showsongs.errors.title}\n\n` +
                `${lang.playlist.showsongs.errors.message}`
            );
        }
    }
};
