import { LyraClient } from "./client/LyraClient.js";
import { config } from "./config.js";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import express from "express";
import { initializePlayer } from "./music/player.js";
import { isConnected } from "./database/manager.js";
import { colors } from "./ui/colors.js";
import { getLavalinkManager } from "./music/lavalink.js";
import { getLang, getLangSync } from "./utils/language.js";
import { setClient, getAllAvailableEmojis } from "./emoji/emoji.js";
import { guildTrackMessages, nowPlayingMessages, progressUpdateIntervals, interactionCollectors, stopCollector } from "./music/player-store.js";
import { restoreAllPlayerSessions } from "./music/player-session-restore.js";
import { CommandRouter } from "./routing/CommandRouter.js";
import { createDashboardRouter } from "./dashboard/server.js";
import { initWebhookLogger, logError } from "./utils/webhookLogger.js";
import { SlashStrategy } from "./routing/strategies/SlashStrategy.js";
import { PrefixStrategy } from "./routing/strategies/PrefixStrategy.js";
import { MentionStrategy } from "./routing/strategies/MentionStrategy.js";

const router = new CommandRouter();
router.register(new SlashStrategy());

const client = new LyraClient();

if (config.useIntents) {
  router.register(new PrefixStrategy("!", true));
} else {
  router.register(new MentionStrategy(client.user?.id ?? "0", true));
}

process.on("unhandledRejection", (error: any) => {
  const lang = getLangSync();

  if (error && error.message && error.message.includes("Queue is empty")) {
    console.warn(
      `${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.yellow}Autoplay attempted with empty queue - ignoring${colors.reset}`
    );
    return;
  }

  if (
    error &&
    error.message &&
    (error.message.includes("track.info") ||
      error.message.includes("thumbnail") ||
      error.message.includes("player.restart is not a function") ||
      error.message.includes("restart is not a function") ||
      error.message.includes("DAVE") ||
      error.message.includes("external sender"))
  ) {
    if (
      error.message.includes("player.restart") ||
      error.message.includes("restart is not a function")
    ) {
      console.warn(
        `${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.yellow}Ignoring Riffy reconnect bug: ${error.message}${colors.reset}`
      );
    }
    if (
      error.message.includes("DAVE") ||
      error.message.includes("external sender")
    ) {
      console.warn(
        `${colors.cyan}[ VOICE ]${colors.reset} ${colors.yellow}DAVE protocol error — connection may need recovery: ${error.message}${colors.reset}`
      );
    }
    return;
  }

  if (error && (error.cause || error.message)) {
    const cause = error.cause || {};
    const errorMsg = error.message || "";
    const causeCode = cause.code || "";
    const causeMessage = cause.message || "";

    if (
      causeCode === "UND_ERR_CONNECT_TIMEOUT" ||
      causeCode === "ECONNRESET" ||
      causeCode === "ECONNREFUSED" ||
      causeCode === "ConnectionRefused" ||
      causeCode === "ENOTFOUND" ||
      causeCode === "UND_ERR_SOCKET" ||
      errorMsg.includes("Connect Timeout") ||
      errorMsg.includes("fetch failed") ||
      errorMsg.includes("ConnectTimeoutError") ||
      errorMsg.includes("ECONNRESET") ||
      errorMsg.includes("socket connection was closed") ||
      errorMsg.includes("There was an Error while Making Node Request") ||
      causeMessage.includes("ECONNRESET") ||
      causeMessage.includes("socket connection was closed") ||
      causeMessage.includes("Unable to connect")
    ) {
      console.warn(
        `${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.yellow}Network error to Lavalink node (${causeCode || "socket"}) - will retry automatically${colors.reset}`
      );
      return;
    }
  }

  console.error(
    lang.console?.bot?.unhandledRejection || "Unhandled Rejection:",
    error
  );
  logError("Unhandled Rejection", error?.message || String(error)).catch(() => {});
});

process.on("uncaughtException", (error: Error) => {
  const lang = getLangSync();
  if (
    error &&
    error.message &&
    (error.message.includes("track.info") ||
      error.message.includes("thumbnail"))
  ) {
    console.warn(
      lang.console?.bot?.riffyThumbnailError?.replace("{message}", error.message) ||
        `[ Riffy ] Ignoring thumbnail error: ${error.message}`
    );
    return;
  }
  console.error(
    lang.console?.bot?.uncaughtException || "Uncaught Exception:",
    error
  );
});

async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n${colors.yellow}[ SHUTDOWN ]${colors.reset} Received ${signal}. Cleaning up...`);
  router.deactivate(client);
  if (client.statusManager) {
    client.statusManager.stopPresenceRefresh();
    await client.statusManager.onPlayerDisconnect().catch(() => {});
  }
  if (client.riffy) {
    for (const [, player] of client.riffy.players) {
      try { player.destroy(); } catch (e) {
        console.warn("[SHUTDOWN] Error destroying player:", e);
      }
    }
  }
  for (const guildId of interactionCollectors.keys()) {
    stopCollector(guildId);
  }
  interactionCollectors.clear();
  progressUpdateIntervals.clear();
  guildTrackMessages.clear();
  nowPlayingMessages.clear();
  try {
    const { getAdapter } = await import('./database/manager.js');
    getAdapter().disconnect?.();
  } catch (_) {}
  client.destroy();
  setTimeout(() => process.exit(0), 2000).unref();
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

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

const INTENT_GATED_EVENTS: Record<string, string> = {
  message: "MessageContent",
  presenceUpdate: "GuildPresences",
  guildMemberAdd: "GuildMembers",
  guildMemberRemove: "GuildMembers",
  guildMemberUpdate: "GuildMembers",
};

async function loadEvents(): Promise<void> {
  const eventsDir = path.resolve(process.cwd(), "src/events");
  let files: string[];
  try {
    files = await fsp.readdir(eventsDir);
  } catch {
    return;
  }

  for (const file of files) {
    if (!file.endsWith(".js") && !file.endsWith(".ts")) continue;

    const eventName = path.basename(file, path.extname(file));

    const requiredIntent = INTENT_GATED_EVENTS[eventName];
    if (requiredIntent && !client.useIntents) {
      console.log(`[EVENT] Skipping ${eventName}: requires ${requiredIntent} intent (USE_INTENTS=false)`);
      continue;
    }

    const filePath = path.join(eventsDir, file);
    const fileUrl = pathToFileURL(filePath).href;

    try {
      const mod = await import(fileUrl);
      const event = mod.default || mod;
      (client as any).on(eventName, event.bind(null, client));
      console.log(`[EVENT] Registered: ${eventName}`);
    } catch (error: any) {
      console.error(`[EVENT] Failed to load ${eventName}: ${error.message}`);
    }
  }
}

loadEvents().catch((err: any) => {
  console.error("[BOT] Failed to load events:", err?.message || err);
});

function loadCommands() {
  const loadCommandsFromDir = (dir: string, category = "") => {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        loadCommandsFromDir(fullPath, item.name);
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
                lang.console?.bot?.commandLoadFailed?.replace(
                  "{name}",
                  item.name
                ) ||
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

  const commandsDir = path.resolve(process.cwd(), config.commandsDir);
  loadCommandsFromDir(commandsDir);
  const lang = getLangSync();
  console.log(
    `${colors.cyan}[ COMMANDS ]${colors.reset} ${colors.green}${
      lang.console?.bot?.commandsLoaded?.replace(
        "{count}",
        String(client.commands.size)
      ) || `Total Commands Loaded: ${client.commands.size}`
    }${colors.reset}`
  );
}

loadCommands();



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

const app = express();
const port = Number(config.port) || Number(process.env.PORT) || 3000;

app.get("/", (req: any, res: any) => {
  const imagePath = path.join(__dirname, "../../index.html");
  res.sendFile(imagePath, (err: any) => {
    if (err) {
      console.error(`${colors.red}[ EXPRESS ]${colors.reset} Failed to send index.html: ${err.message}`);
      res.status(500).send("Status page unavailable");
    }
  });
});

if (config.dashboardEnabled !== false) {
  const dashboardRouter = createDashboardRouter(client);
  app.use(dashboardRouter);
}

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(`${colors.red}[ EXPRESS ]${colors.reset} Server error: ${err.message}`);
  if (res.headersSent) return;
  res.status(500).send("Internal Server Error");
});

app.listen(port, "0.0.0.0", () => {
  console.log("\n" + "─".repeat(40));
  console.log(`${colors.magenta}${colors.bright}🌐 SERVER STATUS${colors.reset}`);
  console.log("─".repeat(40));
  console.log(
    `${colors.cyan}[ SERVER ]${colors.reset} ${colors.green}Online ✅${colors.reset}`
  );
  console.log(
    `${colors.cyan}[ PORT ]${colors.reset} ${colors.yellow}http://localhost:${port}${colors.reset}`
  );
  console.log(
    `${colors.cyan}[ TIME ]${colors.reset} ${colors.gray}${new Date().toISOString().replace("T", " ").split(".")[0]}${colors.reset}`
  );
  console.log(
    `${colors.cyan}[ USER ]${colors.reset} ${colors.yellow}6jt8${colors.reset}`
  );
});

initWebhookLogger();

export default client;

