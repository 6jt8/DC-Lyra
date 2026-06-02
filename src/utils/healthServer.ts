import express from "express";
import path from "path";
import { colors } from "../ui/colors.js";

export function startHealthServer(port: number): void {
  const app = express();

  app.get("/", (_req: any, res: any) => {
    const imagePath = path.join(__dirname, "../../index.html");
    res.sendFile(imagePath, (err: any) => {
      if (err) {
        console.error(`${colors.red}[ EXPRESS ]${colors.reset} Failed to send index.html: ${err.message}`);
        res.status(500).send("Status page unavailable");
      }
    });
  });

  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(`${colors.red}[ EXPRESS ]${colors.reset} Server error: ${err.message}`);
    if (res.headersSent) return;
    res.status(500).send("Internal Server Error");
  });

  app.listen(port, () => {
    console.log("\n" + "─".repeat(40));
    console.log(`${colors.magenta}${colors.bright}🌐 SERVER STATUS${colors.reset}`);
    console.log("─".repeat(40));
    console.log(`${colors.cyan}[ SERVER ]${colors.reset} ${colors.green}Online ✅${colors.reset}`);
    console.log(`${colors.cyan}[ PORT ]${colors.reset} ${colors.yellow}http://localhost:${port}${colors.reset}`);
    console.log(`${colors.cyan}[ TIME ]${colors.reset} ${colors.gray}${new Date().toISOString().replace("T", " ").split(".")[0]}${colors.reset}`);
  });
}
