import Cache from './cache'
import AccessToken from './accesstoken'
import * as RefreshToken from './refreshtoken'

export default function initialize (accessToken) {
  const options = {
    method: 'GET',
    url: 'https://api.spotify.com/v1/me/player/currently-playing',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    json: true
  }

  const cache = new Cache()
  cache.addRequest(options, currentlyPlaying, currentlyPlayingError)

  function currentlyPlaying (body) {
    console.log(body)
  }

  function currentlyPlayingError (error) {
    const realError = 'error' in error && 'error' in error.error ? error.error.error : undefined
    if (realError !== undefined && realError.status === 401 && (realError.message === 'Invalid access token' || realError.message === 'The access token expired')) AccessToken.requestToken(RefreshToken.getToken(), cache)
    else console.error(error)
  }
}

/*
Restart
- refresh token stored?
Yes:
resfresh-token -> Spotify API -> access-token

No:
Login in Browser
- refresh-token stored in refresh_token.txt
- access-token -> Requests (Currently playing, play song, etc.)

 */