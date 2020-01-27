import * as request from 'request-promise';
import express, { Response } from 'express';
import * as querystring from 'querystring';
import * as secrets from '../secrets.json';
import { EventEmitter } from 'events';
import { IncomingMessage } from 'http';
import { WebSocketHandler } from './WebSocketHandler';
import { Executor } from './Executor';

export class Server extends EventEmitter {
  private _app: express.Express;

  /**
   * The server that will give access to the dashboard that handles logins and front-end
   * @param executor
   */
  constructor(executor: Executor) {
    super();
    this._app = express();
    this._app.listen(8888);
    console.log('Listening on web server 8888');
    this._app.use(express.static('./src/html'));
    new WebSocketHandler(executor).startWebSocketServer();
  }
  /**
   * Starts the server that can receive the Spotify login from the user
   */
  accessToken(): void {
    const redirectUri: 'http://localhost:8888/callback' =
        'http://localhost:8888/callback', // Your redirect uri
      scopes =
        'user-read-currently-playing user-modify-playback-state playlist-read-private playlist-modify-private user-read-playback-state',
      clientId: string = secrets.spotify.id,
      clientSecret: string = secrets.spotify.secret;

    function generateRandomString(length: number): string {
      let text = '';
      const possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    }

    const stateKey = 'spotify_auth_state';

    this._app.get('/login', loginResponse);

    function loginResponse(req: IncomingMessage, res: Response) {
      const state: string = generateRandomString(16);
      res.cookie(stateKey, state);

      res.redirect(
        `https://accounts.spotify.com/authorize?${querystring.stringify({
          response_type: 'code',
          client_id: clientId,
          scope: scopes,
          redirect_uri: redirectUri,
          state,
        })}`
      );
    }

    this._app.get(
      '/callback',
      (req: { query: { code: string; state: string } }, res: Response) => {
        const code: string | null = req.query.code || null;
        const state: string | null = req.query.state || null;

        if (state === null) {
          res.redirect(
            `/#${querystring.stringify({
              error: 'state_mismatch',
            })}`
          );
        } else {
          request
            .post({
              url: 'https://accounts.spotify.com/api/token',
              form: {
                code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
              },
              headers: {
                Authorization: `Basic ${Buffer.from(
                  `${clientId}:${clientSecret}`
                ).toString('base64')}`,
              },
              json: true,
            })
            .then((body: { refresh_token: string; access_token: string }) => {
              const { refresh_token, access_token } = body;

              this.emit('gotapikey', refresh_token, access_token);

              res.redirect('/?authorized=true');
            })
            .catch((error: { error: string }) => {
              if (error.error === 'invalid_grant') {
                res.redirect(
                  `/#${querystring.stringify({
                    error: 'invalid_token',
                  })}`
                );
                return;
              }
              console.error(`${error} in server.ts on line 96`);
            });
        }
      }
    );
  }
}
