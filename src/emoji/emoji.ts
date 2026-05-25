import { config } from "../config.js";
import { EMOJIS, REDWHITE_CUSTOMS, LOCAL_EMOJI_PATH, EmojiDefinition } from "./emojiData.js";
import path from "path";
import fs from "fs";

let globalClient: any = null;

export function setClient(client: any): void {
  globalClient = client;
}

function autoDetectEmojiFiles(): string[] {
  const emojiDir = LOCAL_EMOJI_PATH;
  const emojiNames: string[] = [];

  try {
    if (!fs.existsSync(emojiDir)) {
      console.warn(`[ EMOJI ] Emoji folder not found: ${emojiDir}`);
      return emojiNames;
    }

    const files = fs
      .readdirSync(emojiDir)
      .filter((f) => !f.startsWith("."))
      .filter((f) =>
        [".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"].includes(
          path.extname(f).toLowerCase()
        )
      );

    for (const file of files) {
      const nameWithoutExt = path.parse(file).name;
      emojiNames.push(nameWithoutExt);
    }
  } catch (error: any) {
    console.error(
      `[ EMOJI ] Error auto-detecting emoji files: ${error.message}`
    );
  }

  return emojiNames;
}

function loadEmojiManifest(): Record<string, any> {
  const manifestPath = path.join(__dirname, "../../../emoji-manifest.json");

  try {
    if (!fs.existsSync(manifestPath)) {
      return {};
    }

    const content = fs.readFileSync(manifestPath, "utf8");
    const manifest = JSON.parse(content);

    const filtered: Record<string, any> = {};
    for (const [key, value] of Object.entries(manifest)) {
      if (!key.startsWith("_")) {
        filtered[key] = value;
      }
    }

    return filtered;
  } catch (error: any) {
    console.warn(
      `[ EMOJI ] Failed to load emoji manifest: ${error.message}`
    );
    return {};
  }
}

function buildKeyToNameMapping(): Record<string, string> {
  const mapping: Record<string, string> = {};

  for (const [key, value] of Object.entries(REDWHITE_CUSTOMS)) {
    if (value && value.name) {
      mapping[key] = value.name;
    }
  }

  const manifest = loadEmojiManifest();
  for (const [fileName, cfg] of Object.entries(manifest)) {
    if (typeof cfg === "string") {
      mapping[cfg] = fileName;
    } else if (cfg && cfg.key) {
      mapping[cfg.key] = fileName;
    }
  }

  const autoDetected = autoDetectEmojiFiles();
  for (const fileName of autoDetected) {
    if (!Object.values(mapping).includes(fileName)) {
      mapping[fileName] = fileName;
    }
  }

  return mapping;
}

const KEY_TO_NAME_MAP: Record<string, string> = buildKeyToNameMapping();

function useCustomEmoji(): boolean {
  return config.customEmoji === true;
}

function getTheme(): string {
  return String(config.emojiTheme || "redwhite").toLowerCase();
}

function parseRawCustomEmoji(
  raw: string
): { name: string; id: string } | null {
  if (typeof raw !== "string") return null;
  const match = raw.trim().match(/^<a?:(\w+):(\d+)>$/);
  if (!match) return null;

  return {
    name: match[1],
    id: match[2],
  };
}

function resolveCustomEntry(
  entry: EmojiDefinition
): { raw?: string; name?: string; id?: string; animated?: boolean; localFile?: string } | null {
  if (!entry) return null;

  const custom = entry.custom as any;
  if (!custom) return null;

  if (typeof custom === "string" && custom.trim()) {
    return { raw: custom.trim() };
  }

  if (typeof custom === "object") {
    const themed = custom[getTheme()] || custom.default;
    if (typeof themed === "string" && themed.trim()) {
      return { raw: themed.trim() };
    }

    if (themed && themed.name && themed.id) {
      return {
        name: themed.name,
        id: themed.id,
        animated: Boolean(themed.animated),
        localFile: themed.localFile,
      };
    }
  }

  return null;
}

function buildCustomEmoji(entry: EmojiDefinition): string | null {
  const custom = resolveCustomEntry(entry);
  if (!custom) return null;

  if (custom.name && custom.id) {
    const prefix = custom.animated ? "<a:" : "<:";
    return `${prefix}${custom.name}:${custom.id}>`;
  }

  if (custom.raw) return custom.raw;

  if (custom.localFile) {
    return entry.default || "";
  }

  return null;
}

export function getEmoji(key: string, client?: any): string {
  const activeClient = client || globalClient;

  if (activeClient?.appEmojiManager) {
    const emojiName = KEY_TO_NAME_MAP[key] || key;
    const appEmoji = activeClient.appEmojiManager.getEmoji(emojiName);
    if (appEmoji && appEmoji !== "") return appEmoji;
  }

  const entry = EMOJIS[key];
  if (!entry) return "";

  if (useCustomEmoji()) {
    const custom = buildCustomEmoji(entry);
    if (custom) return custom;
  }

  return entry.default || "";
}

export function getButtonEmoji(
  key: string,
  client?: any
): { name: string; id: string; animated: boolean } | string | null {
  const activeClient = client || globalClient;

  if (activeClient?.appEmojiManager) {
    const emojiName = KEY_TO_NAME_MAP[key] || key;
    const emojiId = activeClient.appEmojiManager.getEmojiId(emojiName);
    if (emojiId) {
      const cached = activeClient.appEmojiManager.emojiCache[emojiName];
      return {
        name: emojiName,
        id: emojiId,
        animated: Boolean(cached?.animated),
      };
    }
  }

  const entry = EMOJIS[key];
  if (!entry) return null;

  if (useCustomEmoji()) {
    const custom = resolveCustomEntry(entry);

    if (custom?.name && custom?.id) {
      return {
        name: custom.name,
        id: custom.id,
        animated: Boolean(custom.animated),
      };
    }

    if (custom?.raw) {
      const parsed = parseRawCustomEmoji(custom.raw);
      if (parsed) return { ...parsed, animated: false };
    }

    if (custom?.localFile) {
      return entry.default || null;
    }
  }

  return entry.default || null;
}

export function getEmojiFilePath(key: string): string | null {
  if (!useCustomEmoji()) return null;

  const entry = EMOJIS[key];
  if (!entry) return null;

  const custom = resolveCustomEntry(entry);
  if (!custom?.localFile) return null;

  const filePath = path.join(LOCAL_EMOJI_PATH, custom.localFile);

  if (fs.existsSync(filePath)) {
    return filePath;
  }

  return null;
}

export function getEmojiAttachment(key: string): any {
  const filePath = getEmojiFilePath(key);
  if (!filePath) return null;

  const { AttachmentBuilder } = require("discord.js");
  const fileName = path.basename(filePath);

  return new AttachmentBuilder(filePath, { name: fileName });
}

export function getAllAvailableEmojis(): any {
  const available = {
    fromEmojiData: Object.keys(EMOJIS),
    fromApplicationManager: globalClient?.emojiManager
      ? globalClient.emojiManager.getAllEmojis()
      : [],
    fromKeyMapping: Object.keys(KEY_TO_NAME_MAP),
    total: 0,
  };

  const allKeys = new Set([
    ...available.fromEmojiData,
    ...available.fromApplicationManager,
    ...available.fromKeyMapping,
  ]);

  available.total = allKeys.size;
  (available as any).allKeys = Array.from(allKeys).sort();

  return available;
}
