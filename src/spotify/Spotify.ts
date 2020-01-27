import { Cache, RequestOptions } from '../Cache';
import { AccessToken } from './AccessToken';
import { Executor } from '../Executor';

/**
 * A thrown error when the Spotify API returns it
 */
export interface SpotifyError {
  error: { error: { status: number; message: string } } | {};
}

/**
 * A response for a currently playing request
 */
export type CurrentlyPlayingRequest = undefined | { progress_ms?: number };

export class Spotify {
  _accessToken: string | undefined;
  private readonly _executor: Executor;
  private readonly _cache: Cache;

  /**
   * Spotify API handler
   * @param executor
   * @param accessToken The access token for Spotify
   */
  constructor(executor: Executor, accessToken: string | undefined = undefined) {
    this._executor = executor;
    this._cache = new Cache(executor);
    if (!new AccessToken(this._executor, this._cache).checkForExistingToken()) {
      return;
    }
    this._accessToken = accessToken;
  }

  /**
   * Creates a request that gets data for the currently playing Spotify track
   * @param response A callback function for the currently playing request
   */
  createCurrentlyPlayingRequest(
    response: (body: CurrentlyPlayingRequest) => void
  ): void {
    const options: RequestOptions = {
      method: 'GET',
      url: 'https://api.spotify.com/v1/me/player/currently-playing',
      headers: {
        Authorization: `Bearer ${this._accessToken}`,
      },
      json: true,
    };
    this._cache.addRequest(
      options,
      response,
      this.currentlyPlayingError.bind(this)
    );
  }

  /**
   * The callback function when there was an error when requesting the data of the Spotify track that is currently playing
   * @param error
   */
  currentlyPlayingError(error: SpotifyError): void {
    const realError: { status: number; message: string } | undefined =
      'error' in error && 'error' in error.error
        ? error.error.error
        : undefined;
    if (
      realError &&
      realError.status === 401 &&
      (realError.message === 'Invalid access token' ||
        realError.message === 'The access token expired')
    ) {
      new AccessToken(this._executor, this._cache).checkForExistingToken();
    } else console.error(error);
  }
}
/*
Restart
- refresh token stored?
Yes:
resfresh-token -> Spotify API -> access-token

No:
Login in Browser
- refresh-token stored in refresh_token.txt
- access-token -> Requests (Currently playing, play song, etc.)
 */
