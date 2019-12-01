import path from 'path'
import fs from 'fs'
import os from 'os'
import lodash from 'lodash'

const appRoot = path.join(os.homedir(), 'Songrequestbot')
if (!fs.existsSync(appRoot)) fs.mkdirSync(appRoot, { recursive: true })

export default function getSettings () {
  const settings = JSON.parse(fs.readFileSync(path.join(appRoot, 'settings.json')))
  lodash.defaultsDeep(settings, { prefix: '!', disabled: { services: [] } })
  return settings
}

export function getSettingsPath () {
  return path.join(appRoot, 'settings.json')
}