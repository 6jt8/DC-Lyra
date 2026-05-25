import fs from "fs";
import path from "path";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { Client } from "discord.js";
import { config } from "../config.js";
import { colors } from "../ui/colors.js";

export class EmojiUploader {
  private client: Client;
  private rest: REST;
  private iconsPath: string;
  private uploadedEmojis: Map<string, any>;

  constructor(client: Client) {
    this.client = client;
    this.rest = new REST({ version: "10" }).setToken(
      config.token || process.env.TOKEN || ""
    );
    this.iconsPath = path.resolve(process.cwd(), config.applicationEmojis.emojiDir || "./icoms");
    this.uploadedEmojis = new Map();
  }

  getLocalEmojiFiles(): string[] {
    try {
      if (!fs.existsSync(this.iconsPath)) {
        console.warn(`${colors.yellow}[ EMOJI ]${colors.reset} Emoji folder not found: ${this.iconsPath}`);
        return [];
      }
      const files = fs.readdirSync(this.iconsPath);
      return files.filter((file) =>
        [".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"].includes(
          path.extname(file).toLowerCase()
        )
      );
    } catch (error: any) {
      console.error(
        `${colors.red}Error reading icoms folder:${colors.reset}`,
        error.message
      );
      return [];
    }
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".avif": "image/avif",
    };
    return mimeTypes[ext] || "image/png";
  }

  private fileToDataUri(filePath: string): string | null {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const base64 = fileBuffer.toString("base64");
      const mime = this.getMimeType(filePath);
      return `data:${mime};base64,${base64}`;
    } catch (error: any) {
      console.error(
        `${colors.red}Error reading file ${filePath}:${colors.reset}`,
        error.message
      );
      return null;
    }
  }

  private getEmojiName(filename: string): string {
    const ext = path.extname(filename);
    let name = filename.replace(ext, "");

    if (name.startsWith("s") && name.length > 1) {
      name = name.substring(1);
    }

    return `x_${name}`;
  }

  async fetchExistingEmojis(): Promise<any[]> {
    try {
      const emojis: any = await this.rest.get(
        Routes.applicationEmojis(this.client.user!.id)
      );

      console.log(
        `${colors.cyan}[ EMOJI ]${colors.reset} ${colors.green}Found ${emojis.items.length} existing application emojis${colors.reset}`
      );

      for (const emoji of emojis.items) {
        this.uploadedEmojis.set(emoji.name, emoji);
      }

      return emojis.items;
    } catch (error: any) {
      console.error(
        `${colors.red}Error fetching existing emojis:${colors.reset}`,
        error.message
      );
      return [];
    }
  }

  async uploadEmoji(filename: string): Promise<any> {
    const filePath = path.join(this.iconsPath, filename);
    const emojiName = this.getEmojiName(filename);

    if (this.uploadedEmojis.has(emojiName)) {
      console.log(
        `${colors.yellow}[ EMOJI ]${colors.reset} ${colors.gray}Skipping ${emojiName} (already exists)${colors.reset}`
      );
      return this.uploadedEmojis.get(emojiName);
    }

    try {
      const imageData = this.fileToDataUri(filePath);
      if (!imageData) {
        throw new Error("Failed to read image file");
      }

      const emoji: any = await this.rest.post(
        Routes.applicationEmojis(this.client.user!.id),
        {
          body: {
            name: emojiName,
            image: imageData,
          },
        }
      );

      this.uploadedEmojis.set(emojiName, emoji);
      console.log(
        `${colors.cyan}[ EMOJI ]${colors.reset} ${colors.green}✓ Uploaded: ${emojiName} (${filename})${colors.reset}`
      );

      return emoji;
    } catch (error: any) {
      if (error.code === 30008) {
        console.error(
          `${colors.red}[ EMOJI ]${colors.reset} ${colors.yellow}Maximum emojis reached (50 limit)${colors.reset}`
        );
      } else if (error.code === 50035) {
        console.error(
          `${colors.red}[ EMOJI ]${colors.reset} ${colors.yellow}Invalid image format for ${filename}${colors.reset}`
        );
      } else {
        console.error(
          `${colors.red}[ EMOJI ]${colors.reset} ${colors.red}Failed to upload ${emojiName}:${colors.reset}`,
          error.message
        );
      }
      return null;
    }
  }

  async uploadAllEmojis(): Promise<Map<string, any>> {
    console.log(
      "\n" + "═".repeat(60)
    );
    console.log(
      `${colors.cyan}${colors.bright}🎨 EMOJI UPLOADER${colors.reset}`
    );
    console.log("═".repeat(60) + "\n");

    await this.fetchExistingEmojis();

    const files = this.getLocalEmojiFiles();
    console.log(
      `${colors.cyan}[ EMOJI ]${colors.reset} Found ${files.length} PNG files in icoms folder\n`
    );

    if (files.length === 0) {
      console.log(
        `${colors.yellow}[ EMOJI ]${colors.reset} No PNG files found in icoms folder`
      );
      return this.uploadedEmojis;
    }

    let uploaded = 0;
    let skipped = 0;
    let failed = 0;

    for (const file of files) {
      const emojiName = this.getEmojiName(file);
      const alreadyExists = this.uploadedEmojis.has(emojiName);

      const result = await this.uploadEmoji(file);

      if (result) {
        if (alreadyExists && result.id) {
          skipped++;
        } else if (result.id) {
          uploaded++;
        } else {
          failed++;
        }
      } else {
        failed++;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(
      "\n" + "═".repeat(60)
    );
    console.log(`${colors.green}✅ Upload Complete!${colors.reset}`);
    console.log("═".repeat(60));
    console.log(`${colors.cyan}[ SUMMARY ]${colors.reset}`);
    console.log(`  Uploaded: ${colors.green}${uploaded}${colors.reset}`);
    console.log(`  Skipped:  ${colors.yellow}${skipped}${colors.reset}`);
    console.log(`  Failed:   ${colors.red}${failed}${colors.reset}`);
    console.log(`  Total:    ${colors.cyan}${files.length}${colors.reset}`);
    console.log("═".repeat(60) + "\n");

    return this.uploadedEmojis;
  }

  async generateEmojiData(): Promise<void> {
    if (this.uploadedEmojis.size === 0) {
      console.log(
        `${colors.yellow}[ EMOJI ]${colors.reset} No emojis to generate data for`
      );
      return;
    }

    const emojiDataPath = path.join(
      __dirname,
      "../emoji/emojiData.js"
    );

    const emojiMap: Record<string, { name: string; id: string }> = {};
    for (const [name, emoji] of this.uploadedEmojis.entries()) {
      const key = name.replace("x_", "");
      emojiMap[key] = {
        name: emoji.name,
        id: emoji.id,
      };
    }

    const fileContent = `// Auto-generated emoji data
import path from 'path';

const LOCAL_EMOJI_PATH = path.resolve(process.cwd(), config.applicationEmojis.emojiDir || "./icoms");

const REDWHITE_CUSTOMS = Object.freeze(${JSON.stringify(emojiMap, null, 2)});

const EMOJIS = Object.freeze({
  home: { default: "🏠", custom: { redwhite: REDWHITE_CUSTOMS.home } },
  help: { default: "❓", custom: { redwhite: REDWHITE_CUSTOMS.info } },
  music: { default: "🎵", custom: { redwhite: REDWHITE_CUSTOMS.music } },
  
});

export { EMOJIS, REDWHITE_CUSTOMS, LOCAL_EMOJI_PATH };
`;

    try {
      fs.writeFileSync(emojiDataPath, fileContent, "utf8");
      console.log(
        `${colors.cyan}[ EMOJI ]${colors.reset} ${colors.green}✓ Generated emojiData.ts with ${this.uploadedEmojis.size} emojis${colors.reset}`
      );
    } catch (error: any) {
      console.error(
        `${colors.red}[ EMOJI ]${colors.reset} Failed to write emojiData.ts:`,
        error.message
      );
    }
  }

  async deleteAllEmojis(): Promise<void> {
    console.log(
      `${colors.yellow}[ EMOJI ]${colors.reset} Deleting all application emojis...`
    );

    const existing = await this.fetchExistingEmojis();
    let deleted = 0;

    for (const emoji of existing) {
      try {
        await this.rest.delete(
          Routes.applicationEmoji(this.client.user!.id, emoji.id)
        );
        console.log(
          `${colors.cyan}[ EMOJI ]${colors.reset} ${colors.red}✗ Deleted: ${emoji.name}${colors.reset}`
        );
        deleted++;

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error(
          `${colors.red}[ EMOJI ]${colors.reset} Failed to delete ${emoji.name}:`,
          error.message
        );
      }
    }

    console.log(
      `${colors.cyan}[ EMOJI ]${colors.reset} ${colors.green}Deleted ${deleted} emojis${colors.reset}`
    );
  }
}
