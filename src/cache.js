import * as request from 'request-promise'
import { getSpotifyClass } from './executor'

export default class Cache {
  constructor () {
    this._request = {}
  }

  addRequest (options, handler, error) {
    this._request = { options, handler, error }
    request(options).then(handler).catch(error)
  }

  executeRequest (accessToken) {
    this._request.options.headers.Authorization = `Bearer ${accessToken}`
    getSpotifyClass()._accessToken = accessToken

    const { options, handler, error } = this._request

    request(options).then(handler).catch(error)
  }
}