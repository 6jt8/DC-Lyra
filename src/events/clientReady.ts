import { config } from "../config.js";
import { colors } from "../ui/colors.js";
import { getLangSync } from "../utils/language.js";
import { StatusManager } from "../utils/statusManager.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";

export default async (client: any) => {
  try {
    const lang = getLangSync();
    const rest = new REST({ version: "10" }).setToken(
      config.token || process.env.TOKEN || ""
    );

    const commandsArray = client.commandsArray || [];

    if (commandsArray.length === 0) {
      console.error(
        `${colors.cyan}[ REST ]${colors.reset} ${colors.red}No commands to register!${colors.reset}`
      );
      return;
    }

    try {
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: commandsArray,
      });

      console.log(
        `${colors.cyan}[ REST ]${colors.reset} ${colors.green}${
          lang.console?.events?.rest?.commandsRegistered?.replace(
            "{count}",
            commandsArray.length
          ) ||
          `Successfully registered ${commandsArray.length} application (/) commands globally ✅`
        }${colors.reset}`
      );
    } catch (error: any) {
      console.error(
        `${colors.cyan}[ REST ]${colors.reset} ${colors.red}${lang.console?.events?.rest?.commandsFailed || "Failed to register commands ❌"}${colors.reset}`
      );
      console.error(
        `${colors.gray}${lang.console?.events?.rest?.error?.replace("{message}", error.message) || `Error: ${error.message}`}${colors.reset}`
      );
      if (error.rawError) {
        console.error(
          `${colors.gray}${lang.console?.events?.rest?.details?.replace("{details}", JSON.stringify(error.rawError, null, 2)) || `Details: ${JSON.stringify(error.rawError, null, 2)}`}${colors.reset}`
        );
      }
    }
  } catch (error: any) {
    const lang = getLangSync();
    console.error(
      `${colors.cyan}[ REST ]${colors.reset} ${colors.red}${lang.console?.events?.rest?.commandsFailed || "Failed to register commands ❌"}${colors.reset}`
    );
    console.error(
      `${colors.gray}${lang.console?.events?.rest?.error?.replace("{message}", error.message) || `Error: ${error.message}`}${colors.reset}`
    );
    if (error.rawError) {
      console.error(
        `${colors.gray}${lang.console?.events?.rest?.details?.replace("{details}", JSON.stringify(error.rawError, null, 2)) || `Details: ${JSON.stringify(error.rawError, null, 2)}`}${colors.reset}`
      );
    }
  }

  client.statusManager = new StatusManager(client);
  await client.statusManager.setDefaultStatus();
  client.statusManager.startPresenceRefresh();

  client.errorLog = config.errorLog;
};
