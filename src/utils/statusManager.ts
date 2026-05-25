import { ActivityType, Client } from "discord.js";
import { getGlobalPlays } from "../database/database.js";

export class StatusManager {
  private client: Client;
  private currentInterval: NodeJS.Timeout | null = null;
  private isPlaying: boolean = false;
  private refreshInterval: NodeJS.Timeout | null = null;
  private voiceChannelData: Map<
    string,
    { originalName: string; originalTopic: string | null }
  > = new Map();

  constructor(client: Client) {
    this.client = client;
  }

  private getGuildCount(): number {
    return this.client.guilds.cache.size;
  }

  private async getTotalPlays(): Promise<number> {
    return getGlobalPlays();
  }

  async updatePresence(playing: boolean): Promise<void> {
    const guildCount = this.getGuildCount();
    const totalPlays = await this.getTotalPlays();

    const name = playing
      ? `🎵 Playing on ${guildCount} servers | ${totalPlays.toLocaleString()} total plays`
      : `📍 On ${guildCount} servers | ${totalPlays.toLocaleString()} total plays`;

    const type = playing ? ActivityType.Playing : ActivityType.Playing;

    await this.client.user!.setPresence({
      activities: [{ name, type }],
      status: "online",
    });
  }

  async setVoiceChannelStatus(
    guildId: string,
    trackTitle: string
  ): Promise<void> {
    try {
      const player = (this.client as any).riffy?.players?.get(
        guildId
      );
      if (!player || !player.voiceChannel) return;

      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) return;

      const voiceChannel = guild.channels.cache.get(
        player.voiceChannel
      ) as any;
      if (!voiceChannel) return;

      if (!this.voiceChannelData.has(voiceChannel.id)) {
        this.voiceChannelData.set(voiceChannel.id, {
          originalName: voiceChannel.name,
          originalTopic: voiceChannel.topic,
        });
      }

      const botMember = guild.members.me!;
      const permissions = voiceChannel.permissionsFor(botMember);

      if (!permissions?.has("ManageChannels")) {
        return;
      }

      const statusText = `🎵 ${trackTitle}`;

      let success = await this.createVoiceStatusAPI(
        voiceChannel.id,
        statusText
      );
      if (success) return;
      success = await this.createChannelTopic(
        voiceChannel,
        trackTitle
      );
      if (success) return;
    } catch (error: any) {
      console.error(
        `❌ Voice channel status creation failed: ${error.message}`
      );
    }
  }

  async clearVoiceChannelStatus(guildId: string): Promise<void> {
    try {
      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) return;

      const botMember = guild.members.me!;
      let voiceChannel: any = null;

      const player = (this.client as any).riffy?.players?.get(
        guildId
      );
      if (player && player.voiceChannel) {
        voiceChannel = guild.channels.cache.get(player.voiceChannel);
      }

      if (!voiceChannel && botMember.voice.channelId) {
        voiceChannel = guild.channels.cache.get(
          botMember.voice.channelId
        );
      }

      if (!voiceChannel) {
        for (const channel of guild.channels.cache.values()) {
          if (
            (channel as any).type === 2 &&
            this.voiceChannelData.has(channel.id)
          ) {
            voiceChannel = channel;
            break;
          }
        }
      }

      if (!voiceChannel) return;

      const permissions = voiceChannel.permissionsFor(botMember);
      if (!permissions?.has("ManageChannels")) {
        return;
      }

      let success = await this.deleteVoiceStatusAPI(voiceChannel.id);
      if (success) return;
      success = await this.deleteChannelTopic(voiceChannel);
      if (success) return;
    } catch (error: any) {
      console.error(
        `❌ Voice channel status clearing failed: ${error.message}`
      );
    }
  }

  private async createVoiceStatusAPI(
    channelId: string,
    statusText: string
  ): Promise<boolean> {
    try {
      await (this.client.rest as any).put(
        `/channels/${channelId}/voice-status`,
        {
          body: { status: statusText },
        }
      );
      return true;
    } catch {
      return false;
    }
  }

  private async deleteVoiceStatusAPI(
    channelId: string
  ): Promise<boolean> {
    try {
      await (this.client.rest as any).put(
        `/channels/${channelId}/voice-status`,
        {
          body: { status: null },
        }
      );
      return true;
    } catch {
      try {
        await (this.client.rest as any).delete(
          `/channels/${channelId}/voice-status`
        );
        return true;
      } catch {
        return false;
      }
    }
  }

  private async createChannelTopic(
    voiceChannel: any,
    trackTitle: string
  ): Promise<boolean> {
    try {
      const topicText = `🎵 Now Playing: ${trackTitle}`;
      await voiceChannel.setTopic(topicText);
      return true;
    } catch {
      return false;
    }
  }

  private async deleteChannelTopic(
    voiceChannel: any
  ): Promise<boolean> {
    try {
      const originalData = this.voiceChannelData.get(voiceChannel.id);
      const originalTopic = originalData?.originalTopic || null;

      await voiceChannel.setTopic(originalTopic);
      this.voiceChannelData.delete(voiceChannel.id);
      return true;
    } catch {
      return false;
    }
  }

  async setDefaultStatus(): Promise<void> {
    this.isPlaying = false;
    await this.updatePresence(false);
  }

  async setPlayingStatus(): Promise<void> {
    this.isPlaying = true;
    await this.updatePresence(true);
  }

  startPresenceRefresh(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    this.refreshInterval = setInterval(async () => {
      await this.updatePresence(this.isPlaying);
    }, 60000);
  }

  stopPresenceRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  async onTrackStart(guildId: string): Promise<void> {
    await this.setPlayingStatus();
    const player = (this.client as any).riffy?.players?.get(guildId);
    const trackTitle = player?.current?.info?.title;
    if (trackTitle) {
      await this.setVoiceChannelStatus(guildId, trackTitle);
    }
  }

  async onTrackEnd(guildId: string): Promise<void> {
    const player = (this.client as any).riffy?.players?.get(guildId);
    if (!player || !player.playing || player.queue.length === 0) {
      this.isPlaying = false;
    }
  }

  async onPlayerDisconnect(guildId: string | null = null): Promise<void> {
    await this.setDefaultStatus();

    if (guildId) {
      await this.clearVoiceChannelStatus(guildId);
    } else {
      for (const guild of this.client.guilds.cache.values()) {
        await this.clearVoiceChannelStatus(guild.id);
      }
    }
  }
}
