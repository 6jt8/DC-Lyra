import { SlashCommandBuilder } from 'discord.js';
import { getAutoplayCollection } from '../../database/database.js';
import { sendSuccessResponse, handleCommandError, safeDeferReply } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';

const data = new SlashCommandBuilder()
  .setName("autoplay")
  .setDescription("Toggle autoplay for the server")
  .addBooleanOption(option =>
    option.setName("enable")
      .setDescription("Toggle autoplay on / off")
      .setRequired(true)
  );

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.autoplay;

            const enable = interaction.options.getBoolean('enable');
            const guildId = interaction.guild.id;

            await getAutoplayCollection()?.updateOne(
                { guildId },
                { $set: { autoplay: enable } },
                { upsert: true }
            );

            const content = enable 
                ? t.enabled.title + '\n\n' + t.enabled.message + '\n\n' + t.enabled.note
                : t.disabled.title + '\n\n' + t.disabled.message + '\n\n' + t.disabled.note;

            return await sendSuccessResponse(
                interaction,
                content,
                enable ? '#00ff00' : '#ff0000'
            );

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { autoplay: { errors: {} } } }));
            const t = lang.music?.autoplay?.errors || {};
            
            return await handleCommandError(
                interaction,
                error,
                'autoplay',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while updating autoplay settings.\nPlease try again later.')
            );
        }
    }
};
