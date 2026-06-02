import fsp from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import { colors } from "../ui/colors.js";

const INTENT_GATED_EVENTS: Record<string, string> = {
  message: "MessageContent",
  presenceUpdate: "GuildPresences",
  guildMemberAdd: "GuildMembers",
  guildMemberRemove: "GuildMembers",
  guildMemberUpdate: "GuildMembers",
};

export async function loadEvents(client: any): Promise<void> {
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
      client.on(eventName, event.bind(null, client));
      console.log(`[EVENT] Registered: ${eventName}`);
    } catch (error: any) {
      console.error(`[EVENT] Failed to load ${eventName}: ${error.message}`);
    }
  }
}
