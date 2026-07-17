export interface BotConfig {
  token: string;
  clientId: string;
  language: string;
  ownerID: string[];
  djRole?: string;
  databaseUrl: string;
  spotifyClientId: string;
  spotifyClientSecret: string;
  setupFilePath: string;
  commandsDir: string;
  port: number;
  embedColor: string;
  customEmoji: boolean;
  emojiTheme: string;
  helpBannerUrl: string;
  activityName: string;
  activityType: string;
  links: BotLinks;
  embedTimeout: number;
  showProgressBar: boolean;
  showVisualizer: boolean;
  generateSongCard: boolean;
  metadataTag: boolean;
  lowMemoryMode: boolean;
  progressUpdateInterval?: number;
  maxQueueSize?: number;
  maxPlaylistTracks?: number;
  defaultVolume?: number;
  disconnectTimeoutMs?: number;
  errorLog: string;
  voiceDebug?: boolean;
  enableVoiceChannelIdPatch?: boolean;
  applicationEmojis: ApplicationEmojiConfig;
  nodes: LavalinkNodeConfig[];
  useIntents?: boolean;
}

export interface BotLinks {
  supportServer: string;
  github: string;
  website: string;
}

export interface ApplicationEmojiConfig {
  enabled: boolean;
  autoSync: boolean;
  deleteMissing: boolean;
  emojiDir: string;
}

export interface LavalinkNodeConfig {
  name: string;
  password: string;
  host: string;
  port: number;
  secure: boolean;
}
