import { SlashCommandBuilder } from 'discord.js';
import { checkVoiceChannel } from '../../utils/voiceChannel.js';
import { handleCommandError, safeDeferReply, sanitizeMentions } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';
import { getEmoji } from '../../emoji/emoji.js';
import { formatDuration } from '../../music/player-ui.js';

const data = new SlashCommandBuilder()
  .setName("grab")
  .setDescription("Save the current song to your DMs");

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            const deferred = await safeDeferReply(interaction);
            if (!deferred && !interaction.deferred && !interaction.replied) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.grab;

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

            if (!player || !player.current || player.destroyed) {
                return await handleCommandError(
                    interaction,
                    new Error('No track playing'),
                    'grab',
                    (t.errors?.title || '## ❌ Error') + '\n\n' + (t.errors?.message || 'No song is currently playing.')
                );
            }

            const track = player.current;
            const dmContent = t.dm?.title
                ? t.dm.title + '\n\n' +
                  t.dm.track.replace('{title}', sanitizeMentions(track.info.title)).replace('{uri}', track.info.uri) + '\n' +
                  t.dm.artist.replace('{author}', track.info.author) + '\n' +
                  t.dm.duration.replace('{duration}', formatDuration(track.info.length || 0))
                : `## 🎵 Saved Track\n\n**${sanitizeMentions(track.info.title)}**\nBy: ${track.info.author}\nDuration: ${formatDuration(track.info.length || 0)}`;

            try {
                await interaction.member.send({ content: dmContent });
            } catch {
                return await handleCommandError(
                    interaction,
                    new Error('Cannot DM user'),
                    'grab',
                    (t.errors?.dmFail?.title || '## ❌ DMs Disabled') + '\n\n' + (t.errors?.dmFail?.message || 'Please enable DMs from server members to receive the track info.')
                );
            }

            const reply = await interaction.editReply({
                content: (t.success?.title || '## ✅ Check your DMs') + '\n\n' + (t.success?.message || 'I have sent you the current song details via DM.'),
                fetchReply: true
            });
            setTimeout(() => reply.delete().catch(() => {}), 5000);
            return reply;

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { grab: { errors: {} } } }));
            const t = lang.music?.grab?.errors || {};

            return await handleCommandError(
                interaction,
                error,
                'grab',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while grabbing the song.\nPlease try again later.')
            );
        }
    }
};
