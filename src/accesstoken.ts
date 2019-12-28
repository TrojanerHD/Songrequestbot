import request from 'request-promise';
import * as RefreshToken from './refreshtoken';
import Server from './server';
import Spotify from './spotify';
import Cache from './cache';

import * as secrets from '../secrets.json';
import Executor from './executor';

export default class AccessToken {
  _refreshTokenExists: boolean = false;
  private readonly _executor: Executor;
  private readonly _cache: Cache | undefined;

  constructor(executor: Executor, cache: Cache | undefined = undefined) {
    this._executor = executor;
    this._cache = cache;
    const refreshToken: string | null = RefreshToken.getToken();
    if (refreshToken !== null) this.requestToken(refreshToken);
    else {
      const server: Server = new Server();

      server.on('gotapikey', this.gotApiKey.bind(this));
      server.startServer();
      return;
    }
    this._refreshTokenExists = true;
  }

  requestToken(refreshToken: string): void {
    request.post({
      url: 'https://accounts.spotify.com/api/token',
      form: {
        client_id: secrets.spotify.id,
        client_secret: secrets.spotify.secret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
      json: true,
    }).then(this.onTokenReceived.bind(this)).catch(console.error);
  }

  onTokenReceived(body: { access_token: string }): void {
    if (this._cache) this._cache.executeRequest(body.access_token);
    else new Spotify(this._executor, body.access_token);
  }

  gotApiKey(refresh_token: string, access_token: string): void {
    RefreshToken.setToken(refresh_token);
    new Spotify(this._executor, access_token);
  }
}