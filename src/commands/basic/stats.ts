import { SlashCommandBuilder, ContainerBuilder, MessageFlags, version as djsVersion } from 'discord.js';
import * as os from 'os';
import { getLang } from '../../utils/language.js';
import { getEmoji } from '../../emoji/emoji.js';
import { safeDeferReply } from '../../ui/responseHandler.js';

const data = new SlashCommandBuilder()
  .setName("stats")
  .setDescription("Show bot statistics and server information");

function formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
            const t = lang.stats;

            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;

            const player = client.riffy.players.get(interaction.guildId);
            const activePlayers = Array.from(client.riffy.players.values()).filter((p: any) => p.playing || p.paused);
            const totalPlayers = client.riffy.players.size;

            const memoryUsage = process.memoryUsage();
            const totalMemory = os.totalmem();
            const freeMemory = os.freemem();
            const usedMemory = totalMemory - freeMemory;

            const currentTrack = player?.current
                ? (player.current.info.title.length > 40
                    ? player.current.info.title.substring(0, 40) + '...'
                    : player.current.info.title)
                : 'None';

            const sections = [
                [
                    t.header.title,
                    t.header.botName.replace('{botName}', client.user.username)
                ].join('\n'),
                [
                    t.botInfo.title,
                    `${getEmoji('servers')} ${t.botInfo.servers.replace('{count}', client.guilds.cache.size.toLocaleString())}`,
                    `${getEmoji('users')} ${t.botInfo.users.replace('{count}', client.users.cache.size.toLocaleString())}`,
                    `${getEmoji('folder')} ${t.botInfo.channels.replace('{count}', client.channels.cache.size.toLocaleString())}`,
                    `${getEmoji('uptime')} ${t.botInfo.uptime.replace('{uptime}', formatUptime(client.uptime))}`,
                    `${getEmoji('ping')} ${t.memory.ping.replace('{ping}', client.ws.ping)}`
                ].join('\n'),
                [
                    t.musicStats.title,
                    `${getEmoji('music')} ${t.musicStats.activePlayers.replace('{count}', activePlayers.length)}`,
                    `${getEmoji('queue')} ${t.musicStats.totalPlayers.replace('{count}', totalPlayers)}`,
                    `${getEmoji('play')} ${t.musicStats.currentTrack.replace('{track}', currentTrack)}`
                ].join('\n'),
                [
                    t.systemInfo.title,
                    `${getEmoji('tools')} ${t.systemInfo.cpu.replace('{cpu}', os.cpus()[0].model.substring(0, 35) + '...')}`,
                    `${getEmoji('servers')} ${t.systemInfo.platform.replace('{platform}', os.platform())}`,
                    `${getEmoji('settings')} ${t.systemInfo.nodejs.replace('{version}', process.version)}`,
                    `${getEmoji('commands')} ${t.systemInfo.discordjs.replace('{version}', djsVersion)}`,
                    ''
                ].join('\n'),
                [
                    t.memory.title,
                    `${t.memory.used.replace('{used}', formatBytes(memoryUsage.heapUsed))} • ${t.memory.total.replace('{total}', formatBytes(memoryUsage.heapTotal))}`,
                    `${t.memory.systemUsed.replace('{used}', formatBytes(usedMemory))} • ${t.memory.systemFree.replace('{free}', formatBytes(freeMemory))}`,
                    `${t.memory.shards.replace('{count}', client.shard?.count || 1)} • ${t.memory.commands.replace('{count}', client.commands.size)}`
                ].join('\n')
            ];

            const card = buildPaleCard(`${getEmoji('commands')} Stats`, sections);

            return interaction.editReply({
                components: [card],
                flags: MessageFlags.IsComponentsV2,
            });

        } catch (error) {
            console.error('Error processing stats command:', error);

            const lang = await getLang(interaction.guildId).catch(() => ({ stats: { errors: {} } }));
            const t = lang.stats?.errors || {};

            const errorCard = buildPaleCard(
                `${getEmoji('error')} Error`,
                [
                    (t.title || '## ❌ Error') + '\n\n' +
                    (t.message || 'An error occurred while retrieving statistics.\nPlease try again later.')
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
            } catch (e) {
                return interaction.followUp({
                    content: t.fallback || "❌ An error occurred while retrieving statistics.",
                    flags: MessageFlags.Ephemeral,
                }).catch(() => {});
            }
        }
    }
};
