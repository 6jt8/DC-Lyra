import { checkVoiceChannel } from "./voiceChannel.js";
import { safeDeferReply } from "../ui/responseHandler.js";

export async function deferOrReturn(interaction: any): Promise<boolean> {
  const deferred = await safeDeferReply(interaction);
  return deferred || interaction.deferred || interaction.replied;
}

export async function replyWithVoiceCheck(
  client: any,
  interaction: any,
  player: any,
  deleteAfter = 5000
): Promise<any | null> {
  const check = await checkVoiceChannel(interaction, player);
  if (check.allowed) return null;

  const reply = await interaction.editReply({
    ...check.response,
    fetchReply: true,
  });
  setTimeout(() => reply.delete().catch(() => {}), deleteAfter);
  return reply;
}

export async function replyWithValidation(
  interaction: any,
  validation: { valid: boolean; response?: any },
  deleteAfter = 5000
): Promise<any | null> {
  if (validation.valid) return null;

  const reply = await interaction.editReply({
    ...validation.response,
    fetchReply: true,
  });
  setTimeout(() => reply.delete().catch(() => {}), deleteAfter);
  return reply;
}
