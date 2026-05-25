import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { getEmoji, getButtonEmoji } from '../../emoji/emoji.js';
import { getLang } from '../../utils/language.js';
import { handleCommandError, safeDeferReply, buildPaleCard, sanitizeTitle } from '../../ui/responseHandler.js';

const data = new SlashCommandBuilder()
  .setName("invite")
  .setDescription("Get the bot invite link to add it to your server");

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;

            const lang = await getLang(interaction.guildId);
            const t = lang.basic?.invite || {
                title: "Invite Bot",
                description: "Add this bot to your server!",
                features: {
                    title: "Features",
                    music: "🎵 High-quality music playback",
                    commands: "⚡ 40+ slash commands",
                    playlists: "📚 Custom playlists",
                    filters: "🎛️ Audio filters & effects",
                    languages: "🌍 Multi-language support",
                    support: "💎 24/7 music support"
                },
                permissions: {
                    title: "Permissions",
                    description: "The bot requires these permissions to work properly"
                },
                buttons: {
                    invite: "Invite Bot",
                    support: "Support Server",
                    website: "Website"
                },
                footer: "Thank you for using Lyra!"
            };

            const botIcon = getEmoji('bot') || '🤖';
            const linkIcon = getEmoji('link') || '🔗';
            const shieldIcon = getEmoji('shield') || '🛡️';
            const heartIcon = getEmoji('heart') || '💖';

            const inviteLink = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=5953445332643776&integration_type=0&scope=bot`;

            const supportLink = "";

            const websiteLink = "https://github.com/Shadow-Black-YT";

            const inviteContainer = buildPaleCard(
                `${botIcon} ${sanitizeTitle(t.title, 'Invite Bot')}`,
                [
                    `### ${linkIcon} ${t.description}\n` +
                    `Add **${client.user.username}** to your server and enjoy premium music features!`,

                    `### ${getEmoji('music') || '🎵'} ${t.features.title}\n` +
                    `${t.features.music}\n` +
                    `${t.features.commands}\n` +
                    `${t.features.playlists}\n` +
                    `${t.features.filters}\n` +
                    `${t.features.languages}\n` +
                    `${t.features.support}`,

                    `### ${shieldIcon} ${t.permissions.title}\n` +
                    `${t.permissions.description}\n` +
                    `✅ Voice & Text Permissions\n` +
                    `✅ Manage Channels (for status)\n` +
                    `✅ Embed Links & Attach Files`
                ]
            );

            const footerContainer = buildPaleCard(
                `${heartIcon} ${client.user.username}`,
                [
                    `${t.footer}\n` +
                    `**Servers:** ${client.guilds.cache.size} • **Users:** ${client.guilds.cache.reduce((acc: number, guild: any) => acc + guild.memberCount, 0).toLocaleString()}`
                ]
            );

            const inviteButton = new ButtonBuilder()
                .setLabel(t.buttons.invite)
                .setStyle(ButtonStyle.Link)
                .setURL(inviteLink);
            const inviteEmoji = getButtonEmoji('link') || getButtonEmoji('bot');
            if (inviteEmoji) inviteButton.setEmoji(inviteEmoji);

            const supportButton = new ButtonBuilder()
                .setLabel(t.buttons.support)
                .setStyle(ButtonStyle.Link)
                .setURL(supportLink);
            const supportEmoji = getButtonEmoji('support') || getButtonEmoji('users');
            if (supportEmoji) supportButton.setEmoji(supportEmoji);

            const websiteButton = new ButtonBuilder()
                .setLabel(t.buttons.website)
                .setStyle(ButtonStyle.Link)
                .setURL(websiteLink);
            const websiteEmoji = getButtonEmoji('github') || getButtonEmoji('link');
            if (websiteEmoji) websiteButton.setEmoji(websiteEmoji);

            const buttonRow = new ActionRowBuilder().addComponents(
                inviteButton,
                supportButton,
                websiteButton
            );

            const response = await interaction.editReply({
                components: [inviteContainer, footerContainer, buttonRow],
                flags: MessageFlags.IsComponentsV2,
                fetchReply: true
            });

            setTimeout(() => {
                response.delete().catch(() => {});
            }, 60000);

            return response;

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ basic: { invite: { errors: {} } } }));
            const t = lang.basic?.invite?.errors || {};

            return handleCommandError(
                interaction,
                error,
                'invite',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while generating the invite link.')
            );
        }
    }
};
