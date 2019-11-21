const path = require('path'),
  fs = require('fs')
const appRoot = path.join(require('os').homedir(), 'Songrequestbot')
if (!fs.existsSync(appRoot)) fs.mkdirSync(appRoot, { recursive: true })

export default class Settings {
  constructor () {
    this._settings = require(`${appRoot}/settings`)
  }
}