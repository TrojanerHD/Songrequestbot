export default class Queue {
  _queue: { requester: string }[];

  constructor() {
    this._queue = [];
  }
}