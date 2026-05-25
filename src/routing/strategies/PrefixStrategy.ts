import { Client, Message } from "discord.js";
import { CommandStrategy } from "../types.js";

export class PrefixStrategy implements CommandStrategy {
  readonly name = "prefix";
  readonly active: boolean;
  private boundHandler: (message: Message) => void;

  constructor(prefix: string, active: boolean) {
    this.active = active;
    this.boundHandler = (message: Message) => {
      if (!message.content.startsWith(prefix)) return;
      const args = message.content.slice(prefix.length).trim().split(/\s+/);
      const commandName = args.shift()?.toLowerCase();
      // Execute command...
    };
  }

  setup(client: Client): void {
    client.on("messageCreate", this.boundHandler);
  }

  teardown(client: Client): void {
    client.off("messageCreate", this.boundHandler);
  }
}
