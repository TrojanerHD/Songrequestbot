import { Spotify, Response } from '../spotify/Spotify';
import { Executor } from '../Executor';

export class Skip {
  private _spotifySkip = false;

  /**
   * Handles the skip command
   * @param executor
   */
  constructor(executor: Executor) {
    const spotify: Spotify = new Spotify(executor);
    spotify.getCurrentlyPlaying(this.currentlyPlayingResponse.bind(this));
  }

  /**
   * The callback function for the request of currently playing track on Spotify
   * @param body The body of the response
   */
  currentlyPlayingResponse(body: Response): void {
    if (!body || !('progress_ms' in body) || body.progress_ms === 0) {
      this._spotifySkip = true;
    }
  }
}
