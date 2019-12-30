import Settings, {SettingsProperties} from './Settings';
import Twitch from './Twitch';
import Spotify from './Spotify';
import Server from './Server';
import Queue from './Queue';
import MessageHandler from './MessageHandler';

export enum Service {
  Twitch = 'twitch',
  Spotify = 'spotify',
  YouTube = 'youtube'
}

export default class Executor {
  _spotify: Spotify;
  _twitch: Twitch;
  _server: Server;
  _queue: Queue;

  constructor() {
    const services: Service[] = this.getServices();
    this._server = new Server(this);
    this._queue = new Queue();

    if (!services.includes(Service.Twitch)) this._twitch = new Twitch(this,
        new MessageHandler(Service.Twitch, this));
    if (!services.includes(Service.Spotify)) this._spotify = new Spotify(this);
    // if (!services.includes(Service.YouTube)) YouTube()
  }

  update(service: Service, updateFunction: () => void): void {
    if (!this.getServices().includes(service)) setTimeout(updateFunction, 4500);
  }

  getServices(): Service[] {
    const settings: SettingsProperties = new Settings().getSettings();
    return settings.disabled.services;
  }
}