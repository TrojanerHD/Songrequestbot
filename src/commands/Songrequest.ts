import Executor from '../Executor';
import Settings, {SettingsProperties} from '../Settings';
import MessageHandler from '../MessageHandler';

export default class Songrequest {
  private _executor: Executor;

  constructor(executor: Executor, args: string[], displayName: string,
              messageHandler: MessageHandler) {
    this._executor = executor;
    const settings: SettingsProperties = new Settings().getSettings();
    if (args.length === 0) messageHandler.sendMessage(
        `You have to specify the name/url of the track (!${settings.commands.songrequest[0]} <query>)`);
    if (this.maximumSongRequestsWereMadeByUser(displayName, settings)) {
      messageHandler.sendMessage(
          `You have already requested a maximum of ${settings.limitations.requests} songs`);
      return;
    }
  }

  maximumSongRequestsWereMadeByUser(
      displayName: string, settings: SettingsProperties): boolean {
    let totalRequests: number = 0;
    for (const request of this._executor._queue._queue)
      if (request.requester === displayName) totalRequests++;
    return totalRequests >= settings.limitations.requests;
  }
}