import { Router } from "express";
import path from "path";
import { config } from "../config.js";
import { getUptime } from "./runtime.js";

export function createDashboardRouter(client: any): Router {
  const router = Router();

  router.get("/api/stats", (_req: any, res: any) => {
    try {
      const guilds = client.guilds?.cache?.size || 0;
      let users = 0;
      if (client.users?.cache?.size) {
        users = client.users.cache.size;
      }
      const channels = client.channels?.cache?.size || 0;
      const players = client.riffy?.players?.size || 0;
      const ping = client.ws?.ping || 0;
      const memory = process.memoryUsage();
      const uptime = getUptime();
      const shard = client.shard?.count || 1;

      res.json({
        status: "online",
        uptime,
        guilds,
        users,
        channels,
        players,
        ping: Math.round(ping),
        memory: {
          rss: Math.round(memory.rss / 1024 / 1024),
          heap: Math.round(memory.heapUsed / 1024 / 1024),
        },
        shard,
        version: "1.2.0",
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/dashboard", (_req: any, res: any) => {
    const htmlPath = path.join(__dirname, "views", "dashboard.html");
    res.sendFile(htmlPath, (err: any) => {
      if (err) {
        res.status(500).send("Dashboard page unavailable");
      }
    });
  });

  router.get("/api/version", (_req: any, res: any) => {
    res.json({ version: "1.2.0", node: process.version, platform: process.platform });
  });

  if (config.dashboardSecret) {
    router.get("/api/players", (req: any, res: any) => {
      if (req.query.secret !== config.dashboardSecret) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const playerList: any[] = [];
      if (client.riffy?.players) {
        for (const [, player] of client.riffy.players) {
          playerList.push({
            guildId: player.guildId,
            voiceChannel: player.voiceChannel,
            textChannel: player.textChannel,
            current: player.current?.info?.title || "None",
            paused: player.paused || false,
            position: player.position || 0,
            volume: player.volume || 20,
            loop: player.loop || "none",
            queueLength: player.queue?.length || 0,
          });
        }
      }
      res.json(playerList);
    });
  }

  return router;
}
