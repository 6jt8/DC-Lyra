import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { getPlaylistCollection } from '../../database/database.js';
import { getEmoji } from '../../emoji/emoji.js';
import { sendErrorResponse, handleCommandError, safeDeferReply, buildPaleCard, sanitizeTitle } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';

const data = new SlashCommandBuilder()
  .setName("myplaylists")
  .setDescription("List all playlists you have created");

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);

            const userId = interaction.user.id;

            const playlists = await getPlaylistCollection()!.find({ userId: userId }).toArray();

            if (!playlists.length) {
                return sendErrorResponse(
                    interaction,
                    `${lang.playlist.myplaylists.noPlaylists.title}\n\n` +
                    `${lang.playlist.myplaylists.noPlaylists.message}\n` +
                    `${lang.playlist.myplaylists.noPlaylists.note}`,
                    5000
                );
            }

            const chunkSize = 10;
            const chunks: any[] = [];
            for (let i = 0; i < playlists.length; i += chunkSize) {
                chunks.push(playlists.slice(i, i + chunkSize));
            }

            const components: any[] = [];

            for (const [index, chunk] of chunks.entries()) {
                const playlistList = chunk
                    .map((playlist: any, idx: number) => {
                        const visibility = playlist.isPrivate ? lang.playlist.myplaylists.visibilityPrivate : lang.playlist.myplaylists.visibilityPublic;
                        return lang.playlist.myplaylists.playlistItem
                            .replace('{number}', index * chunkSize + idx + 1)
                            .replace('{name}', playlist.name)
                            .replace('{visibility}', visibility)
                            .replace('{server}', playlist.serverName)
                            .replace('{count}', playlist.songs.length);
                    })
                    .join('\n\n');

                const title = lang.playlist.myplaylists.title
                    .replace('{currentPage}', index + 1)
                    .replace('{totalPages}', chunks.length);

                components.push(
                    buildPaleCard(
                        `${getEmoji('playlist')} ${sanitizeTitle(title, 'My Playlists')}`,
                        [`### ${getEmoji('folder')} Playlists\n${playlistList}`]
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
                'myplaylists',
                `${lang.playlist.myplaylists.errors.title}\n\n` +
                `${lang.playlist.myplaylists.errors.message}`
            );
        }
    }
};
