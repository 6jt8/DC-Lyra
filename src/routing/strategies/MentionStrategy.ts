import { Client, Message } from "discord.js";
import { CommandStrategy } from "../types.js";
import { dispatchTextCommand } from "../../utils/commandDispatch.js";

export class MentionStrategy implements CommandStrategy {
  readonly name = "mention";
  readonly active: boolean;
  private mentionRegex: RegExp;
  private boundHandler: (message: Message) => void;

  constructor(clientId: string, active: boolean) {
    this.active = active;
    this.mentionRegex = new RegExp(`^<@!?${clientId}>\\s*`);
    this.boundHandler = (message: Message) => {
      if (message.author.bot) return;
      const match = message.content.match(this.mentionRegex);
      if (!match) return;
      const args = message.content.replace(match[0], "").trim().split(/\s+/);
      const commandName = args.shift()?.toLowerCase();
      if (!commandName) return;
      dispatchTextCommand({
        client: undefined as any,
        commandName,
        args,
        message,
      });
    };
  }

  setup(client: Client): void {
    const handler = (message: Message) => {
      if (message.author.bot) return;
      const match = message.content.match(this.mentionRegex);
      if (!match) return;
      const args = message.content.replace(match[0], "").trim().split(/\s+/);
      const commandName = args.shift()?.toLowerCase();
      if (!commandName) return;
      dispatchTextCommand({ client, commandName, args, message });
    };
    (this as any)._runtimeHandler = handler;
    client.on("messageCreate", handler);
  }

  teardown(client: Client): void {
    const handler = (this as any)._runtimeHandler;
    if (handler) {
      client.off("messageCreate", handler);
    }
  }
}
