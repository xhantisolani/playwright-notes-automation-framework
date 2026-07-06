import { expect, test as base } from '@playwright/test';
import type { AuthSession } from '../types/notes';
import { paths, readAuthSession } from '../utils/env';

interface AuthFixtures {
  authSession: AuthSession;
  authToken: string;
}

export const test = base.extend<AuthFixtures>({
  authSession: async ({ request: _request }, use) => {
    const session = readAuthSession();

    if (!session) {
      throw new Error(
        `No auth session found at ${paths.authSessionFile}. Run the setup project first.`,
      );
    }

    await use(session);
  },

  authToken: async ({ authSession }, use) => {
    await use(authSession.token);
  },
});

export { expect };
