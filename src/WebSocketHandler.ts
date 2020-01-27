import * as WebSocket from 'ws';
import { Executor, Service } from './Executor';
import { Settings } from './Settings';
import { type } from 'os';
/**
 * The value of the websocket message that changes the settings
 */
type Value =
  | { songrequest?: string[]; aliases?: string[] }
  | string[]
  | string
  | Service[]
  | { viewers: string };

export class WebSocketHandler {
  private readonly _executor: Executor;

  /**
   * Handles the websocket actions
   * @param executor
   */
  constructor(executor: Executor) {
    this._executor = executor;
  }

  /**
   * Starts the websocket server
   */
  startWebSocketServer(): void {
    const wss: WebSocket.Server = new WebSocket.Server({ port: 8889 });
    wss.on('connection', this.onConnection.bind(this));
  }

  /**
   * The callback function that triggers whenever the websocket got a connection
   * @param ws The websocket that has got a connection
   */
  private onConnection(ws: WebSocket): void {
    ws.send(
      JSON.stringify({ type: 'settings', value: new Settings().getSettings() })
    );
    ws.send(
      JSON.stringify({
        type: 'songrequest',
        value: {
          title: 'Crab Rave',
          artists: 'Noisestorm',
          totalDuration: 12000,
          requester: 'Trojaner',
          origin: 'Spotify',
        },
      })
    );
    ws.send(
      JSON.stringify({
        type: 'songrequest',
        value: {
          title: 'Megalovania',
          artists: 'Toby Fox',
          totalDuration: 12000,
          requester: 'Trojaner',
          origin: 'Spotify',
        },
      })
    );

    ws.on('message', this.onMessageHandler.bind(this));
  }

  /**
   * The callback function that triggers whenever there is a received message from a websocket client
   * @param message The received message
   */
  private onMessageHandler(message: string): void {
    const settings: Settings = new Settings();

    const event: string = JSON.parse(message).event;
    let value: Value = JSON.parse(message).value;
    switch (event) {
      case 'message':
        if (!this._executor._twitch) return;
        if (typeof value !== 'string') {
          throw new Error('Expected string as value');
        }
        this._executor._twitch._client.say(
          settings.getSettings().twitch.username,
          value
        );
        break;
      case 'twitch-username':
        if (typeof value !== 'string') {
          throw new Error('Expected string as value');
        }
        settings._settings.twitch.username = value;
        settings.saveSettings();
        break;
      case 'aliases':
        for (let i = 0; i < Object.keys(value).length; i++) {
          const key: 'songrequest' | 'skip' =
            Object.keys(value)[i] === 'songrequest' ? 'songrequest' : 'skip';
          const aliasValue: string[] = Object.values(value)[i];
          if (aliasValue.length === 1 && aliasValue[0] === '') {
            settings._settings.commands[key] = [];
            settings.saveSettings();
            break;
          }
          settings._settings.commands[key] = aliasValue;
        }
        settings.saveSettings();
        break;
      case 'disabled-services':
      case 'mod-roles':
        if (typeof value !== 'object' || !('length' in value)) {
          throw new Error('value is not an object');
        }
        if (value.length === 1 && value[0] === '') {
          value = [];
        }

        if (event === 'disabled-services') {
          settings._settings.disabled.services = value as Service[];
        } else {
          settings._settings.discord['mod-roles'] = value;
        }
        settings.saveSettings();
        break;
      case 'viewers-required-song-skip':
        settings._settings.properties.skip = value as { viewers: string };
        settings.saveSettings();
        break;
      case 'maximum-length':
      case 'maximum-requests':
        if (value === '') {
          settings._settings.limitations[
            value === 'maximum-length' ? 'length' : 'requests'
          ] = null;
          settings.saveSettings();
          break;
        }
        if (isNaN(+value)) break;
        settings._settings.limitations[
          value === 'maximum-length' ? 'length' : 'requests'
        ] = +value;
        settings.saveSettings();
        break;
      case 'prefix':
        if (typeof value !== 'string') {
          throw new Error('Expected string as value');
        }
        if (value === '' || value.match(/.{1,3}/)![0] !== value) break;
        settings._settings.prefix = value;
        settings.saveSettings();
        break;
      default:
        throw new Error('Unregistered event');
    }
  }
}
