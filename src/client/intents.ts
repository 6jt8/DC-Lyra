import { GatewayIntentBits } from "discord.js";

const BASE_INTENTS = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildVoiceStates,
];

const PRIVILEGED_INTENTS = [
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildPresences,
];

export function buildIntents(useIntents: boolean): number[] {
  return useIntents
    ? [...BASE_INTENTS, ...PRIVILEGED_INTENTS]
    : BASE_INTENTS;
}
