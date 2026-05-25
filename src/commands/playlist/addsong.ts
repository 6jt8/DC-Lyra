import { SlashCommandBuilder } from 'discord.js';
import { getPlaylistCollection } from '../../database/database.js';
import { sendErrorResponse, sendSuccessResponse, handleCommandError, safeDeferReply } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';

const data = new SlashCommandBuilder()
  .setName("addsong")
  .setDescription("Add a song to a playlist")
  .addStringOption(option =>
    option.setName("playlist")
      .setDescription("Enter playlist name")
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName("input")
      .setDescription("Enter song name or URL")
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
            const songInput = interaction.options.getString('input');
            const userId = interaction.user.id;

            const playlist = await getPlaylistCollection()!.findOne({ name: playlistName });
            if (!playlist) {
                return sendErrorResponse(
                    interaction,
                    `${lang.playlist.addsong.notFound.title}\n\n` +
                    `${lang.playlist.addsong.notFound.message.replace('{name}', playlistName)}\n` +
                    `${lang.playlist.addsong.notFound.note}`,
                    5000
                );
            }

            if (playlist.userId !== userId) {
                return sendErrorResponse(
                    interaction,
                    `${lang.playlist.addsong.accessDenied.title}\n\n` +
                    `${lang.playlist.addsong.accessDenied.message}\n` +
                    `${lang.playlist.addsong.accessDenied.note}`,
                    5000
                );
            }

            const urlPattern = /^https?:\/\/[^\s$.?#].[^\s]*$/gm;
            let song: any;

            if (urlPattern.test(songInput)) {
                song = { url: songInput };
            } else {
                song = { name: songInput };
            }

            // Get current songs array and append new song
            const currentSongs = playlist.songs || [];
            const updatedSongs = [...currentSongs, song];
            
            await getPlaylistCollection()!.updateOne(
                { name: playlistName },
                { songs: updatedSongs }
            );

            return sendSuccessResponse(
                interaction,
                `${lang.playlist.addsong.success.title}\n\n` +
                `${lang.playlist.addsong.success.song.replace('{song}', songInput)}\n` +
                `${lang.playlist.addsong.success.playlist.replace('{playlist}', playlistName)}\n\n` +
                `${lang.playlist.addsong.success.message}`,
                '#00ff00',
                3000
            );

        } catch (error) {
            const lang = await getLang(interaction.guildId);
            return handleCommandError(
                interaction,
                error,
                'addsong',
                `${lang.playlist.addsong.errors.title}\n\n` +
                `${lang.playlist.addsong.errors.message}`
            );
        }
    }
};
