import type { BotConfig } from "./config";
import type { ApplicationEmojiManager } from "../emoji/manager";
import type { StatusManager } from "../utils/statusManager";
import type { LavalinkNodeManager } from "../music/lavalink";
import type { Riffy } from "riffy";
import type { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";

declare module "discord.js" {
  interface Client {
    config: BotConfig;
    riffy: Riffy;
    lavalinkManager: LavalinkNodeManager;
    nodeManager: LavalinkNodeManager;
    commands: Map<string, { data: { name: string; toJSON: () => RESTPostAPIApplicationCommandsJSONBody }; run: (...args: any[]) => any }>;
    commandsArray: RESTPostAPIApplicationCommandsJSONBody[];
    emojiManager: ApplicationEmojiManager;
    statusManager: StatusManager;
    errorLog: string;
  }
}
