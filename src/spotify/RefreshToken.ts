import * as fs from 'fs';
/**
 * The refresh token file
 */
const refreshTokenFile = './refresh_token.txt';

/**
 * Receives the token from the refresh token file
 * @returns The stored token if there is any
 */
export function getToken(): string | null {
  return fs.existsSync(refreshTokenFile) ? fs.readFileSync(refreshTokenFile, 'utf8') : null;
}

/**
 * Stores the refresh token in the refresh token file
 * @param refreshToken The refresh token to store
 */
export function setToken(refreshToken: string): void {
  fs.writeFileSync(refreshTokenFile, refreshToken, 'utf8');
}
