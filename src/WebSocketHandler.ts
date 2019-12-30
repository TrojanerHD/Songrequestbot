import WebSocket from 'ws';
import Settings from './Settings';
import Executor from './Executor';

export default class WebSocketHandler {
  private _ws: WebSocket;
  private readonly _executor: Executor;

  constructor(executor: Executor) {
    this._executor = executor;
    const wss: WebSocket = new WebSocket.Server({port: 8889});
    wss.on('connection', this.onConnection.bind(this));
  }

  onConnection(ws: WebSocket): void {
    this._ws = ws;
    ws.send(JSON.stringify(
        {type: 'settings', value: new Settings().getSettings()}));
    ws.send(JSON.stringify({
      type: 'songrequest', value: {
        title: 'Crab Rave',
        artists: 'Noisestorm',
        totalDuration: 12000,
        requester: 'Trojaner',
        origin: 'Spotify',
      },
    }));
    ws.send(JSON.stringify({
      type: 'songrequest', value: {
        title: 'Megalovania',
        artists: 'Toby Fox',
        totalDuration: 12000,
        requester: 'Trojaner',
        origin: 'Spotify',
      },
    }));

    ws.on('message', this.onMessageHandler.bind(this));
  }

  onMessageHandler(message: string): void {
    const settings: Settings = new Settings();

    const {event, value} = JSON.parse(message);
    switch (event) {
      case 'message':
        this._executor._twitch._client.say(
            settings.getSettings().twitch.username, value);
        break;
      case 'twitch-username':
        settings._settings.twitch.username = value;
        settings.saveSettings();
        break;
      case 'aliases':
        for (let i = 0; i < Object.keys(value).length; i++) {
          const key: string = Object.keys(value)[i];
          const aliasValue: any = Object.values(value)[i];
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
        const value1 = event === 'disabled-services' ? 'disabled' : 'discord';
        const value2 = event === 'disabled-services' ? 'services' : 'mod-roles';
        if (value.length === 1 && value[0] ===
            '') settings._settings[value1][value2] = [];
        else settings._settings[value1][value2] = value;
        settings.saveSettings();
        break;
      case 'viewers-required-song-skip':
        settings._settings.properties.skip = value;
        settings.saveSettings();
        break;
      case 'maximum-length':
      case 'maximum-requests':
        if (value === '') {
          settings._settings.limitations[value === 'maximum-length' ?
              'length' :
              'requests'] = null;
          settings.saveSettings();
          break;
        }
        if (isNaN(value)) break;
        settings._settings.limitations[value === 'maximum-length' ?
            'length' :
            'requests'] = parseInt(value);
        settings.saveSettings();
        break;
      case 'prefix':
        if (value === '' || value.match(/.{1,3}/)[0] !== value) break;
        settings._settings.prefix = value;
        settings.saveSettings();
        break;
      default:
        console.log(message);
        break;
    }
  }
}