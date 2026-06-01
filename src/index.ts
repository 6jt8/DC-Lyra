import { config } from "./config.js";
import { initDatabase, isConnected } from "./database/manager.js";
import { colors } from "./ui/colors.js";

async function main() {
  console.log(`${colors.magenta}${colors.bright}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.magenta}${colors.bright}  🎵 Lyra Music Bot - Booting up...${colors.reset}`);
  console.log(`${colors.magenta}${colors.bright}═══════════════════════════════════════${colors.reset}`);

  try {
    console.log(`${colors.cyan}[ BOOT ]${colors.reset} Initializing database...`);
    await initDatabase(config.databaseUrl);
    console.log(`${colors.green}[ DB ]${colors.reset} Database ready ✅`);
  } catch (err: any) {
    console.error(`${colors.red}[ DB ]${colors.reset} Database failed: ${err.message}`);
    console.warn(`${colors.yellow}[ BOOT ]${colors.reset} Continuing without database...`);
  }

  console.log(`${colors.cyan}[ BOOT ]${colors.reset} Starting bot...`);
  await import("./bot.js");
}

main().catch((err) => {
  console.error(`${colors.red}[ FATAL ]${colors.reset} Bootstrap failed:`, err);
  process.exit(1);
});
