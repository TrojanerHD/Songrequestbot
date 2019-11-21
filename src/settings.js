import path from 'path'
import fs from 'fs'
import os from 'os'

const appRoot = path.join(os.homedir(), 'Songrequestbot')
if (!fs.existsSync(appRoot)) fs.mkdirSync(appRoot, { recursive: true })

export default function getSettings () {
  return require(`${appRoot}/settings`)
}