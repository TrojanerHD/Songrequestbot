import Settings, {SettingsProperties} from './Settings';
import * as secrets from '../secrets.json';
import tmi from 'tmi.js';
import Executor from './Executor';
import Songrequest from './commands/Songrequest';
import MessageHandler from './MessageHandler';

export default class Twitch {
  readonly _client: {
    on(type: 'connected', callback: (addr: string, port: string) => void),
    on(
        type: 'message',
        callback: (target: string, context: { 'display-name': string },
                   msg: string, self: boolean) => void),
    connect(),
    say(channel: string, message: string)
  };
  private readonly _settings: SettingsProperties;
  private readonly _executor: Executor;
  private readonly _messageHandler: MessageHandler;

  constructor(executor: Executor, messageHandler: MessageHandler) {
    this._settings = new Settings().getSettings();
    this._executor = executor;
    this._messageHandler = messageHandler;
    const options = JSON.parse(
        `{ "identity": { "username": "LiterallyAnything", "password": "${secrets.twitch.password}" }, "channels": [ "${this._settings.twitch.username.toLowerCase()}" ] }`);

    this._client = new tmi.client(options);

    this._client.on('connected', this.onConnectedHandler.bind(this));
    this._client.on('message', this.onMessageHandler.bind(this));
    this._client.connect();
  }

  onMessageHandler(
      target: string, context: { 'display-name': string }, msg: string,
      self: boolean): void {
    if (self) return;
    if (!msg.startsWith(this._settings.prefix)) return;
    msg = msg.replace(/^!/, '');
    const args: string[] = msg.split(' ');
    const cmd: string = args.shift().toLowerCase();

    if (this._settings.commands.songrequest.includes(cmd)) {
      new Songrequest(this._executor, args, context['display-name'],
          this._messageHandler);
    }
//TODO 12/01/2019 09:04 PM: Add actual stuff
  }

  onConnectedHandler(addr, port): void {
    console.log(`* Connected to ${addr}:${port}`);
  }
}
