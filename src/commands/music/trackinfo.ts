import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { checkVoiceChannel } from '../../utils/voiceChannel.js';
import { checkCurrentTrack } from '../../utils/playerValidation.js';
import { handleCommandError, safeDeferReply, buildPaleCard, sanitizeTitle } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';
import { getEmoji } from '../../emoji/emoji.js';
import { formatDuration } from '../../music/player-ui.js';

const data = new SlashCommandBuilder()
  .setName("trackinfo")
  .setDescription("Show detailed information about the current track");

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.trackinfo;

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

            const track = player.current.info;
            const position = player.position;
            const duration = track.length;
            const progress = Math.round((position / duration) * 100);

            const loopText = player.loop === 'none' ? 'Off' : player.loop === 'track' ? 'Track' : 'Queue';
            const statusText = player.paused ? '?? Paused' : '?? Playing';

            const card = buildPaleCard(
                `${getEmoji('info')} ${sanitizeTitle(t.trackInfo.title, 'Track Info')}`,
                [
                    `### ${getEmoji('music')} Track` + '\n' +
                    t.trackInfo.titleLabel
                        .replace('{title}', track.title)
                        .replace('{uri}', track.uri) + '\n' +
                    t.trackInfo.artist.replace('{artist}', track.author || 'Unknown') + '\n' +
                    t.trackInfo.duration.replace('{duration}', formatDuration(duration)) + '\n' +
                    t.trackInfo.source.replace('{source}', track.sourceName || 'Unknown'),
                    `### ${getEmoji('uptime')} Progress` + '\n' +
                    t.progress.current.replace('{current}', formatDuration(position)) + '\n' +
                    t.progress.total.replace('{total}', formatDuration(duration)) + '\n' +
                    t.progress.progress.replace('{progress}', progress),
                    `### ${getEmoji('settings')} Player Status` + '\n' +
                    t.status.volume.replace('{volume}', player.volume) + '\n' +
                    t.status.loop.replace('{loop}', loopText) + '\n' +
                    t.status.status.replace('{status}', statusText) + '\n' +
                    t.status.queue
                        .replace('{count}', player.queue.length)
                        .replace('{plural}', player.queue.length !== 1 ? 's' : '')
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
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { trackinfo: { errors: {} } } }));
            const t = lang.music?.trackinfo?.errors || {};
            
            return await handleCommandError(
                interaction,
                error,
                'trackinfo',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while retrieving track information.\nPlease try again later.')
            );
        }
    }
};
