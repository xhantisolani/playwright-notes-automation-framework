import { expect, test as base } from './notes.fixture';

const blockedThirdPartyHosts = [
  'doubleclick.net',
  'google-analytics.com',
  'googleadservices.com',
  'googlesyndication.com',
  'googletagmanager.com',
  'pagead2.googlesyndication.com',
];

interface UiFixtures {
  blockThirdPartyNoise: void;
}

export const test = base.extend<UiFixtures>({
  blockThirdPartyNoise: [
    async ({ page }, use) => {
      await page.route('**/*', async (route) => {
        const requestUrl = route.request().url();

        if (blockedThirdPartyHosts.some((host) => requestUrl.includes(host))) {
          await route.abort();
          return;
        }

        await route.continue();
      });

      await use();
    },
    { auto: true },
  ],
});

export { expect };
