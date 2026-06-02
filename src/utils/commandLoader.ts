import fs from "fs";
import path from "path";
import { colors } from "../ui/colors.js";
import { getLangSync } from "../utils/language.js";

export function loadCommands(client: any, commandsDir: string): void {
  const loadCommandsFromDir = (dir: string) => {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        loadCommandsFromDir(fullPath);
      } else if (item.isFile() && (item.name.endsWith(".js") || item.name.endsWith(".ts"))) {
        try {
          const absolutePath = path.resolve(fullPath);
          const mod = require(absolutePath);
          const command = mod.default || mod;

          if (command.data && command.run) {
            client.commands.set(command.data.name, command);
            client.commandsArray.push(command.data.toJSON());
          } else {
            const lang = getLangSync();
            console.log(
              `${colors.cyan}[ COMMANDS ]${colors.reset} ${colors.red}${
                lang.console?.bot?.commandLoadFailed?.replace("{name}", item.name) ||
                `Failed to load: ${item.name} - Missing data or run property`
              }${colors.reset}`
            );
          }
        } catch (error: any) {
          const lang = getLangSync();
          console.error(
            `${colors.cyan}[ COMMANDS ]${colors.reset} ${colors.red}${
              lang.console?.bot?.commandLoadError
                ?.replace("{name}", item.name)
                .replace("{message}", error.message) ||
              `Error loading ${item.name}: ${error.message}`
            }${colors.reset}`
          );
        }
      }
    }
  };

  const resolvedDir = path.resolve(process.cwd(), commandsDir);
  loadCommandsFromDir(resolvedDir);
  const lang = getLangSync();
  console.log(
    `${colors.cyan}[ COMMANDS ]${colors.reset} ${colors.green}${
      lang.console?.bot?.commandsLoaded?.replace("{count}", String(client.commands.size)) ||
      `Total Commands Loaded: ${client.commands.size}`
    }${colors.reset}`
  );
}
