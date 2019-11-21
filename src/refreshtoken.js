import fs from 'fs'

const refreshTokenFile = './refresh_token.txt'

export function getToken () {
  if (fs.existsSync(refreshTokenFile))
    return fs.readFileSync(refreshTokenFile, 'utf8')
  else return null
}

export function setToken (refreshToken) {
  fs.writeFile(refreshTokenFile, refreshToken, writeRefreshTokenToFileResponse)

  function writeRefreshTokenToFileResponse (err) {
    if (err) console.error(err)
  }
}