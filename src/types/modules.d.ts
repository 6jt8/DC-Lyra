declare module "better-sqlite3" {
  class Database {
    constructor(path: string);
    pragma(source: string): void;
    prepare(sql: string): { all: (...args: any[]) => any[]; run: (...args: any[]) => { changes: number } };
    close(): void;
  }
  export default Database;
}

declare module "spotify-web-api-node" {
  interface SpotifyWebApiOptions {
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
  }

  interface SpotifyApiCredentials {
    access_token: string;
    token_type: string;
    expires_in: number;
  }

  interface SpotifyPlaylistTrackItem {
    track: {
      name: string;
      artists: Array<{ name: string }>;
    } | null;
  }

  interface SpotifyPlaylistResponse {
    body: {
      total: number;
      items: SpotifyPlaylistTrackItem[];
    };
  }

  class SpotifyWebApi {
    constructor(options?: SpotifyWebApiOptions);
    clientCredentialsGrant(): Promise<{ body: SpotifyApiCredentials }>;
    setAccessToken(token: string): void;
    getPlaylistTracks(playlistId: string, options?: { limit?: number; offset?: number }): Promise<SpotifyPlaylistResponse>;
  }

  export default SpotifyWebApi;
}

declare module "spotify-url-info" {
  interface SpotifyData {
    type: "track" | "playlist" | "album";
    name?: string;
    artists?: Array<{ name: string }>;
    tracks?: Array<{ name: string; artists: Array<{ name: string }> }>;
    trackList?: Array<{ title: string; artist: string }>;
  }

  interface ScrapedTrack {
    artist: string;
    duration?: number;
    name: string;
    previewUrl?: string;
    uri: string;
  }

  interface SpotifyUrlInfo {
    getData: (url: string, opts?: RequestInit) => Promise<SpotifyData>;
    getTracks: (url: string, opts?: RequestInit) => Promise<ScrapedTrack[]>;
    getDetails: (url: string, opts?: RequestInit) => Promise<{ preview: any; tracks: ScrapedTrack[] }>;
    getPreview: (url: string, opts?: RequestInit) => Promise<any>;
    getLink: (data: unknown) => string;
  }

  function getDataFactory(fetch: typeof globalThis.fetch): SpotifyUrlInfo;

  export default getDataFactory;
}
