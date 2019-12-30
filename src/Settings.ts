import path from 'path';
import fs from 'fs';
import os from 'os';
import lodash from 'lodash';

const appRoot = path.join(os.homedir(), 'Songrequestbot');
if (!fs.existsSync(appRoot)) fs.mkdirSync(appRoot, {recursive: true});

export interface SettingsProperties {
  twitch: { username: string },
  commands: { songrequest: string[], skip: string[] },
  disabled: { services: any },
  properties: { skip: { viewers: string } },
  limitations: { length: number, requests: number },
  discord?: { 'mod-roles'?: any } | {},
  prefix: string,
  'reduced-debugging': boolean
}

export default class Settings {
  _settings: SettingsProperties = JSON.parse(
      fs.readFileSync(this.getSettingsPath()).toString());

  getSettings(): SettingsProperties {
    if (this._settings.limitations.length ===
        null) this._settings.limitations.length = Infinity;
    if (this._settings.limitations.requests ===
        null) this._settings.limitations.requests = Infinity;
    lodash.defaultsDeep(this._settings, {
      prefix: '!',
      disabled: {services: []},
      commands: {songrequest: ['sr'], skip: ['skip']},
      properties: {skip: {viewers: '25%'}},
      limitations: {length: Infinity, requests: Infinity},
    });
    this.saveSettings();
    return this._settings;
  }

  saveSettings(): void {
    fs.writeFileSync(this.getSettingsPath(), JSON.stringify(this._settings));
  }

  getSettingsPath(): string {
    return path.join(appRoot, 'settings.json');
  }
}