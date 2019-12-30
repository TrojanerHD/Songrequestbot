import Cache from './Cache';
import AccessToken from './AccessToken';
import Executor from './Executor';

type Song = {
  item: {}
}

export default class Spotify {
  _accessToken: string | undefined;
  private readonly _executor: Executor;
  private readonly _cache: Cache;

  constructor(executor: Executor, accessToken: string = undefined) {
    this._executor = executor;
    const checkForAccessToken: AccessToken = new AccessToken(this._executor,
        this._cache);
    if (!checkForAccessToken._refreshTokenExists) return;
    this._accessToken = accessToken;
    this._cache = new Cache(this._executor);
  }

  getCurrentlyPlaying(response: (body) => void) {
    const options: any = {
      method: 'GET',
      url: 'https://api.spotify.com/v1/me/player/currently-playing',
      headers: {
        Authorization: `Bearer ${this._accessToken}`,
      },
      json: true,
    };
    this._cache.addRequest(options, response,
        this.currentlyPlayingError.bind(this));
  }

  currentlyPlayingError(error): void {
    const realError = 'error' in error && 'error' in error.error ?
        error.error.error :
        undefined;
    if (realError !== undefined && realError.status === 401 &&
        (realError.message === 'Invalid access token' || realError.message ===
            'The access token expired')) {
      new AccessToken(this._executor, this._cache);
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