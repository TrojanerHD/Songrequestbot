import * as Settings from './settings'
import * as secrets from '../secrets.json'
import tmi from 'tmi.js'

const settings = Settings.default()

export default function initialize () {
  const options = JSON.parse(`{ "identity": { "username": "LiterallyAnything", "password": "${secrets.twitch.password}" }, "channels": [ "${settings.twitch.username.toLowerCase()}" ] }`)

  const client = new tmi.Client(options)

  client.on('connected', onConnectedHandler)
}

function onMessageHandler (target, context, msg, self) {
  if (self) return
  if (!msg.startsWith(settings.prefix)) return
//TODO 12/01/2019 09:04 PM: Add actual stuff
}

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`)
}