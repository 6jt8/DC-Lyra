import { SlashCommandBuilder } from 'discord.js';
import { getPlaylistCollection } from '../../database/database.js';
import { sendErrorResponse, sendSuccessResponse, handleCommandError, safeDeferReply } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';

const data = new SlashCommandBuilder()
  .setName("createplaylist")
  .setDescription("Create a new playlist")
  .addStringOption(option =>
    option.setName("name")
      .setDescription("Enter playlist name")
      .setRequired(true)
  )
  .addBooleanOption(option =>
    option.setName("private")
      .setDescription("Set playlist as private (visible only to you)")
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
            const isPrivate = interaction.options.getBoolean('private');
            const userId = interaction.user.id;
            const serverId = interaction.guild.id;
            const serverName = interaction.guild.name;

            const existingPlaylist = await getPlaylistCollection()!.findOne({ 
                name: playlistName, 
                serverId: serverId,
                ...(isPrivate ? { userId: userId } : {}) 
            });

            if (existingPlaylist) {
                return sendErrorResponse(
                    interaction,
                    `${lang.playlist.createplaylist.alreadyExists.title}\n\n` +
                    `${lang.playlist.createplaylist.alreadyExists.message.replace('{name}', playlistName)}\n` +
                    `${lang.playlist.createplaylist.alreadyExists.note}`,
                    5000
                );
            }

            await getPlaylistCollection()!.insertOne({ 
                name: playlistName, 
                songs: [], 
                isPrivate: isPrivate, 
                userId: userId, 
                serverId: serverId, 
                serverName: serverName 
            });

            const visibility = isPrivate ? lang.playlist.createplaylist.success.private : lang.playlist.createplaylist.success.public;
            return sendSuccessResponse(
                interaction,
                `${lang.playlist.createplaylist.success.title}\n\n` +
                `${lang.playlist.createplaylist.success.message.replace('{name}', playlistName)}\n\n` +
                `${lang.playlist.createplaylist.success.visibility.replace('{visibility}', visibility)}\n` +
                `${lang.playlist.createplaylist.success.server.replace('{server}', serverName)}`,
                '#00ff00',
                3000
            );

        } catch (error) {
            const lang = await getLang(interaction.guildId);
            return handleCommandError(
                interaction,
                error,
                'createplaylist',
                `${lang.playlist.createplaylist.errors.title}\n\n` +
                `${lang.playlist.createplaylist.errors.message}`
            );
        }
    }
};
