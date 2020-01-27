import { Settings, SettingsProperties } from './Settings';
import { Twitch } from './Twitch';
import { Spotify } from './spotify/Spotify';
import { Server } from './Server';
import { Queue } from './Queue';
import { MessageHandler } from './MessageHandler';

/**
 * A song obtained from a request
 */
interface Song {
  item: {};
}

export enum Service {
  Twitch = 'twitch',
  Spotify = 'spotify',
  YouTube = 'youtube',
}

export class Executor {
  _spotify: Spotify | undefined;
  _twitch: Twitch | undefined;
  _server: Server;
  _queue: Queue;

  /**
   * The executor that starts the enabled services (e. g. Spotify)
   */
  constructor() {
    this._server = new Server(this);
    this._queue = new Queue();
  }

  /**
   * Initializer
   */
  init(): void {
    const disabledServices: Service[] = this.getDisabledServices();
    if (!disabledServices.includes(Service.Twitch)) {
      this._twitch = new Twitch(this, new MessageHandler(Service.Twitch, this));
    }
    if (!disabledServices.includes(Service.Spotify)) this._spotify = new Spotify(this);
    // if (!services.includes(Service.YouTube)) YouTube()
  }

  /**
   * Schedules a function if the service is still enabled
   * @param service The service to be started
   * @param updateFunction The function that will be triggered after the timeout
   */
  update(service: Service, updateFunction: () => void): void {
    setTimeout(() => {
      if (!this.getDisabledServices().includes(service)) updateFunction();
    }, 4500);
  }

  /**
   * Gets all disabled services
   * @returns The disabled services
   */
  getDisabledServices(): Service[] {
    const settings: SettingsProperties = new Settings().getSettings();
    return settings.disabled.services;
  }
}
