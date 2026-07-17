import { SlashCommandBuilder } from 'discord.js';
import { sendErrorResponse, sendSuccessResponse, handleCommandError } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';
import { checkCurrentTrack } from '../../utils/playerValidation.js';
import { deferOrReturn, replyWithValidation, replyWithVoiceCheck } from '../../utils/music-command-helpers.js';

const data = new SlashCommandBuilder()
  .setName("rewind")
  .setDescription("Rewind the current track by a specified amount")
  .addIntegerOption(option =>
    option.setName("seconds")
      .setDescription("Seconds to rewind (default: 10)")
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(300)
  );

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            if (!await deferOrReturn(interaction)) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.rewind;

            const player = client.riffy.players.get(interaction.guildId);
            const voiceReply = await replyWithVoiceCheck(client, interaction, player);
            if (voiceReply) return voiceReply;

            const trackCheck = await checkCurrentTrack(player, null, interaction.guildId);
            const validationReply = await replyWithValidation(interaction, trackCheck);
            if (validationReply) return validationReply;

            if (!player.current.info.isSeekable) {
                return await sendErrorResponse(
                    interaction,
                    (t.notSeekable?.title || '## ❌ Cannot Rewind') + '\n\n' +
                    (t.notSeekable?.message || 'This track does not support seeking.')
                );
            }

            const seconds = interaction.options.getInteger('seconds') || 10;
            const seekMs = seconds * 1000;
            const newPosition = Math.max(0, player.position - seekMs);

            player.seek(newPosition);

            return await sendSuccessResponse(
                interaction,
                t.success.title + '\n\n' +
                t.success.message.replace('{seconds}', seconds) + '\n' +
                t.success.position.replace('{position}', formatTime(newPosition))
            );

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { rewind: { errors: {} } } }));
            const t = lang.music?.rewind?.errors || {};

            return await handleCommandError(
                interaction,
                error,
                'rewind',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while rewinding.\nPlease try again later.')
            );
        }
    }
};

function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
