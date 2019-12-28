import Cache from './cache';
import AccessToken from './accesstoken';
import Executor, {Service} from './executor';

type Song = {
  item: {}
}

export default class initialize {
  _accessToken: string | undefined;
  private readonly _executor: Executor;
  private readonly _cache: Cache;

  constructor(executor: Executor, accessToken: string = undefined) {
    this._executor = executor;
    const checkForAccessToken: AccessToken = new AccessToken(this._executor,
        this._cache);
    if (!checkForAccessToken._refreshTokenExists) return;
    this._accessToken = accessToken;
    const options: any = {
      method: 'GET',
      url: 'https://api.spotify.com/v1/me/player/currently-playing',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      json: true,
    };

    this._cache = new Cache(this._executor);
    this._cache.addRequest(options, this.currentlyPlaying.bind(this),
        this.currentlyPlayingError.bind(this));
  }

  currentlyPlaying(body: Song): void {
    console.log(body);
    if (body === undefined || body.item === undefined || body.item ===
        null) return;
    this._executor._spotify.updateTrigger(this._executor);
  }

  currentlyPlayingError(error): void {
    const realError = 'error' in error && 'error' in error.error ?
        error.error.error :
        undefined;
    if (realError !== undefined && realError.status === 401 &&
        (realError.message === 'Invalid access token' || realError.message ===
            'The access token expired')) {
      new AccessToken(this._executor, this._cache);
    } else {
      console.error(error);
      this._executor._spotify.updateTrigger(this._executor);
    }
  }

  updateTrigger(executor: Executor): void {
    executor.update(Service.Spotify, this.updateSpotify.bind(this));
  }

  updateSpotify(): void {
    this._executor._spotify = new initialize(this._executor,
        this._accessToken ? this._accessToken : undefined);
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