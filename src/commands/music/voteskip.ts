import { SlashCommandBuilder } from 'discord.js';
import { sendErrorResponse, sendSuccessResponse, handleCommandError } from '../../ui/responseHandler.js';
import { getLang } from '../../utils/language.js';
import { checkCurrentTrack } from '../../utils/playerValidation.js';
import { deferOrReturn, replyWithValidation, replyWithVoiceCheck } from '../../utils/music-command-helpers.js';

const data = new SlashCommandBuilder()
  .setName("voteskip")
  .setDescription("Vote to skip the current track");

export const voteSkipMap = new Map<string, { voters: Set<string>; requiredVotes: number; trackUri: string }>();

export default {
    data: data,
    run: async (client: any, interaction: any) => {
        try {
            if (!await deferOrReturn(interaction)) return;
            const lang = await getLang(interaction.guildId);
            const t = lang.music.voteskip;

            const player = client.riffy.players.get(interaction.guildId);
            const voiceReply = await replyWithVoiceCheck(client, interaction, player);
            if (voiceReply) return voiceReply;

            const trackCheck = await checkCurrentTrack(player, null, interaction.guildId);
            const validationReply = await replyWithValidation(interaction, trackCheck);
            if (validationReply) return validationReply;

            const voiceChannel = interaction.member.voice.channel;
            const membersInChannel = voiceChannel.members.filter((m: any) => !m.user.bot).size;
            const requiredVotes = Math.ceil(membersInChannel / 2);

            if (!voteSkipMap.has(interaction.guildId)) {
                voteSkipMap.set(interaction.guildId, {
                    voters: new Set(),
                    requiredVotes: requiredVotes,
                    trackUri: player.current.info.uri
                });
            }

            const voteData = voteSkipMap.get(interaction.guildId)!;

            if (voteData.trackUri !== player.current.info.uri) {
                voteSkipMap.set(interaction.guildId, {
                    voters: new Set(),
                    requiredVotes: requiredVotes,
                    trackUri: player.current.info.uri
                });
                voteData.voters = new Set();
                voteData.requiredVotes = requiredVotes;
                voteData.trackUri = player.current.info.uri;
            }

            if (voteData.voters.has(interaction.user.id)) {
                return await sendErrorResponse(
                    interaction,
                    t.alreadyVoted.title + '\n\n' +
                    t.alreadyVoted.message + '\n' +
                    t.alreadyVoted.votes
                        .replace('{current}', voteData.voters.size)
                        .replace('{required}', requiredVotes)
                );
            }

            voteData.voters.add(interaction.user.id);
            const currentVotes = voteData.voters.size;

            if (currentVotes >= requiredVotes) {
                player.stop();
                voteSkipMap.delete(interaction.guildId);

                return await sendSuccessResponse(
                    interaction,
                    t.skipped.title + '\n\n' +
                    t.skipped.message + '\n\n' +
                    t.skipped.votes
                        .replace('{current}', currentVotes)
                        .replace('{required}', requiredVotes) + '\n' +
                    t.skipped.required.replace('{required}', requiredVotes)
                );
            } else {
                return await sendSuccessResponse(
                    interaction,
                    t.success.title + '\n\n' +
                    t.success.message + '\n\n' +
                    t.success.currentVotes
                        .replace('{current}', currentVotes)
                        .replace('{required}', requiredVotes) + '\n' +
                    t.success.required.replace('{required}', requiredVotes) + '\n\n' +
                    t.success.moreNeeded
                        .replace('{count}', requiredVotes - currentVotes)
                        .replace('{plural}', requiredVotes - currentVotes > 1 ? 's' : '')
                );
            }

        } catch (error) {
            const lang = await getLang(interaction.guildId).catch(() => ({ music: { voteskip: { errors: {} } } }));
            const t = lang.music?.voteskip?.errors || {};
            
            return await handleCommandError(
                interaction,
                error,
                'voteskip',
                (t.title || '## ❌ Error') + '\n\n' + (t.message || 'An error occurred while processing the vote.\nPlease try again later.')
            );
        }
    }
};
