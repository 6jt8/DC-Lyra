import { Client } from "discord.js";
import { handleInteractionCreate } from "../../events/interactionCreate.js";
import { CommandStrategy } from "../types.js";

export class SlashStrategy implements CommandStrategy {
  readonly name = "slash";
  readonly active = true;
  private boundHandler: (interaction: any) => void;

  constructor() {
    this.boundHandler = (interaction: any) => {
      handleInteractionCreate(undefined, interaction);
    };
  }

  setup(client: Client): void {
    client.on("interactionCreate", this.boundHandler);
  }

  teardown(client: Client): void {
    client.off("interactionCreate", this.boundHandler);
  }
}