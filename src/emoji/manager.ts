import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Client } from "discord.js";
import { colors } from "../ui/colors.js";

interface ManagerConfig {
  emojiDir?: string;
  cacheFile?: string;
  manifestFile?: string;
  deleteMissing?: boolean;
  autoSync?: boolean;
}

interface EmojiCacheEntry {
  id: string;
  hash: string;
  file: string;
  animated: boolean;
}

interface LocalEmojiFile {
  name: string;
  file: string;
  path: string;
  hash: string;
}

export class ApplicationEmojiManager {
  public client: Client;
  public emojiDir: string;
  public cacheFile: string;
  public manifestFile: string;
  public deleteMissing: boolean;
  public autoSync: boolean;
  public emojiCache: Record<string, EmojiCacheEntry>;
  public emojiManifest: any;
  public remoteEmojiMap: Map<string, any>;

  constructor(client: Client, config: ManagerConfig = {}) {
    this.client = client;
    this.emojiDir = path.resolve(process.cwd(), config.emojiDir || "./icoms");
    this.cacheFile =
      config.cacheFile || path.join(__dirname, "..", "..", "..", "emoji-cache.json");
    this.manifestFile =
      config.manifestFile ||
      path.join(__dirname, "..", "..", "..", "emoji-manifest.json");
    this.deleteMissing = config.deleteMissing || false;
    this.autoSync = config.autoSync !== false;

    this.emojiCache = this.loadJson(this.cacheFile, {});
    this.emojiManifest = this.loadJson(this.manifestFile, {});
    this.remoteEmojiMap = new Map();
  }

  private loadJson(file: string, fallback: any): any {
    try {
      if (!fs.existsSync(file)) return fallback;
      return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (error: any) {
      console.warn(
        `${colors.yellow}[ EMOJI ]${colors.reset} Failed to load ${path.basename(file)}: ${error.message}`
      );
      return fallback;
    }
  }

  private saveJson(file: string, data: any): void {
    try {
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (error: any) {
      console.error(
        `${colors.red}[ EMOJI ]${colors.reset} Failed to save ${path.basename(file)}: ${error.message}`
      );
    }
  }

  private sha256(filePath: string): string {
    const buf = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(buf).digest("hex");
  }

  private getMimeType(filePath: string): string | null {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".avif": "image/avif",
    };
    return mimeTypes[ext] || null;
  }

  private toDataUri(filePath: string): string | null {
    const mime = this.getMimeType(filePath);
    if (!mime) return null;
    const base64 = fs.readFileSync(filePath).toString("base64");
    return `data:${mime};base64,${base64}`;
  }

  private async apiRequest(
    method: string,
    route: string,
    body?: any
  ): Promise<any> {
    const token = this.client.token;
    const clientId =
      this.client.application?.id || this.client.user?.id;

    if (!token || !clientId) {
      throw new Error("Bot token or client ID not available");
    }

    const res = await fetch(`https://discord.com/api/v10${route}`, {
      method,
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    let data: any = null;
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const message =
        typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);
      throw new Error(
        `${method} ${route} failed: ${res.status} ${res.statusText}\n${message}`
      );
    }

    return data;
  }

  async listApplicationEmojis(): Promise<Map<string, any>> {
    const clientId =
      this.client.application?.id || this.client.user?.id;
    const data = await this.apiRequest(
      "GET",
      `/applications/${clientId}/emojis`
    );
    const items = Array.isArray(data?.items) ? data.items : [];
    const map = new Map<string, any>();
    for (const emoji of items) {
      if (emoji?.name) map.set(emoji.name, emoji);
    }
    return map;
  }

  async createApplicationEmoji(
    name: string,
    filePath: string
  ): Promise<any> {
    const image = this.toDataUri(filePath);
    if (!image) {
      throw new Error(`Unsupported image format: ${filePath}`);
    }

    const stats = fs.statSync(filePath);
    if (stats.size > 256 * 1024) {
      throw new Error(`Emoji file too large (>256 KiB): ${filePath}`);
    }

    const clientId =
      this.client.application?.id || this.client.user?.id;
    return this.apiRequest("POST", `/applications/${clientId}/emojis`, {
      name,
      image,
    });
  }

  async deleteApplicationEmoji(emojiId: string): Promise<void> {
    const clientId =
      this.client.application?.id || this.client.user?.id;
    await this.apiRequest(
      "DELETE",
      `/applications/${clientId}/emojis/${emojiId}`
    );
  }

  loadLocalEmojiFiles(): LocalEmojiFile[] {
    if (!fs.existsSync(this.emojiDir)) {
      console.warn(
        `${colors.yellow}[ EMOJI ]${colors.reset} Emoji folder not found: ${this.emojiDir}`
      );
      return [];
    }

    const files = fs
      .readdirSync(this.emojiDir)
      .filter((f) => !f.startsWith("."))
      .filter((f) =>
        [".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"].includes(
          path.extname(f).toLowerCase()
        )
      );

    const list: LocalEmojiFile[] = [];
    for (const file of files) {
      const fullPath = path.join(this.emojiDir, file);
      const fileNameWithoutExt = path.parse(file).name;

      const name =
        this.emojiManifest[fileNameWithoutExt] || fileNameWithoutExt;

      list.push({
        name,
        file,
        path: fullPath,
        hash: this.sha256(fullPath),
      });
    }

    return list;
  }

  async syncApplicationEmojis(): Promise<void> {
    if (!this.autoSync) {
      console.log(
        `${colors.cyan}[ EMOJI ]${colors.reset} Auto-sync disabled, skipping...`
      );
      return;
    }

    console.log(
      `${colors.cyan}[ EMOJI ]${colors.reset} ${colors.yellow}Syncing application emojis...${colors.reset}`
    );

    try {
      const local = this.loadLocalEmojiFiles();

      if (local.length === 0) {
        console.log(
          `${colors.cyan}[ EMOJI ]${colors.reset} No local emoji files found, skipping sync.`
        );
        return;
      }

      const remoteMap = await this.listApplicationEmojis();
      this.remoteEmojiMap = remoteMap;

      const localNames = new Set(local.map((x) => x.name));
      const nextCache: Record<string, EmojiCacheEntry> = {};

      let created = 0;
      let updated = 0;
      let kept = 0;
      let deleted = 0;

      for (const item of local) {
        const remote = remoteMap.get(item.name);
        const cached = this.emojiCache[item.name];

        if (remote) {
          if (cached?.hash === item.hash && cached?.id === remote.id) {
            nextCache[item.name] = {
              id: remote.id,
              hash: item.hash,
              file: item.file,
              animated: Boolean(remote.animated),
            };
            kept++;
            continue;
          }

          const remoteHashChanged =
            cached?.hash && cached.hash !== item.hash;
          if (remoteHashChanged) {
            console.log(
              `${colors.cyan}[ EMOJI ]${colors.reset} Updating: ${colors.yellow}${item.name}${colors.reset}`
            );
            await this.deleteApplicationEmoji(remote.id);
            const createdEmoji = await this.createApplicationEmoji(
              item.name,
              item.path
            );
            nextCache[item.name] = {
              id: createdEmoji.id,
              hash: item.hash,
              file: item.file,
              animated: Boolean(createdEmoji.animated),
            };
            updated++;
            continue;
          }

          nextCache[item.name] = {
            id: remote.id,
            hash: item.hash,
            file: item.file,
            animated: Boolean(remote.animated),
          };
          kept++;
          continue;
        }

        console.log(
          `${colors.cyan}[ EMOJI ]${colors.reset} Creating: ${colors.green}${item.name}${colors.reset}`
        );
        const createdEmoji = await this.createApplicationEmoji(
          item.name,
          item.path
        );
        nextCache[item.name] = {
          id: createdEmoji.id,
          hash: item.hash,
          file: item.file,
          animated: Boolean(createdEmoji.animated),
        };
        created++;
      }

      if (this.deleteMissing) {
        for (const [name, remote] of remoteMap.entries()) {
          if (!localNames.has(name)) {
            console.log(
              `${colors.cyan}[ EMOJI ]${colors.reset} Deleting: ${colors.red}${name}${colors.reset}`
            );
            await this.deleteApplicationEmoji(remote.id);
            deleted++;
          }
        }
      }

      this.emojiCache = nextCache;
      this.saveJson(this.cacheFile, this.emojiCache);

      console.log(
        `${colors.cyan}[ EMOJI ]${colors.reset} ${colors.green}Sync complete!${colors.reset} Created: ${created}, Updated: ${updated}, Kept: ${kept}${this.deleteMissing ? `, Deleted: ${deleted}` : ""}`
      );
    } catch (error: any) {
      console.error(
        `${colors.red}[ EMOJI ]${colors.reset} Sync failed: ${error.message}`
      );
    }
  }

  getEmoji(name: string, fallback: string = ""): string {
    const data = this.emojiCache[name];
    if (!data?.id) return fallback;

    const isAnimated = Boolean(
      data.animated || String(data.file).toLowerCase().endsWith(".gif")
    );
    return isAnimated
      ? `<a:${name}:${data.id}>`
      : `<:${name}:${data.id}>`;
  }

  getEmojiId(name: string): string | null {
    return this.emojiCache[name]?.id || null;
  }

  getAllEmojis(): string[] {
    return Object.keys(this.emojiCache);
  }

  isEmojiAvailable(name: string): boolean {
    return Boolean(this.emojiCache[name]?.id);
  }
}
