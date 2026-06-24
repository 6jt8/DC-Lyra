import { config } from "../config.js";

let webhookClient: any = null;

export async function initWebhookLogger(): Promise<void> {
  const url = config.errorLog;
  if (!url || !url.startsWith("http")) return;
  try {
    const { WebhookClient } = await import("discord.js");
    webhookClient = new WebhookClient({ url });
  } catch (_) {
    webhookClient = null;
  }
}

export async function logError(
  title: string,
  description: string,
  fields: { name: string; value: string; inline?: boolean }[] = []
): Promise<void> {
  if (!webhookClient) return;
  try {
    await webhookClient.send({
      embeds: [
        {
          title,
          description: description.slice(0, 2000),
          color: 0xe11d2e,
          fields: fields.slice(0, 25),
          timestamp: new Date().toISOString(),
        },
      ],
    });
  } catch (_) {}
}

export function getWebhookClient(): any {
  return webhookClient;
}
