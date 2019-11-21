import request from 'request-promise'
import express from 'express'
import querystring from 'querystring'
import * as secrets from '../secrets.json'
import EventEmitter from 'events'

export default class Server extends EventEmitter {
  constructor () {
    super()
    this._app = express()
  }

  startServer () {
    console.log('Listening on 8888')
    const redirect_uri = 'http://localhost:8888/callback', // Your redirect uri
      scopes = 'user-read-currently-playing user-modify-playback-state playlist-read-private playlist-modify-private user-read-playback-state',
      client_id = secrets.spotify.id,
      client_secret = secrets.spotify.secret

    function generateRandomString (length) {
      let text = ''
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

      for (let i = 0; i < length; i++) text += possible.charAt(Math.floor(Math.random() * possible.length))
      return text
    }

    const stateKey = 'spotify_auth_state'

    this._app.get('/', loginResponse)

    function loginResponse (req, res) {
      const state = generateRandomString(16)
      res.cookie(stateKey, state)

      res.redirect(`https://accounts.spotify.com/authorize?${querystring.stringify({
        response_type: 'code',
        client_id,
        scope: scopes,
        redirect_uri,
        state
      })}`)
    }

    this._app.get('/callback', (req, res) => {
      const code = req.query.code || null
      const state = req.query.state || null

      if (state === null) res.redirect(`/#${querystring.stringify({
        error: 'state_mismatch'
      })}`)
      else {
        request.post({
          url: 'https://accounts.spotify.com/api/token',
          form: {
            code,
            redirect_uri,
            grant_type: 'authorization_code'
          },
          headers: {
            Authorization: `Basic ${new Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`
          },
          json: true
        }).then(body => {
          const { refresh_token, access_token } = body

          this.emit('gotapikey', refresh_token, access_token)

          res.send('Success! You may now close this tab and you are able to use the Songrequestbot now.')
        }).catch(error => {
          if (error['error'] === 'invalid_grant') {
            res.redirect(`/#${querystring.stringify({
              error: 'invalid_token'
            })}`)
            return
          }
          console.error(`${error} in server.js on line 83`)
        })
      }
    })
    this._app.listen(8888)
  }
}
