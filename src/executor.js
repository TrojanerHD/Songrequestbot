import Settings from './settings'
import Twitch from './twitch'
import Spotify from './spotify'

let spotify

export default function initialize () {
  const services = getServices()
  if (!services.includes('twitch')) Twitch()
  if (!services.includes('spotify')) spotify = new Spotify()
  // if (!services.includes('youtube')) YouTube()
}

export function update (service, updateFunction) {
  if (!getServices().includes(service)) setTimeout(updateFunction, 4500)
}

function getServices () {
  const settings = Settings()
  return settings.disabled.services
}

export function getSpotifyClass () {
  return spotify
}

export function setSpotifyClass (newSpotifyClass) {
  spotify = newSpotifyClass
}