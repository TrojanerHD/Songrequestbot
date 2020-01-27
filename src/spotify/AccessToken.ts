import * as request from 'request-promise';
import * as RefreshToken from './RefreshToken';
import { Spotify } from './Spotify';
import { Cache } from '../Cache';

import * as secrets from '../../secrets.json';
import { Executor } from '../Executor';

export class AccessToken {
  _refreshTokenExists = false;
  private readonly _executor: Executor;
  private readonly _cache: Cache | undefined;

  /**
   * Handles the Spotify Access Token
   */
  constructor(executor: Executor, cache: Cache | undefined = undefined) {
    this._executor = executor;
    this._cache = cache;
  }
  /**
   * Checks for an existing token in the refresh token file and starts a server if there is none
   * @return Whether the token existed.
   */
  checkForExistingToken(): boolean {
    const refreshToken: string | null = RefreshToken.getToken();
    if (refreshToken !== null) this.requestToken(refreshToken);
    else {
      this._executor._server.on('gotapikey', this.gotApiKey.bind(this));
      this._executor._server.accessToken();
      return false;
    }
    return true;
  }

  /**
   * Requests a new access token from Spotify
   * @param refreshToken The refresh token from Spotify
   */
  requestToken(refreshToken: string): void {
    request
      .post({
        url: 'https://accounts.spotify.com/api/token',
        form: {
          client_id: secrets.spotify.id,
          client_secret: secrets.spotify.secret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        },
        json: true,
      })
      .then(this.onTokenReceived.bind(this))
      .catch(console.error);
  }

  /**
   * The callback function for the token request
   * @param body The response body of the request
   */
  onTokenReceived(body: { access_token: string }): void {
    if (this._cache) {
      this._cache.executeRequest(body.access_token);
    } else {
      this._executor._spotify = new Spotify(this._executor, body.access_token);
    }
  }

  /**
   * Triggers when the user logged in
   * @param refreshToken The refresh token for Spotify
   * @param accessToken The access token for Spotify
   */
  gotApiKey(refreshToken: string, accessToken: string): void {
    RefreshToken.setToken(refreshToken);
    this._executor._spotify = new Spotify(this._executor, accessToken);
  }
}
