import { Client, Message } from "discord.js";
import { CommandStrategy } from "../types.js";
import { dispatchTextCommand } from "../../utils/commandDispatch.js";

export class PrefixStrategy implements CommandStrategy {
  readonly name = "prefix";
  readonly active: boolean;
  private prefix: string;
  private boundHandler: (message: Message) => void;

  constructor(prefix: string, active: boolean) {
    this.prefix = prefix;
    this.active = active;
    this.boundHandler = (message: Message) => {
      if (message.author.bot) return;
      if (!message.content.startsWith(this.prefix)) return;
      const args = message.content.slice(this.prefix.length).trim().split(/\s+/);
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
    (this.boundHandler as any)._client = client;
    const handler = (message: Message) => {
      if (message.author.bot) return;
      if (!message.content.startsWith(this.prefix)) return;
      const args = message.content.slice(this.prefix.length).trim().split(/\s+/);
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
