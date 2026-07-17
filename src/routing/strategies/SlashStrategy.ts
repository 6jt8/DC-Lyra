import { Client } from "discord.js";
import { handleInteractionCreate } from "../../events/interactionCreate.js";
import { CommandStrategy } from "../types.js";

export class SlashStrategy implements CommandStrategy {
  readonly name = "slash";
  readonly active = true;

  setup(client: Client): void {
    client.on("interactionCreate", (interaction: any) => {
      handleInteractionCreate(client, interaction);
    });
  }

  teardown(client: Client): void {
    client.removeAllListeners("interactionCreate");
  }
}