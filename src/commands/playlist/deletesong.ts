import { SlashCommandBuilder } from 'discord.js';
import { getPlaylistCollection } from '../../database/database.js';
import { sendErrorResponse, sendSuccessResponse, handleCommandError, safeDeferReply } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';

const data = new SlashCommandBuilder()
  .setName("deletesong")
  .setDescription("Delete a song from a playlist")
  .addStringOption(option =>
    option.setName("playlist")
      .setDescription("Enter playlist name")
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName("song")
      .setDescription("Enter song name")
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
            const songName = interaction.options.getString('song');

            const playlist = await getPlaylistCollection()!.findOne({ name: playlistName });
            if (!playlist) {
                return sendErrorResponse(
                    interaction,
                    `${lang.playlist.deletesong.notFound.title}\n\n` +
                    `${lang.playlist.deletesong.notFound.message.replace('{name}', playlistName)}\n` +
                    `${lang.playlist.deletesong.notFound.note}`,
                    5000
                );
            }

            
            const currentSongs = playlist.songs || [];
            const updatedSongs = currentSongs.filter((s: any) => s.name !== songName);
            
            await getPlaylistCollection()!.updateOne(
                { name: playlistName },
                { songs: updatedSongs }
            );
            
            return sendSuccessResponse(
                interaction,
                `${lang.playlist.deletesong.success.title}\n\n` +
                `${lang.playlist.deletesong.success.song.replace('{song}', songName)}\n` +
                `${lang.playlist.deletesong.success.playlist.replace('{playlist}', playlistName)}\n\n` +
                `${lang.playlist.deletesong.success.message}`,
                '#00ff00',
                3000
            );

        } catch (error) {
            const lang = await getLang(interaction.guildId);
            return handleCommandError(
                interaction,
                error,
                'deletesong',
                `${lang.playlist.deletesong.errors.title}\n\n` +
                `${lang.playlist.deletesong.errors.message}`
            );
        }
    }
};
