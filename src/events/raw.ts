import { GatewayDispatchEvents } from "discord.js";
import { config } from "../config.js";

export default (client: any, d: any) => {
  if (
    ![GatewayDispatchEvents.VoiceStateUpdate, GatewayDispatchEvents.VoiceServerUpdate].includes(
      d.t
    )
  )
    return;
  if (config.voiceDebug === true) {
    if (d.t === GatewayDispatchEvents.VoiceStateUpdate) {
      const isBot = d.d?.user_id === client.user?.id;
      console.log(
        `[ VOICE DEBUG ] raw=${d.t} guild=${d.d?.guild_id || "null"} botUser=${isBot} channel=${d.d?.channel_id || "null"} sessionId=${d.d?.session_id ? "yes" : "no"}`
      );
    } else {
      console.log(
        `[ VOICE DEBUG ] raw=${d.t} guild=${d.d?.guild_id || "null"} endpoint=${d.d?.endpoint ? "yes" : "no"} token=${d.d?.token ? "yes" : "no"}`
      );
    }
  }
  client.riffy.updateVoiceState(d);
};
