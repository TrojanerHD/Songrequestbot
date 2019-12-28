import request from 'request-promise';
import express, {Express} from 'express';
import querystring from 'querystring';
import * as secrets from '../secrets.json';
import EventEmitter from 'events';
import {IncomingMessage} from 'http';

type res = {
  send: (message: string) => void,
  cookie: (
      name: string,
      value: string) => void, redirect: (url: string) => void
}

export default class Server extends EventEmitter {
  private _app: Express;

  constructor() {
    super();
    this._app = express();
  }

  startServer() {
    console.log('Listening on 8888');
    const redirect_uri = 'http://localhost:8888/callback', // Your redirect uri
        scopes = 'user-read-currently-playing user-modify-playback-state playlist-read-private playlist-modify-private user-read-playback-state',
        client_id: string = secrets.spotify.id,
        client_secret: string = secrets.spotify.secret;

    function generateRandomString(length: number): string {
      let text = '';
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (let i = 0; i < length; i++) text += possible.charAt(
          Math.floor(Math.random() * possible.length));
      return text;
    }

    const stateKey = 'spotify_auth_state';

    this._app.get('/', loginResponse);

    function loginResponse(
        req: IncomingMessage, res: res) {
      const state: string = generateRandomString(16);
      res.cookie(stateKey, state);

      res.redirect(
          `https://accounts.spotify.com/authorize?${querystring.stringify({
            response_type: 'code',
            client_id,
            scope: scopes,
            redirect_uri,
            state,
          })}`);
    }

    this._app.get('/callback',
        (req: { query: { code: string, state: string } }, res: res) => {
          const code: string = req.query.code || null;
          const state: string = req.query.state || null;

          if (state === null) res.redirect(`/#${querystring.stringify({
            error: 'state_mismatch',
          })}`);
          else {
            request.post({
              url: 'https://accounts.spotify.com/api/token',
              form: {
                code,
                redirect_uri,
                grant_type: 'authorization_code',
              },
              headers: {
                Authorization: `Basic ${Buffer.from(
                    `${client_id}:${client_secret}`).toString('base64')}`,
              },
              json: true,
            }).
                then(
                    (body: { 'refresh_token': string, 'access_token': string }) => {
                      const {refresh_token, access_token} = body;

                      this.emit('gotapikey', refresh_token, access_token);

                      res.send(
                          'Success! You may now close this tab and you are able to use the Songrequestbot now.');
                    }).
                catch((error: { error: string }) => {
                  if (error.error === 'invalid_grant') {
                    res.redirect(`/#${querystring.stringify({
                      error: 'invalid_token',
                    })}`);
                    return;
                  }
                  console.error(`${error} in server.ts on line 96`);
                });
          }
        });
    this._app.listen(8888);
  }
}
