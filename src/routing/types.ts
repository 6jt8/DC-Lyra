import { Client, Message } from "discord.js";

export interface CommandStrategy {
  readonly name: string;
  readonly active: boolean;
  setup(client: Client): void;
  teardown(client: Client): void;
}
