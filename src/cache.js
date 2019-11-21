import * as request from 'request-promise'

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
    const { options, handler, error } = this._request

    request(options).then(handler).catch(error)
  }
}