import Spotify from '../Spotify';
import Executor from '../Executor';

export default class Skip {
  private _spotifySkip: boolean = false;

  constructor(executor: Executor) {
    const spotify: Spotify = new Spotify(executor);
    spotify.getCurrentlyPlaying(this.currentlyPlayingResponse.bind(this));
  }

  currentlyPlayingResponse(body): void {
    if (!body || !('progress_ms' in body) || body.progress_ms === 0)
      this._spotifySkip = true;
  }
}