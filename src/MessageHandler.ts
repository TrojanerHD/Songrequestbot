import { Executor, Service } from './Executor';
import { Settings } from './Settings';

export class MessageHandler {
  private readonly _origin: Service;
  private readonly _executor: Executor;
  
  /**
   * Handles messages and sends them to the specified service
   * @param origin The service of the message handler
   * @param executor
   */
  constructor(origin: Service, executor: Executor) {
    this._origin = origin;
    this._executor = executor;
  }

  /**
   * Sends a message to the service
   * @param message The message to be sent
   */
  sendMessage(message: string): void {
    switch (this._origin) {
      case Service.Twitch:
        if (!this._executor._twitch) return;
        this._executor._twitch._client.say(
          new Settings().getSettings().twitch.username,
          message
        );
        break;
      case Service.YouTube:
        break;
      default:
        throw new Error('Service not registered');
    }
  }
}
