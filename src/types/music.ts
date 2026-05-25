import { Player } from "riffy";

export interface TrackInfoData {
  title: string;
  author: string;
  length: number;
  uri: string;
  thumbnail: string;
  sourceName: string;
  requester?: string;
}

export interface PlayerState {
  paused: boolean;
  loop: string;
  currentPosition: number;
  queueLength: number;
  commandMentionMap?: Map<string, string>;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface TrackMediaCacheEntry {
  trackUri: string;
  mediaUrl: string | null;
  cardBuffer: Buffer | null;
}

export interface NowPlayingMessage {
  messageId: string;
  channelId: string;
  player?: Player;
  trackUri?: string;
  type?: string;
}

export interface ActionRows {
  playbackRow?: any;
  manageRow?: any;
  filterRow?: any;
}

export interface MusicCardOptions {
  thumbnailURL: string;
  trackURI: string;
  songTitle: string;
  songArtist: string;
  trackRequester: string;
  isPlaying: boolean;
  showVisualizer: boolean;
  currentPositionMs: number;
  totalDurationMs: number;
}

export interface CommandMentionCache {
  expiresAt: number;
  map: Map<string, string>;
}

export interface GuildActivityFilter {
  filter: string;
}
