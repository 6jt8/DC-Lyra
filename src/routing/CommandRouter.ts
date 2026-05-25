import { Client } from "discord.js";
import { CommandStrategy } from "./types.js";

export class CommandRouter {
  private strategies: CommandStrategy[] = [];
  private activated = false;

  register(strategy: CommandStrategy): void {
    this.strategies.push(strategy);
  }

  activate(client: Client): void {
    if (this.activated) return;
    for (const strategy of this.strategies) {
      if (strategy.active) strategy.setup(client);
    }
    this.activated = true;
  }

  deactivate(client: Client): void {
    for (const strategy of this.strategies) {
      strategy.teardown(client);
    }
    this.activated = false;
  }
}
