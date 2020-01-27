import { Executor } from '../Executor';
import { Settings, SettingsProperties } from '../Settings';
import { MessageHandler } from '../MessageHandler';

export class Songrequest {
  private _executor: Executor;

  /**
   * Initializes the songrequest class
   * @param executor
   */
  constructor(executor: Executor) {
    this._executor = executor;
  }

  /**
   * Handles the songrequest command
   * @param args The arguments of the command
   * @param displayName The username of the requester
   * @param messageHandler
   */
  handleMessage(
    args: string[],
    displayName: string,
    messageHandler: MessageHandler
  ): void {
    const settings: SettingsProperties = new Settings().getSettings();
    if (args.length === 0) {
      messageHandler.sendMessage(
        `You have to specify the name/url of the track (!${settings.commands.songrequest[0]} <query>)`
      );
    }
    if (this.maximumSongRequestsWereMadeByUser(displayName, settings.limitations.requests)) {
      messageHandler.sendMessage(
        `You have already requested a maximum of ${settings.limitations.requests} songs`
      );
      return;
    }
  }

  /**
   * Checks whether the requester has not made their maximum amount of requests
   * @param displayName The username of the requester
   * @param maxRequests The maximum amount of songrequests
   * @returns Whether the requester has not made their maximum amount of requests
   */
  maximumSongRequestsWereMadeByUser(
    displayName: string,
    maxRequests: number | null
  ): boolean {
    let totalRequests = 0;
    for (const request of this._executor._queue._queue) {
      if (request.requester === displayName) totalRequests++;
    }
    if (maxRequests === null) return false;
    return totalRequests >= maxRequests;
  }
}
