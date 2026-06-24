import { MessageFlags } from "discord.js";
import { cardFromMessage } from "../ui/responseHandler.js";

const buttonCooldowns = new Map<string, number>();

const BUTTON_COOLDOWN_MS = 1500;

export function checkButtonCooldown(
  guildId: string,
  userId: string
): { allowed: boolean; remaining: number } {
  const key = `${guildId}:${userId}`;
  const now = Date.now();
  const lastUsed = buttonCooldowns.get(key);
  if (lastUsed && now - lastUsed < BUTTON_COOLDOWN_MS) {
    return {
      allowed: false,
      remaining: BUTTON_COOLDOWN_MS - (now - lastUsed),
    };
  }
  buttonCooldowns.set(key, now);
  return { allowed: true, remaining: 0 };
}

export function clearButtonCooldowns(guildId: string): void {
  for (const key of buttonCooldowns.keys()) {
    if (key.startsWith(`${guildId}:`)) {
      buttonCooldowns.delete(key);
    }
  }
}

export async function sendToast(
  channel: any,
  message: string,
  title: string = "Notice",
  deleteMs: number = 4000
): Promise<any> {
  const container = cardFromMessage(message, title);
  const sent = await channel
    .send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    })
    .catch(() => null);
  if (sent) {
    setTimeout(() => sent.delete().catch(() => {}), deleteMs);
  }
  return sent;
}
