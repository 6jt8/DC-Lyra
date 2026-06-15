import { LyraClient } from "./client/LyraClient.js";
import { config } from "./config.js";
import fs from "fs";
import path from "path";
import express from "express";
import { GatewayDispatchEvents } from "discord.js";
import { initializePlayer } from "./music/player.js";
import { isConnected } from "./database/manager.js";
import { colors } from "./ui/colors.js";
import { getLavalinkManager } from "./music/lavalink.js";
import { getLang, getLangSync } from "./utils/language.js";
import { setClient, getAllAvailableEmojis } from "./emoji/emoji.js";
import { cleanupTrackMessages } from "./music/player-cleanup.js";
import { guildTrackMessages, nowPlayingMessages, progressUpdateIntervals, interactionCollectors } from "./music/player-store.js";
import { stopCollector, restartCollector } from "./music/player-store.js";
import { restoreAllPlayerSessions } from "./music/player-session-restore.js";

const client = new LyraClient();

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
      error.message.includes("restart is not a function"))
  ) {
    if (
      error.message.includes("player.restart") ||
      error.message.includes("restart is not a function")
    ) {
      console.warn(
        `${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.yellow}Ignoring Riffy reconnect bug: ${error.message}${colors.reset}`
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

function gracefulShutdown(signal: string): void {
  console.log(`\n${colors.yellow}[ SHUTDOWN ]${colors.reset} Received ${signal}. Cleaning up...`);
  if (client.statusManager) {
    client.statusManager.stopPresenceRefresh();
    client.statusManager.onPlayerDisconnect().catch(() => {});
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
  client.destroy();
  process.exit(0);
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

fs.readdir(path.join(__dirname, "events"), (_err, files) => {
  if (_err || !files) return;
  files.forEach((file) => {
    if (!file.endsWith(".js") && !file.endsWith(".ts")) return;
    const mod = require(path.join(__dirname, "events", file));
    const event = mod.default || mod;
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
    delete require.cache[require.resolve(path.join(__dirname, "events", file))];
  });
});

const loadCommands = () => {
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

  const commandsDir = path.resolve(__dirname, config.commandsDir);
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
};

loadCommands();

client.on("raw", (d: any) => {
  if (
    ![GatewayDispatchEvents.VoiceStateUpdate, GatewayDispatchEvents.VoiceServerUpdate].includes(
      d.t
    )
  )
    return;
  if (config.voiceDebug === true) {
    if (d.t === GatewayDispatchEvents.VoiceStateUpdate) {
      const isBot = d.d?.user_id === client.user?.id;
      console.log(
        `[ VOICE DEBUG ] raw=${d.t} guild=${d.d?.guild_id || "null"} botUser=${isBot} channel=${d.d?.channel_id || "null"} sessionId=${d.d?.session_id ? "yes" : "no"}`
      );
    } else {
      console.log(
        `[ VOICE DEBUG ] raw=${d.t} guild=${d.d?.guild_id || "null"} endpoint=${d.d?.endpoint ? "yes" : "no"} token=${d.d?.token ? "yes" : "no"}`
      );
    }
  }
  client.riffy.updateVoiceState(d);
});

client.on("guildDelete", async (guild: any) => {
  const guildId = guild.id;
  const player = client.riffy?.players?.get(guildId);
  if (player && !player.destroyed) {
    await cleanupTrackMessages(client, player).catch(() => {});
    client.statusManager?.onPlayerDisconnect(guildId).catch(() => {});
    try {
      player.destroy();
    } catch (e) {
      console.warn(`[GUILD DELETE] Error destroying player for ${guildId}:`, e);
    }
  } else {
    client.statusManager?.clearVoiceChannelStatus(guildId).catch(() => {});
  }
  stopCollector(guildId);
  progressUpdateIntervals.delete(guildId);
  guildTrackMessages.delete(guildId);
  nowPlayingMessages.delete(guildId);
});

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
const port = config.port || process.env.PORT || 3000;
app.get("/", (req: any, res: any) => {
  const imagePath = path.join(__dirname, "../../index.html");
  res.sendFile(imagePath, (err: any) => {
    if (err) {
      console.error(`${colors.red}[ EXPRESS ]${colors.reset} Failed to send index.html: ${err.message}`);
      res.status(500).send("Status page unavailable");
    }
  });
});
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(`${colors.red}[ EXPRESS ]${colors.reset} Server error: ${err.message}`);
  if (res.headersSent) return;
  res.status(500).send("Internal Server Error");
});

app.listen(port, () => {
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
    `${colors.cyan}[ USER ]${colors.reset} ${colors.yellow}sayrox106${colors.reset}`
  );
});

export default client;

