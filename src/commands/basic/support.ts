import { SlashCommandBuilder, ContainerBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } from 'discord.js';
import { getLang } from '../../utils/language.js';
import { getEmoji, getButtonEmoji } from '../../emoji/emoji.js';
import { safeDeferReply, stripLeadingIcons } from '../../ui/responseHandler.js';

const data = new SlashCommandBuilder()
  .setName("support")
  .setDescription("Get support server link and important links");

function buildPaleCard(title: string, sections: string[], actionRows: any[] = []) {
    const container = new ContainerBuilder()
        .addTextDisplayComponents((textDisplay: any) => textDisplay.setContent(`## ${title}`));

    for (const section of sections) {
        container
            .addSeparatorComponents((separator: any) => separator)
            .addTextDisplayComponents((textDisplay: any) => textDisplay.setContent(section));
    }

    if (actionRows.length) {
        container
            .addSeparatorComponents((separator: any) => separator)
            .addActionRowComponents(actionRows);
    }

    return container;
}

function createLinkButton(label: string, url: string, emojiKey: string) {
    const button = new ButtonBuilder()
        .setLabel(stripLeadingIcons(label))
        .setStyle(ButtonStyle.Link)
        .setURL(url);

    const emoji = getButtonEmoji(emojiKey);
    if (emoji) button.setEmoji(emoji);

    return button;
}

function withExternalHint(linkText: string): string {
    return `${getEmoji('next')} ${linkText}`;
}

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const lang = await getLang(interaction.guildId);
            const t = lang.support;

            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;

            const supportServerLink = "";
            const githubLink = "https://github.com/Shadow-Black-YT";
            const websiteLink = "";
            const youtubeLink = "";

            const buttonRow = new ActionRowBuilder().addComponents(
                createLinkButton(t.buttons.supportServer, supportServerLink, 'support'),
                createLinkButton(t.buttons.github, githubLink, 'github'),
                createLinkButton(t.buttons.youtube, youtubeLink, 'play')
            );

            const sections = [
                [
                    t.header.title,
                    t.header.subtitle
                ].join('\n'),
                [
                    t.links.title,
                    '',
                    `${getEmoji('support')} ${t.links.supportServer.title}`,
                    t.links.supportServer.description,
                    withExternalHint(t.links.supportServer.link.replace('{url}', supportServerLink)),
                    '',
                    `${getEmoji('github')} ${t.links.github.title}`,
                    t.links.github.description,
                    withExternalHint(t.links.github.link.replace('{url}', githubLink)),
                    '',
                    `${getEmoji('play')} ${t.links.youtube.title}`,
                    t.links.youtube.description,
                    withExternalHint(t.links.youtube.link.replace('{url}', youtubeLink)),
                    '',
                    `${getEmoji('cloud')} ${t.links.website.title}`,
                    t.links.website.description,
                    withExternalHint(t.links.website.link.replace('{url}', websiteLink))
                ].join('\n'),
                [
                    `${getEmoji('info')} ${t.footer.version}`
                ].join('\n')
            ];

            const card = buildPaleCard(`${getEmoji('support')} Support`, sections, [buttonRow]);

            return interaction.editReply({
                components: [card],
                flags: MessageFlags.IsComponentsV2,
            });

        } catch (e) {
            console.error('Error in support command:', e);

            const lang = await getLang(interaction.guildId).catch(() => ({ support: { errors: {} } }));
            const t = lang.support?.errors || {};

            const errorCard = buildPaleCard(
                `${getEmoji('error')} Error`,
                [
                    (t.title || '## ❌ Error') + '\n\n' +
                    (t.message || 'An error occurred while fetching support information.\nPlease try again later.')
                ]
            );

            try {
                if (interaction.deferred || interaction.replied) {
                    return interaction.editReply({
                        components: [errorCard],
                        flags: MessageFlags.IsComponentsV2,
                    });
                } else {
                    return interaction.reply({
                        components: [errorCard],
                        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                    });
                }
            } catch (replyError) {
                return interaction.followUp({
                    content: t.fallback || "❌ An error occurred while fetching support information.",
                    flags: MessageFlags.Ephemeral,
                }).catch(() => {});
            }
        }
    },
};
