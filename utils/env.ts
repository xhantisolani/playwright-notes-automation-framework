import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import type { AuthSession } from '../types/notes';
import { resolveEnvironmentProfile } from './envProfiles';

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function readBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'y'].includes(value.toLowerCase());
}

const testUserEmail = process.env.TEST_USER_EMAIL?.trim() || undefined;
const testUserPassword = process.env.TEST_USER_PASSWORD?.trim() || undefined;
const environmentProfile = resolveEnvironmentProfile(process.env.TEST_ENV);

if ((testUserEmail && !testUserPassword) || (!testUserEmail && testUserPassword)) {
  throw new Error('Set both TEST_USER_EMAIL and TEST_USER_PASSWORD, or leave both empty.');
}

export const paths = {
  authDir: path.resolve(process.cwd(), 'playwright/.auth'),
  authFile: path.resolve(process.cwd(), 'playwright/.auth/user.json'),
  authSessionFile: path.resolve(process.cwd(), 'playwright/.auth/session.json'),
};

export const env = {
  testEnv: environmentProfile.name,
  uiBaseUrl: trimTrailingSlash(process.env.BASE_URL ?? environmentProfile.uiBaseUrl),
  apiBaseUrl: trimTrailingSlash(process.env.API_BASE_URL ?? environmentProfile.apiBaseUrl),
  testUserName: process.env.TEST_USER_NAME?.trim() || 'Playwright Learner',
  testUserEmail,
  testUserPassword,
  keepTestAccount: readBoolean(process.env.KEEP_TEST_ACCOUNT),
  runVisual: readBoolean(process.env.RUN_VISUAL),
  runJourney: readBoolean(process.env.RUN_JOURNEY),
  ci: readBoolean(process.env.CI),
};

export function readAuthSession(): AuthSession | null {
  if (!fs.existsSync(paths.authSessionFile)) {
    return null;
  }

  const rawSession = fs.readFileSync(paths.authSessionFile, 'utf-8');
  return JSON.parse(rawSession) as AuthSession;
}

export function writeAuthSession(session: AuthSession): void {
  fs.mkdirSync(paths.authDir, { recursive: true });
  fs.writeFileSync(paths.authSessionFile, JSON.stringify(session, null, 2));
}
