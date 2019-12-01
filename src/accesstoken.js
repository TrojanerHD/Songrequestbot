import request from 'request-promise'
import * as RefreshToken from './refreshtoken'
import Server from './server'
import spotify from './spotify'

import * as secrets from '../secrets.json'

export default class AccessToken {
  constructor () {
    const refreshToken = RefreshToken.getToken()
    if (refreshToken !== null) AccessToken.requestToken(refreshToken)
    else server.startServer()
  }

  static requestToken (refreshToken, cache) {
    request.post({
      url: 'https://accounts.spotify.com/api/token',
      form: {
        client_id: secrets.spotify.id,
        client_secret: secrets.spotify.secret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      },
      json: true
    }).then(onTokenReceived).catch(console.error)

    function onTokenReceived (body) {
      if (cache) cache.executeRequest(body.access_token)
      else spotify(body.access_token)
    }
  }
}
const server = new Server()

server.on('gotapikey', gotApiKey)

function gotApiKey (refresh_token, access_token) {
  RefreshToken.setToken(refresh_token)
  spotify(access_token)
}