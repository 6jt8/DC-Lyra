import "dotenv/config";
import { BotConfig } from "./types/config.js";
import path from "path";

let parsedNodes = [];
if (process.env.LAVALINK_NODES) {
  try {
    parsedNodes = JSON.parse(process.env.LAVALINK_NODES);
  } catch (error) {
    console.error("Failed to parse LAVALINK_NODES environment variable:", error);
  }
}

export const config: BotConfig = {
  token: process.env.TOKEN || "",
  clientId: process.env.CLIENT_ID || "",
  language: "en",
  ownerID: process.env.OWNER_ID ? process.env.OWNER_ID.split(",") : [""],
  databaseUrl: process.env.DATABASE_URL || "",
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID || "",
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
  setupFilePath: "./src/commands/setup.json",
  commandsDir: "./src/commands",
  port: Number(process.env.PORT) || 3000,
  embedColor: process.env.EMBED_COLOR || "#e11d2e",
  customEmoji: true,
  emojiTheme: "redwhite",
  helpBannerUrl: "",
  activityName: process.env.ACTIVITY_NAME || "YouTube Music | Lyra",
  activityType: process.env.ACTIVITY_TYPE || "PLAYING",
  links: {
    supportServer: "",
    github: "https://github.com/6jt8",
    website: "",
  },
  embedTimeout: 5,
  showProgressBar: true,
  showVisualizer: true,
  generateSongCard: true,
  metadataTag: true,
  lowMemoryMode: false,
  progressUpdateInterval: Number(process.env.PROGRESS_UPDATE_INTERVAL) || 15000,
  errorLog: "",
  applicationEmojis: {
    enabled: true,
    autoSync: true,
    deleteMissing: false,
    emojiDir: "./icoms",
  },
  nodes: parsedNodes,
  useIntents: process.env.USE_INTENTS === "true",
};

