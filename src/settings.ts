import path from 'path';
import fs from 'fs';
import os from 'os';
import lodash from 'lodash';

const appRoot = path.join(os.homedir(), 'Songrequestbot');
if (!fs.existsSync(appRoot)) fs.mkdirSync(appRoot, {recursive: true});

export interface SettingsProperties {
  twitch: { username: string },
  commands?: { songrequest: any } | {},
  disabled: { services: any },
  properties?: { skip?: { viewers?: string } | {} } | {},
  limitations?: { length?: number, requests?: number } | {},
  discord?: { 'mod-roles'?: any } | {},
  prefix?: string,
  'reduced-debugging': boolean
}

export default function getSettings(): SettingsProperties {
  const settings: SettingsProperties = JSON.parse(
      fs.readFileSync(path.join(appRoot, 'Settings.json')).toString());
  lodash.defaultsDeep(settings, {prefix: '!', disabled: {services: []}});
  return settings;
}

export function getSettingsPath(): string {
  return path.join(appRoot, 'Settings.json');
}