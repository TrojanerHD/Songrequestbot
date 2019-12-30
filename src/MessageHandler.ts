import Executor, {Service} from './Executor';
import Settings from './Settings';

export default class MessageHandler {
  private readonly _origin: Service;
  private readonly _executor: Executor;

  constructor(origin: Service, executor: Executor) {
    this._origin = origin;
    this._executor = executor;
  }

  sendMessage(message: string): void {
    switch (this._origin) {
      case Service.Twitch:
        this._executor._twitch._client.say(
            new Settings().getSettings().twitch.username, message);
        break;
      case Service.YouTube:
        break;
    }
  }
}