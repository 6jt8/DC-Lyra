import { Message } from "discord.js";
import { colors } from "../ui/colors.js";
import { getLang, getLangSync } from "./language.js";
import { checkRateLimit } from "./rateLimit.js";
import { sanitizeMentions } from "../ui/responseHandler.js";

export interface CommandContext {
  client: any;
  commandName: string;
  args: string[];
  message: Message;
}

export async function dispatchTextCommand(ctx: CommandContext): Promise<unknown> {
  const { client, commandName, args, message } = ctx;

  if (!message.guild) {
    const lang = await getLang(message.guildId ?? undefined);
    return message.reply({
      content: lang.events?.interactionCreate?.noGuild ?? "This command can only be used in a server.",
    });
  }

  const lang = await getLang(message.guildId ?? undefined);
  const command = client.commands.get(commandName);

  if (!command) {
    return;
  }

  const requiredPermissions = command.permissions || "0x0000000000000800";
  if (message.member && !message.member.permissions.has(requiredPermissions)) {
    return message.reply({
      content: lang.events?.interactionCreate?.noPermission ?? "You don't have permission to use this command.",
    });
  }

  const rateCheck = checkRateLimit(message.author.id, 3, 5000);
  if (!rateCheck.allowed) {
    return message.reply({
      content: lang.events?.interactionCreate?.rateLimited
        ?.replace('{seconds}', String(rateCheck.retryAfter)) ??
        `Please slow down. Try again in ${rateCheck.retryAfter} second(s).`,
    });
  }

  try {
    return await command.run(client, message, args);
  } catch (error: any) {
    const consoleLang = getLangSync();
    console.error(
      `${colors.cyan}[ COMMAND ]${colors.reset} ${colors.red}Error executing ${commandName}:${colors.reset}`,
      error
    );

    const safeMessage = sanitizeMentions(error.message || "Unknown error");
    const errorMessage = lang.events?.interactionCreate?.errorOccurred
      ?.replace("{message}", safeMessage) ??
      `An error occurred: ${safeMessage}`;

    try {
      return await message.reply({ content: errorMessage });
    } catch (_) {}
  }
}
