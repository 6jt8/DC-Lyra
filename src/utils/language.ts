import fs from "fs";
import path from "path";
import { config } from "../config.js";
import { getLanguageCollection } from "../database/database.js";

const languageCache = new Map<string, any>();

function resolveLangPath(langCode: string): string | null {
  const jsPath = path.join(__dirname, "../../languages", `${langCode}.js`);
  if (fs.existsSync(jsPath)) return jsPath;
  const tsPath = path.join(__dirname, "../../languages", `${langCode}.ts`);
  if (fs.existsSync(tsPath)) return tsPath;
  return null;
}

export function getGlobalDefaultLanguage(): string {
  return config.language || "en";
}

export async function loadLanguageFile(
  langCode: string
): Promise<any> {
  if (languageCache.has(langCode)) {
    return languageCache.get(langCode);
  }

  try {
    const langPath = resolveLangPath(langCode);
    if (!langPath) {
      const globalDefault = getGlobalDefaultLanguage();
      if (langCode !== globalDefault) {
        console.warn(
          `[ LANGUAGE ] Language file not found: ${langCode}, falling back to ${globalDefault}`
        );
        return loadLanguageFile(globalDefault);
      }
      return {};
    }

    delete require.cache[require.resolve(langPath)];
    const langModule = require(langPath);
    const langData =
      typeof langModule === "function" ? langModule() : langModule.default || langModule;

    languageCache.set(langCode, langData);
    return langData;
  } catch (error) {
    console.error(`[ LANGUAGE ] Error loading language file ${langCode}:`, error);
    const globalDefault = getGlobalDefaultLanguage();
    if (langCode !== globalDefault) {
      return loadLanguageFile(globalDefault);
    }
    return {};
  }
}

export async function getGuildLanguage(
  guildId: string
): Promise<string> {
  const globalDefault = getGlobalDefaultLanguage();

  if (!guildId) {
    return globalDefault;
  }

  try {
    const collection = getLanguageCollection();
    if (!collection) {
      return globalDefault;
    }

    const guildSettings = await collection.findOne({ guildId });
    return guildSettings?.language || globalDefault;
  } catch (error) {
    return globalDefault;
  }
}

export async function setGuildLanguage(
  guildId: string,
  langCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const collection = getLanguageCollection();
    if (!collection) return { success: false, error: "No database connection" };

    const langPath = resolveLangPath(langCode);
    if (!langPath) {
      return { success: false, error: "Language file not found" };
    }

    await collection.updateOne(
      { guildId },
      { $set: { guildId, language: langCode } },
      { upsert: true }
    );

    languageCache.delete(langCode);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function getAvailableLanguages(): { code: string; name: string; file: string }[] {
  const languagesDir = path.join(__dirname, "../../languages");
  const languages: { code: string; name: string; file: string }[] = [];

  try {
    const files = fs.readdirSync(languagesDir);
    for (const file of files) {
      if (file.endsWith(".js") || file.endsWith(".ts")) {
        const langCode = file.replace(/\.(js|ts)$/, "");
        try {
          const langPath = path.join(languagesDir, file);
          delete require.cache[require.resolve(langPath)];
          const langModule = require(langPath);
          const langData =
            typeof langModule === "function" ? langModule() : langModule.default || langModule;
          const langName = langData.meta?.name || langCode.toUpperCase();
          languages.push({ code: langCode, name: langName, file });
        } catch (e: any) {
          console.warn(
            `[ LANGUAGE ] Failed to load language file ${file}:`,
            e.message
          );
        }
      }
    }
  } catch (error) {
    console.error(`[ LANGUAGE ] Error reading languages directory:`, error);
  }

  return languages;
}

export async function getLang(guildId?: string): Promise<any> {
  const langCode = guildId
    ? await getGuildLanguage(guildId)
    : getGlobalDefaultLanguage();
  const lang = await loadLanguageFile(langCode);
  if (!lang || Object.keys(lang).length === 0) {
    const defaultCode = getGlobalDefaultLanguage();
    if (defaultCode !== langCode) {
      return loadLanguageFile(defaultCode);
    }
  }
  return lang;
}

export function getLangSync(): any {
  const langCode = getGlobalDefaultLanguage();
  if (languageCache.has(langCode)) {
    const cached = languageCache.get(langCode);
    if (cached && typeof cached === "object") {
      return cached;
    }
  }

  try {
    const langPath = resolveLangPath(langCode);
    if (langPath) {
      delete require.cache[require.resolve(langPath)];
      const langModule = require(langPath);
      const langData =
        typeof langModule === "function" ? langModule() : langModule.default || langModule;
      if (langData && typeof langData === "object") {
        languageCache.set(langCode, langData);
        return langData;
      }
    }

    const fallbackPath = resolveLangPath("en");
    if (fallbackPath && langCode !== "en") {
      delete require.cache[require.resolve(fallbackPath)];
      const fallbackModule = require(fallbackPath);
      const fallbackData =
        typeof fallbackModule === "function" ? fallbackModule() : fallbackModule.default || fallbackModule;
      if (fallbackData && typeof fallbackData === "object") {
        languageCache.set("en", fallbackData);
        return fallbackData;
      }
    }
  } catch (error) {
    if (langCode !== "en") {
      try {
        const fallbackPath = resolveLangPath("en");
        if (fallbackPath) {
          delete require.cache[require.resolve(fallbackPath)];
          const fallbackModule = require(fallbackPath);
          const fallbackData =
            typeof fallbackModule === "function" ? fallbackModule() : fallbackModule.default || fallbackModule;
          if (fallbackData && typeof fallbackData === "object") {
            languageCache.set("en", fallbackData);
            return fallbackData;
          }
        }
      } catch {}
    }
  }

  return { console: {} };
}

export function clearLanguageCache(): void {
  languageCache.clear();
}
