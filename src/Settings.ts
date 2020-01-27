import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import lodash from 'lodash';
import { Service } from './Executor';

const appRoot = path.join(os.homedir(), 'Songrequestbot');
if (!fs.existsSync(appRoot)) fs.mkdirSync(appRoot, { recursive: true });

export interface SettingsProperties {
  twitch: { username: string };
  commands: { songrequest: string[]; skip: string[] };
  disabled: { services: Service[] };
  properties: { skip: { viewers: string } };
  limitations: { length: number | null; requests: number | null };
  discord: { 'mod-roles': string[] | [] };
  prefix: string;
  'reduced-debugging': boolean;
}

export class Settings {
  _settings: SettingsProperties = JSON.parse(
    fs.readFileSync(this.getSettingsPath()).toString()
  );

  /**
   * Retrieves the settings
   * @returns The settings
   */
  getSettings(): SettingsProperties {
    if (this._settings.limitations.length === null) {
      this._settings.limitations.length = Infinity;
    }
    if (this._settings.limitations.requests === null) {
      this._settings.limitations.requests = Infinity;
    }
    lodash.defaultsDeep(this._settings, {
      prefix: '!',
      disabled: { services: [] },
      commands: { songrequest: ['sr'], skip: ['skip'] },
      properties: { skip: { viewers: '25%' } },
      limitations: { length: Infinity, requests: Infinity },
      discord: { 'mod-roles': [] },
    });
    this.saveSettings();
    return this._settings;
  }

  /**
   * Saves the settings
   */
  saveSettings(): void {
    fs.writeFileSync(this.getSettingsPath(), JSON.stringify(this._settings));
  }

  /**
   * Retrieves the path to the settings file
   * @returns The path to the settings file
   */
  getSettingsPath(): string {
    return path.join(appRoot, 'settings.json');
  }
}
