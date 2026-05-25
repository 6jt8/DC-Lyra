import { Client, GatewayIntentBits, Collection } from "discord.js";
import { config } from "../config.js";
import { ApplicationEmojiManager } from "../emoji/manager.js";
import path from "path";

export class LyraClient extends Client {
  public config = config;
  public commands = new Collection<string, any>();
  public commandsArray: any[] = [];
  public riffy: any = null;
  public lavalinkManager: any = null;
  public nodeManager: any = null;
  public appEmojiManager: ApplicationEmojiManager | null = null;
  public statusManager: any = null;
  public errorLog: string = "";

  constructor() {
    super({
      intents: Object.keys(GatewayIntentBits).map(
        (a) => (GatewayIntentBits as any)[a]
      ),
      allowedMentions: { parse: [], repliedUser: true },
      sweepers: {
        messages: {
          interval: 300,
          lifetime: 900,
        },
      },
    });

    if (config.applicationEmojis?.enabled !== false) {
      this.appEmojiManager = new ApplicationEmojiManager(this, {
        emojiDir: path.resolve(process.cwd(), config.applicationEmojis.emojiDir || "./icoms"),
        cacheFile: path.join(process.cwd(), "emoji-cache.json"),
        manifestFile: path.join(process.cwd(), "emoji-manifest.json"),
        deleteMissing: config.applicationEmojis?.deleteMissing || false,
        autoSync: config.applicationEmojis?.autoSync !== false,
      });
    }
  }
}
