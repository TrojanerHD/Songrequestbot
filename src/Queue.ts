export class Queue {
  _queue: Array<{ requester: string }>;

  /**
   * The queue of song requests
   */
  constructor() {
    this._queue = [];
  }
}