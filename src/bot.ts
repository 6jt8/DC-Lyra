import { LyraClient } from "./client/LyraClient.js";
import { config } from "./config.js";
import { initializePlayer } from "./music/player.js";
import { getLavalinkManager } from "./music/lavalink.js";
import { isConnected } from "./database/manager.js";
import { colors } from "./ui/colors.js";
import { getLangSync } from "./utils/language.js";
import { setClient, getAllAvailableEmojis } from "./emoji/emoji.js";
import { restoreAllPlayerSessions } from "./music/player-session-restore.js";
import { CommandRouter } from "./routing/CommandRouter.js";
import { SlashStrategy } from "./routing/strategies/SlashStrategy.js";
import { PrefixStrategy } from "./routing/strategies/PrefixStrategy.js";
import { MentionStrategy } from "./routing/strategies/MentionStrategy.js";
import { shouldSuppressError, getErrorLogMessage } from "./utils/errorHandler.js";
import { loadCommands } from "./utils/commandLoader.js";
import { loadEvents } from "./utils/eventLoader.js";
import { startHealthServer } from "./utils/healthServer.js";
import { gracefulShutdown } from "./utils/shutdown.js";

const router = new CommandRouter();
router.register(new SlashStrategy());

const client = new LyraClient();

if (config.useIntents) {
  router.register(new PrefixStrategy("!", true));
} else {
  router.register(new MentionStrategy(client.user?.id ?? "0", true));
}

const lang = getLangSync();

process.on("unhandledRejection", (error: any) => {
  if (shouldSuppressError(error)) {
    const logMsg = getErrorLogMessage(error);
    if (logMsg) console.warn(`${colors.cyan}${logMsg}${colors.reset}`);
    return;
  }
  console.error(
    lang.console?.bot?.unhandledRejection || "Unhandled Rejection:",
    error
  );
});

process.on("uncaughtException", (error: Error) => {
  if (shouldSuppressError(error)) {
    console.warn(
      getErrorLogMessage(error) ||
        `[ SYSTEM ] Ignoring known error: ${error.message}`
    );
    return;
  }
  console.error(
    lang.console?.bot?.uncaughtException || "Uncaught Exception:",
    error
  );
});

process.on("SIGTERM", () => gracefulShutdown(client, "SIGTERM"));
process.on("SIGINT", () => gracefulShutdown(client, "SIGINT"));

initializePlayer(client).catch((error: Error) => {
  const lang = getLangSync();
  console.error(
    `${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.red}${
      lang.console?.bot?.lavalinkError?.replace("{message}", error.message) ||
      `Error initializing player: ${error.message}`
    }${colors.reset}`
  );
});

client.on("clientReady", async () => {
  const lang = getLangSync();
  console.log(
    `${colors.cyan}[ SYSTEM ]${colors.reset} ${colors.green}${
      lang.console?.bot?.clientLogged?.replace("{tag}", client.user!.tag) ||
      `Client logged as ${client.user!.tag}`
    }${colors.reset}`
  );
  console.log(
    `${colors.cyan}[ MUSIC ]${colors.reset} ${colors.green}${
      lang.console?.bot?.musicSystemReady || "Riffy Music System Ready 🎵"
    }${colors.reset}`
  );

  setClient(client);

  const emojiInfo = getAllAvailableEmojis();
  console.log(
    `${colors.cyan}[ EMOJI ]${colors.reset} ${colors.yellow}Auto-detected ${emojiInfo.fromKeyMapping.length} emoji mappings${colors.reset}`
  );

  if (client.appEmojiManager) {
    try {
      await client.appEmojiManager.syncApplicationEmojis();
    } catch (error: any) {
      console.error(
        `${colors.red}[ EMOJI ]${colors.reset} Failed to sync emojis: ${error.message}`
      );
    }
  }

  const nodeManager = getLavalinkManager();
  if (nodeManager) {
    nodeManager.init(client.user!.id);

    setTimeout(() => {
      const status = nodeManager.getNodeStatus();
      const availableCount = nodeManager.getNodeCount();
      const totalCount = nodeManager.getTotalNodeCount();

      console.log(
        `${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.green}${
          lang.console?.bot?.nodeManagerStatus
            ?.replace("{available}", availableCount)
            .replace("{total}", totalCount) ||
          `Node Manager: ${availableCount}/${totalCount} nodes available`
        }${colors.reset}`
      );

      if (status.nodes.length > 0) {
        console.log(
          `${colors.cyan}[ LAVALINK ]${colors.reset} ${
            lang.console?.bot?.nodeStatus || "Node Status:"
          }`
        );
        for (const node of status.nodes) {
          const statusIcon = node.online
            ? `${colors.green}✅${colors.reset}`
            : `${colors.red}❌${colors.reset}`;
          const statusText = node.online ? "ONLINE" : "OFFLINE";
          const errorText = node.lastError
            ? ` | ${colors.yellow}${node.lastError}${colors.reset}`
            : "";
          const nodeInfo =
            lang.console?.bot?.nodeInfo
              ?.replace("{icon}", statusIcon)
              .replace("{name}", node.name)
              .replace("{host}", node.host)
              .replace("{port}", node.port)
              .replace("{status}", statusText)
              .replace("{error}", errorText) ||
            `  ${statusIcon} ${colors.yellow}${node.name}${colors.reset} (${node.host}:${node.port}) - ${statusText}${errorText}`;
          console.log(nodeInfo);
        }
      }
    }, 3000);
  } else if (client.riffy) {
    client.riffy.init(client.user!.id);
  }
});

  setTimeout(() => {
    restoreAllPlayerSessions(client).catch((err: any) => {
      console.warn(
        `${colors.cyan}[ RESTORE ]${colors.reset} ${colors.red}Failed to restore sessions: ${err?.message || err}${colors.reset}`
      );
    });
  }, 5000);

(async () => {
  await loadEvents(client);
  loadCommands(client, config.commandsDir);
})();

client.login(config.token || process.env.TOKEN).catch((e: Error) => {
  const lang = getLangSync();
  console.log("\n" + "─".repeat(40));
  console.log(
    `${colors.magenta}${colors.bright}${lang.console?.bot?.tokenVerification || "🔐 TOKEN VERIFICATION"}${colors.reset}`
  );
  console.log("─".repeat(40));
  console.log(
    `${colors.cyan}[ TOKEN ]${colors.reset} ${colors.red}${lang.console?.bot?.tokenAuthFailed || "Authentication Failed ❌"}${colors.reset}`
  );
  console.log(
    `${colors.gray}${lang.console?.bot?.tokenError || "Error: Turn On Intents or Reset New Token"}${colors.reset}`
  );
});

// Log database status (initialized in index.ts)
if (isConnected()) {
  const lang = getLangSync();
  console.log(
    `${colors.cyan}[ DATABASE ]${colors.reset} ${colors.green}${lang.console?.bot?.databaseOnline || "Database Online ✅"}${colors.reset}`
  );
} else {
  console.log(
    `${colors.cyan}[ DATABASE ]${colors.reset} ${colors.yellow}Running without database${colors.reset}`
  );
}

const port = config.port || Number(process.env.PORT) || 3000;

startHealthServer(port);

export default client;

