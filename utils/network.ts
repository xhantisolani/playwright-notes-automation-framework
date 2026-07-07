import type { Page } from '@playwright/test';

const blockedThirdPartyHosts = [
  'doubleclick.net',
  'fundingchoicesmessages.google.com',
  'google-analytics.com',
  'googleadservices.com',
  'googlesyndication.com',
  'googletagmanager.com',
  'pagead2.googlesyndication.com',
];

export async function blockThirdPartyNoise(page: Page): Promise<void> {
  await page.route('**/*', async (route) => {
    const requestUrl = route.request().url();

    if (blockedThirdPartyHosts.some((host) => requestUrl.includes(host))) {
      await route.abort();
      return;
    }

    await route.continue();
  });
}
