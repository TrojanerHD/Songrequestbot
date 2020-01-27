import request from 'request-promise';
import { Executor } from './Executor';
import { CurrentlyPlayingRequest, SpotifyError } from './spotify/Spotify';

/**
 * The request options for making a request to the Spotify API
 */
export interface RequestOptions {
  method: string;
  url: string;
  headers: { Authorization: string };
  json: boolean;
}
type handler = (body: CurrentlyPlayingRequest) => void;
type error = (error: SpotifyError) => void;

export class Cache {
  private _request:
    | {
        options: RequestOptions;
        handler: handler;
        error: error;
      }
    | undefined;
  private _executor: Executor;

  /**
   * Caches requests made to APIs
   * @param executor
   */
  constructor(executor: Executor) {
    this._executor = executor;
  }

  /**
   * Adds a request and tries to execute it
   * @param options
   * @param handler The handler that will be executed if the request was successful
   * @param error The error handler that will be executed if the request was unsuccessful
   */
  addRequest(options: RequestOptions, handler: handler, error: error): void {
    this._request = { options, handler, error };
    request(options)
      .then(handler)
      .catch(error);
  }

  /**
   * Executes the request
   * @param accessToken The new access token
   */
  executeRequest(accessToken: string): void {
    if (!this._request) return;
    this._request.options.headers.Authorization = `Bearer ${accessToken}`;
    if (!this._executor._spotify) return;
    this._executor._spotify._accessToken = accessToken;

    const {
      options,
      handler,
      error,
    }: {
      options: RequestOptions;
      handler: handler;
      error: error;
    } = this._request;

    request(options)
      .then(handler)
      .catch(error);
  }
}
