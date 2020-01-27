import { Settings, SettingsProperties } from './Settings';
import * as secrets from '../secrets.json';
import * as tmi from 'tmi.js';
import { Executor } from './Executor';
import { Songrequest } from './commands/Songrequest';
import { MessageHandler } from './MessageHandler';

export class Twitch {
  readonly _client: tmi.Client;
  private readonly _settings: SettingsProperties;
  private readonly _executor: Executor;
  private readonly _messageHandler: MessageHandler;

  /**
   * Twitch API handler
   * @param executor
   * @param messageHandler
   */
  constructor(executor: Executor, messageHandler: MessageHandler) {
    this._settings = new Settings().getSettings();
    this._executor = executor;
    this._messageHandler = messageHandler;
    const options: tmi.Options = {
      identity: {
        username: 'LiterallyAnything',
        password: secrets.twitch.password,
      },
      channels: [this._settings.twitch.username.toLowerCase()],
    };

    this._client = tmi.client(options);

    this._client.on('connected', this.onConnectedHandler.bind(this));
    this._client.on('message', this.onMessageHandler.bind(this));
    this._client.connect();
  }
/**
 * The callback function for the message handler that triggers whenever there was a message sent
 * @param channel The Twitch channel
 * @param userstate
 * @param message The message of the user
 * @param self Whether the message is sent by the bot
 */
  onMessageHandler(
    channel: string,
    userstate: tmi.Userstate,
    message: string,
    self: boolean
  ): void {
    if (self) return;
    if (!message.startsWith(this._settings.prefix)) return;
    message = message.replace(/^!/, '');
    const args: string[] = message.split(' ');
    if (args.length === 0) return;
    const firstArg: string | undefined = args.shift();
    const cmd: string = firstArg!.toLowerCase();

    if (this._settings.commands.songrequest.includes(cmd)) {
      const displayName: string = userstate['display-name']
        ? userstate['display-name']
        : userstate.username;
      new Songrequest(this._executor).handleMessage(
        args,
        displayName,
        this._messageHandler
      );
    }
    //TODO 12/01/2019 09:04 PM: Add actual stuff
  }

  /**
   * The callback function for the connected handler that triggers whenever the bot connects to Twitch
   * @param addr The address the bot connected to
   * @param port The port the bot connected to
   */
  onConnectedHandler(addr: string, port: number): void {
    console.log(`* Connected to ${addr}:${port}`);
  }
}
