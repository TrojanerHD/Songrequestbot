import Settings, {SettingsProperties} from './settings';
import Twitch from './twitch';
import Spotify from './spotify';

export enum Service {
  Twitch = 'twitch',
  Spotify = 'spotify'
}

export default class Executor {
  _spotify: Spotify;

  constructor() {
    const services: Service[] = this.getServices();

    if (!services.includes(Service.Twitch)) Twitch();
    if (!services.includes(Service.Spotify)) this._spotify = new Spotify(this);
    // if (!services.includes(Service.YouTube)) YouTube()
  }

  update(service: Service, updateFunction: () => void): void {
    if (!this.getServices().includes(service)) setTimeout(updateFunction, 4500);
  }

  getServices(): Service[] {
    const settings: SettingsProperties = Settings();
    return settings.disabled.services;
  }
}