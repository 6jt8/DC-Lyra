import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { getEmoji } from '../../emoji/emoji.js';
import { getAutoplayCollection } from '../../database/database.js';
import { getLang } from '../../utils/language.js';
import { handleCommandError, safeDeferReply, buildPaleCard, sanitizeTitle } from '../../ui/responseHandler.js';

const data = new SlashCommandBuilder()
  .setName("247")
  .setDescription("Toggle 24/7 mode (keep bot in voice channel)")
  .addBooleanOption((option: any) =>
    option.setName("enable")
      .setDescription("Enable or disable 24/7 mode")
      .setRequired(true)
  );

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);

            const { hasDjPermission } = await import('../../utils/djRole.js');
            if (!hasDjPermission(interaction)) {
                const errorContainer = buildPaleCard(
                    `${getEmoji('error')} ${sanitizeTitle(lang.utility.twentyfourseven.accessDenied.title, 'Access Denied')}`,
                    [lang.utility.twentyfourseven.accessDenied.message]
                );

                const reply = await interaction.editReply({
                    components: [errorContainer],
                    flags: MessageFlags.IsComponentsV2,
                });
                setTimeout(() => reply.delete().catch(() => {}), 3000);
                return reply;
            }

            const enable = interaction.options.getBoolean('enable');
            const guildId = interaction.guild.id;

            const col = getAutoplayCollection();
            const existing = await col.findOne({ guildId });
            
            if (existing) {
              await col.updateOne({ guildId }, { twentyfourseven: enable });
            } else {
              await col.insertOne({ guildId, autoplay: false, twentyfourseven: enable });
            }

            const statusText = enable
                ? `${lang.utility.twentyfourseven.enabled.title}\n\n${lang.utility.twentyfourseven.enabled.message}\n\n${lang.utility.twentyfourseven.enabled.note}`
                : `${lang.utility.twentyfourseven.disabled.title}\n\n${lang.utility.twentyfourseven.disabled.message}\n\n${lang.utility.twentyfourseven.disabled.note}`;

            const statusContainer = buildPaleCard(
                `${enable ? getEmoji('success') : getEmoji('warning')} ${sanitizeTitle(enable ? lang.utility.twentyfourseven.enabled.title : lang.utility.twentyfourseven.disabled.title, '24/7 Mode')}`,
                [
                    enable ? lang.utility.twentyfourseven.enabled.message : lang.utility.twentyfourseven.disabled.message,
                    enable ? lang.utility.twentyfourseven.enabled.note : lang.utility.twentyfourseven.disabled.note
                ]
            );

            const reply = await interaction.editReply({
                components: [statusContainer],
                flags: MessageFlags.IsComponentsV2,
                fetchReply: true
            });
            setTimeout(() => reply.delete().catch(() => {}), 3000);
            return reply;

        } catch (error) {
            return handleCommandError(
                interaction,
                error,
                '247',
                null
            );
        }
    }
};
