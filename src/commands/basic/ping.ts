import { SlashCommandBuilder, ContainerBuilder, MessageFlags } from 'discord.js';
import { getLang } from '../../utils/language.js';
import { getEmoji } from '../../emoji/emoji.js';
import { safeDeferReply } from '../../ui/responseHandler.js';

const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Check the bot latency and response time');

function formatUptime(uptime: number): string {
  const seconds = Math.floor((uptime / 1000) % 60);
  const minutes = Math.floor((uptime / (1000 * 60)) % 60);
  const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
  const days = Math.floor(uptime / (1000 * 60 * 60 * 24));

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function buildPaleCard(title: string, sections: string[]) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents((textDisplay: any) => textDisplay.setContent(`## ${title}`));

  for (const section of sections) {
    container
      .addSeparatorComponents((separator: any) => separator)
      .addTextDisplayComponents((textDisplay: any) => textDisplay.setContent(section));
  }

  return container;
}

export default {
  data: data,
  run: async (client: any, interaction: any) => {
    try {
      const lang = await getLang(interaction.guildId);
      const t = lang.ping;

      const start = Date.now();
      const deferred = await safeDeferReply(interaction);
      if (!deferred && !interaction.deferred && !interaction.replied) return;

      const end = Date.now();
      const latency = end - start;
      const websocketPing = client.ws.ping;

      const connectionSpeed = latency < 200
        ? t.metrics.connectionSpeed.excellent
        : latency < 500
          ? t.metrics.connectionSpeed.good
          : t.metrics.connectionSpeed.slow;

      const sections = [
        [
          t.header.title,
          t.header.botName.replace('{botName}', client.user.username)
        ].join('\n'),
        [
          `${getEmoji('ping')} ${t.metrics.responseTime.replace('{latency}', latency)}`,
          `${getEmoji('servers')} ${t.metrics.websocketPing.replace('{ping}', websocketPing)}`,
          `${getEmoji('uptime')} ${t.metrics.botUptime.replace('{uptime}', formatUptime(client.uptime))}`,
          '',
          connectionSpeed
        ].join('\n'),
        [
          `${getEmoji('info')} ${t.footer.version}`
        ].join('\n')
      ];

      const card = buildPaleCard(`${getEmoji('ping')} Ping`, sections);

      return interaction.editReply({
        components: [card],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (e) {
      console.error('Error in ping command:', e);

      const lang = await getLang(interaction.guildId).catch(() => ({ ping: { errors: {} } }));
      const t = lang.ping?.errors || {};

      const errorCard = buildPaleCard(
        `${getEmoji('error')} Error`,
        [
          (t.title || '## ❌ Error') + '\n\n' +
            (t.message || 'An error occurred while checking latency.\nPlease try again later.')
        ]
      );

      try {
        if (interaction.deferred || interaction.replied) {
          return interaction.editReply({
            components: [errorCard],
            flags: MessageFlags.IsComponentsV2,
          });
        }

        return interaction.reply({
          components: [errorCard],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
      } catch (replyError) {
        return interaction.followUp({
          content: t.fallback || '❌ An error occurred while checking latency.',
          flags: MessageFlags.Ephemeral,
        }).catch(() => {});
      }
    }
  },
};
