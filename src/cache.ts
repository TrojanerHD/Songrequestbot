import request from 'request-promise';
import Executor from './executor';

type options = { method: string, url: string, headers: { Authorization: string }, json: boolean };
type handler = (body) => void;
type error = (error) => void;

export default class Cache {
  private _request: { options: options, handler: handler, error: error };
  private _executor: Executor;

  constructor(executor: Executor) {
    this._executor = executor;
  }

  addRequest(options: options, handler: handler, error: error): void {
    this._request = {options, handler, error};
    request(options).then(handler).catch(error);
  }

  executeRequest(accessToken: string): void {
    this._request.options.headers.Authorization = `Bearer ${accessToken}`;
    this._executor._spotify._accessToken = accessToken;

    const {options, handler, error}: { options: options, handler: handler, error: error } = this._request;

    request(options).then(handler).catch(error);
  }
}