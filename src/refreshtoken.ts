import fs from 'fs';

const refreshTokenFile: './refresh_token.txt' = './refresh_token.txt';

export function getToken(): string {
  if (fs.existsSync(refreshTokenFile)) return fs.readFileSync(refreshTokenFile,
      'utf8');
  else return null;
}

export function setToken(refreshToken: string): void {
  fs.writeFileSync(refreshTokenFile, refreshToken, 'utf8');
}