import { defineConfig, devices } from '@playwright/test';
import { env, paths } from './utils/env';

export default defineConfig({
  testDir: './tests',
  testIgnore: env.runVisual ? [] : ['**/ui/visual/**'],
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  forbidOnly: env.ci,
  retries: env.ci ? 2 : 0,
  workers: env.ci ? 1 : 4,
  reporter: env.ci
    ? [
        ['github'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['allure-playwright', { outputFolder: 'allure-results', detail: true }],
      ]
    : [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['allure-playwright', { outputFolder: 'allure-results', detail: true }],
      ],
  globalTeardown: './tests/setup/global.teardown.ts',
  use: {
    baseURL: env.uiBaseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: '**/*.setup.ts',
    },
    {
      name: 'api',
      testMatch: '**/api/**/*.api.spec.ts',
      use: {
        baseURL: env.apiBaseUrl,
      },
    },
    {
      name: 'chromium',
      testMatch: ['**/ui/**/*.spec.ts', '**/e2e/**/*.spec.ts'],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: paths.authFile,
      },
    },
  ],
  outputDir: 'test-results',
});
