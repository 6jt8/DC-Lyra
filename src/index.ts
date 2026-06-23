import { config } from "./config.js";
import { initDatabase, isConnected } from "./database/manager.js";
import { colors } from "./ui/colors.js";
import SpotifyWebApi from 'spotify-web-api-node';

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

  if (config.spotifyClientId && config.spotifyClientSecret) {
    try {
      const spotifyApi = new SpotifyWebApi({
        clientId: config.spotifyClientId,
        clientSecret: config.spotifyClientSecret,
      });
      const data = await spotifyApi.clientCredentialsGrant();
      if (data.body?.access_token) {
        console.log(`${colors.green}[ SPOTIFY ]${colors.reset} API credentials valid ✅`);
      }
    } catch (err: any) {
      const statusCode = err?.statusCode || err?.status;
      if (statusCode === 403) {
        console.warn(`${colors.yellow}[ SPOTIFY ]${colors.reset} API 403 — server IP may be blocked. Will use scraping fallback.${colors.reset}`);
      } else if (err?.body?.error === "invalid_client") {
        console.warn(`${colors.yellow}[ SPOTIFY ]${colors.reset} Invalid client ID or secret. Check SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET env vars.${colors.reset}`);
      } else {
        console.warn(`${colors.yellow}[ SPOTIFY ]${colors.reset} Credential check failed (${err.message}). Will use scraping fallback.${colors.reset}`);
      }
    }
  } else {
    console.warn(`${colors.yellow}[ SPOTIFY ]${colors.reset} No Spotify credentials configured. Spotify URLs will be scraped if possible.${colors.reset}`);
  }

  console.log(`${colors.cyan}[ BOOT ]${colors.reset} Starting bot...`);
  await import("./bot.js");
}

main().catch((err) => {
  console.error(`${colors.red}[ FATAL ]${colors.reset} Bootstrap failed:`, err);
  process.exit(1);
});
