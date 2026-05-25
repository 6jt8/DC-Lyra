import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { checkVoiceChannel } from '../../utils/voiceChannel.js';
import { checkCurrentTrack } from '../../utils/playerValidation.js';
import { handleCommandError, safeDeferReply, buildPaleCard, sanitizeTitle } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';
import { getEmoji } from '../../emoji/emoji.js';

const data = new SlashCommandBuilder()
  .setName("np")
  .setDescription("Displays the currently playing song with a progress bar");

function createProgressBar(current: number, total: number, length = 20) {
    const progress = Math.round((current / total) * length);
    const emptyProgress = length - progress;

    const progressText = '▓'.repeat(progress); 
    const emptyProgressText = '░'.repeat(emptyProgress); 
    const time = new Date(current * 1000).toISOString().substr(11, 8);
    const endTime = new Date(total * 1000).toISOString().substr(11, 8);

    return `\`${time}\` ${progressText}${emptyProgressText} \`${endTime}\``;
}

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.np;

            const player = client.riffy.players.get(interaction.guildId);
            const check = await checkVoiceChannel(interaction, player);
            
            if (!check.allowed) {
                const reply = await interaction.editReply({
                    ...check.response,
                    fetchReply: true
                });
                setTimeout(() => reply.delete().catch(() => {}), 5000);
                return reply;
            }

            const trackCheck = await checkCurrentTrack(player, null, interaction.guildId);
            
            if (!trackCheck.valid) {
                const reply = await interaction.editReply({
                    ...trackCheck.response,
                    fetchReply: true
                });
                setTimeout(() => reply.delete().catch(() => {}), 5000);
                return reply;
            }

            const progressBar = createProgressBar(player.position / 1000, player.current.info.length / 1000);
            const card = buildPaleCard(
                `${getEmoji('music')} ${sanitizeTitle(t.title, 'Now Playing')}`,
                [
                    `### ${getEmoji('play')} Track\n` +
                    t.nowPlaying
                        .replace('{title}', player.current.info.title)
                        .replace('{uri}', player.current.info.uri) + '\n' +
                    `${getEmoji('users')} ` + t.by.replace('{author}', player.current.info.author),
                    `### ${getEmoji('uptime')} Progress\n${progressBar}`
                ]
            );

            const reply = await interaction.editReply({
                components: [card],
                flags: MessageFlags.IsComponentsV2,
                fetchReply: true
            });
            setTimeout(() => reply.delete().catch(() => {}), 3000);
            return reply;

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { np: { errors: {} } } }));
            const t = lang.music?.np?.errors || {};
            
            return await handleCommandError(
                interaction,
                error,
                'np',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while fetching the current track.\nPlease try again later.')
            );
        }
    },
};
