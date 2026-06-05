import {
  ContainerBuilder,
  MessageFlags,
  Interaction,
  Message,
} from "discord.js";
import { config } from "../config.js";
import { getEmoji } from "../emoji/emoji.js";
import { getLang, getLangSync } from "../utils/language.js";

export function stripLeadingIcons(text: string): string {
  return String(text || "")
    .replace(/^\s*<a?:\w+:\d+>\s*/u, "")
    .replace(/^\s*[^\p{L}\p{N}#]+/u, "")
    .trim();
}

export function sanitizeTitle(rawTitle: string, fallback = "Response"): string {
  const firstLine = String(rawTitle || "")
    .replace(/\r/g, "")
    .split("\n")[0]
    .trim();
  const clean = stripLeadingIcons(
    firstLine.replace(/^#{1,6}\s*/, "").trim()
  );
  return clean || fallback;
}

function titleHasIcon(title: string): boolean {
  const value = String(title || "").trim();
  if (!value) return false;

  return /^(<a?:\w+:\d+>|[\u2190-\u2BFF\u{1F000}-\u{1FAFF}])/u.test(value);
}

function pickTitleIconKey(
  title: string,
  fallbackTitle: string
): string {
  const text = `${title || ""} ${fallbackTitle || ""}`.toLowerCase();

  if (/error|failed|invalid|denied|not found|empty/.test(text))
    return "error";
  if (
    /success|added|created|updated|saved|enabled|disabled|removed|deleted/.test(
      text
    )
  )
    return "success";
  if (/queue/.test(text)) return "queue";
  if (/search|result/.test(text)) return "search";
  if (/playlist/.test(text)) return "playlist";
  if (/play|track|music|song|player/.test(text)) return "music";
  if (/volume|audio|voice/.test(text)) return "volume";
  if (/support|help/.test(text)) return "support";
  if (/warn|caution/.test(text)) return "warning";

  return "info";
}

function withTitleIcon(
  title: string,
  fallbackTitle = "Response"
): string {
  const cleanTitle = sanitizeTitle(title, fallbackTitle);
  if (titleHasIcon(cleanTitle)) return cleanTitle;

  const iconKey = pickTitleIconKey(cleanTitle, fallbackTitle);
  const icon = getEmoji(iconKey);
  return icon ? `${icon} ${cleanTitle}` : cleanTitle;
}

function splitMessageSections(message: string): string[] {
  return String(message || "")
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function buildPaleCard(
  title: string,
  sections: string[] = []
): ContainerBuilder {
  const container = new ContainerBuilder().addTextDisplayComponents(
    (textDisplay: any) =>
      textDisplay.setContent(`## ${withTitleIcon(title, "Response")}`)
  );

  for (const section of sections) {
    container
      .addSeparatorComponents((separator: any) => separator)
      .addTextDisplayComponents((textDisplay: any) =>
        textDisplay.setContent(section)
      );
  }

  return container;
}

export function cardFromMessage(
  message: string,
  fallbackTitle = "Response"
): ContainerBuilder {
  const sections = splitMessageSections(message);
  if (!sections.length) {
    return buildPaleCard(fallbackTitle, ["No content available."]);
  }

  let title = fallbackTitle;
  let bodySections = sections;

  if (/^#{1,6}\s*/.test(sections[0])) {
    title = sanitizeTitle(sections[0], fallbackTitle);
    bodySections = sections.slice(1);
  }

  return buildPaleCard(
    title,
    bodySections.length ? bodySections : [sections[0]]
  );
}

function isAcknowledgeError(error: any): boolean {
  const code = error?.code;
  const message = String(error?.message || "").toLowerCase();

  return (
    code === 40060 ||
    code === 10062 ||
    message.includes("already been acknowledged") ||
    message.includes("unknown interaction")
  );
}

export async function safeDeferReply(
  interaction: any,
  options = {}
): Promise<boolean> {
  if (!interaction || interaction.deferred || interaction.replied) {
    return true;
  }

  try {
    await interaction.deferReply(options);
    return true;
  } catch (error: any) {
    if (isAcknowledgeError(error)) {
      return interaction.deferred || interaction.replied;
    }

    throw error;
  }
}

export async function safeDeferUpdate(
  interaction: any
): Promise<boolean> {
  if (!interaction || interaction.deferred || interaction.replied) {
    return true;
  }

  try {
    await interaction.deferUpdate();
    return true;
  } catch (error: any) {
    if (isAcknowledgeError(error)) {
      return interaction.deferred || interaction.replied;
    }

    throw error;
  }
}

export function getEmbedColor(color?: string): number {
  if (color) {
    return parseInt(color.replace("#", ""), 16);
  }
  return parseInt(
    config.embedColor?.replace("#", "") || "1db954",
    16
  );
}

function scheduleReplyDeletion(
  interaction: any,
  reply: any,
  deleteAfter: number
): void {
  if (!(deleteAfter > 0)) return;

  setTimeout(async () => {
    try {
      if (interaction && (interaction.deferred || interaction.replied)) {
        await interaction.deleteReply();
        return;
      }
    } catch {}

    try {
      await reply?.delete?.();
    } catch {}
  }, deleteAfter);
}

export async function sendErrorResponse(
  interaction: any,
  message: string,
  deleteAfter = 5000
): Promise<any> {
  const errorContainer = cardFromMessage(message, "Error");

  let reply;
  if (interaction.deferred || interaction.replied) {
    reply = await interaction.editReply({
      components: [errorContainer],
      flags: MessageFlags.IsComponentsV2,
      fetchReply: true,
    });
  } else {
    reply = await interaction.reply({
      components: [errorContainer],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      fetchReply: true,
    });
  }

  scheduleReplyDeletion(interaction, reply, deleteAfter);

  return reply;
}

export async function sendSuccessResponse(
  interaction: any,
  message: string,
  _color: string | null = null,
  deleteAfter = 3000
): Promise<any> {
  const successContainer = cardFromMessage(message, "Success");

  let reply;
  if (interaction.deferred || interaction.replied) {
    reply = await interaction.editReply({
      components: [successContainer],
      flags: MessageFlags.IsComponentsV2,
      fetchReply: true,
    });
  } else {
    reply = await interaction.reply({
      components: [successContainer],
      flags: MessageFlags.IsComponentsV2,
      fetchReply: true,
    });
  }

  scheduleReplyDeletion(interaction, reply, deleteAfter);

  return reply;
}

export async function handleCommandError(
  interaction: any,
  error: Error,
  commandName: string,
  customMessage: string | null = null
): Promise<any> {
  if ((error as any)?.code !== 10008 && (error as any)?.status !== 404) {
    console.error(`Error processing ${commandName} command:`, error);
  }

  const lang = await getLang(interaction.guildId).catch(() => {
    return getLangSync();
  });

  const utils = lang?.utils || {};
  const responseHandler = utils?.responseHandler || {
    defaultError: {
      title: "## ❌ Error",
      message: "An error occurred while processing the command.",
      note: "Please try again later.",
    },
    commandError:
      "❌ An error occurred while processing the {commandName} command.",
  };

  const errorMessage =
    customMessage ||
    `${responseHandler.defaultError.title}\n\n${responseHandler.defaultError.message}\n${responseHandler.defaultError.note}`;

  const errorContainer = cardFromMessage(errorMessage, "Error");

  try {
    if (interaction.deferred || interaction.replied) {
      const reply = await interaction.editReply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2,
        fetchReply: true,
      });
      scheduleReplyDeletion(interaction, reply, 5000);
      return reply;
    } else {
      const reply = await interaction.reply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        fetchReply: true,
      });
      scheduleReplyDeletion(interaction, reply, 5000);
      return reply;
    }
  } catch (e) {
    const errorText = responseHandler.commandError.replace(
      "{commandName}",
      commandName
    );
    return interaction
      .followUp({
        content: errorText,
        flags: MessageFlags.Ephemeral,
      })
      .catch(() => {});
  }
}
