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
  }

  function getDataFactory(fetch: typeof globalThis.fetch): {
    getData: (url: string) => Promise<SpotifyData>;
  };

  export default getDataFactory;
}
