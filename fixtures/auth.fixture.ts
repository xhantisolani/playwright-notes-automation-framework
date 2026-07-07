import { expect, test as base } from '@playwright/test';
import type { AuthSession } from '../types/notes';
import { env, paths, readAuthSession } from '../utils/env';

interface AuthFixtures {
  authSession: AuthSession;
  authToken: string;
  testMetadata: void;
}

export const test = base.extend<AuthFixtures>({
  testMetadata: [
    async ({ request: _request }, use, testInfo) => {
      const file = testInfo.file.replace(/\\/g, '/');
      const layer = file.includes('/api/')
        ? 'api'
        : file.includes('/e2e/')
          ? 'e2e'
          : file.includes('/setup/')
            ? 'setup'
            : 'ui';

      testInfo.annotations.push(
        { type: 'environment', description: env.testEnv },
        { type: 'layer', description: layer },
        { type: 'owner', description: 'QA Automation' },
      );

      await testInfo.attach('test-metadata', {
        body: JSON.stringify(
          {
            environment: env.testEnv,
            project: testInfo.project.name,
            layer,
            file,
          },
          null,
          2,
        ),
        contentType: 'application/json',
      });

      await use();
    },
    { auto: true },
  ],

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
