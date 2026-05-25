import { Client, Message } from "discord.js";
import { CommandStrategy } from "../types.js";

export class MentionStrategy implements CommandStrategy {
  readonly name = "mention";
  readonly active: boolean;
  private boundHandler: (message: Message) => void;

  constructor(clientId: string, active: boolean) {
    this.active = active;
    const mentionRegex = new RegExp(`^<@!?${clientId}>\\s*`);

    this.boundHandler = (message: Message) => {
      if (message.author.bot) return;
      const match = message.content.match(mentionRegex);
      if (!match) return;

      const args = message.content.replace(match[0], "").trim().split(/\s+/);
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
