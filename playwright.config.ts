import { defineConfig, devices } from '@playwright/test';
import nodePath from 'node:path';
import { env, paths } from './utils/env';

const ignoredTests = [
  ...(!env.runVisual ? ['**/ui/visual/**'] : []),
  ...(!env.runJourney ? ['**/journeys/**'] : []),
];

function createReportRunId(): string {
  const now = new Date();
  const pad = (value: number) => value.toString().padStart(2, '0');

  return [
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`,
  ].join('_');
}

function sanitizeReportRunId(value: string): string {
  const sanitized = Array.from(value.trim().replace(/[<>:"/\\|?*]/g, '-'))
    .map((character) => (character.charCodeAt(0) < 32 ? '-' : character))
    .join('');

  return sanitized || createReportRunId();
}

const reportRoot = nodePath.resolve(process.cwd(), process.env.REPORT_ROOT?.trim() || 'reports');
const reportRunId = sanitizeReportRunId(process.env.REPORT_RUN_ID || createReportRunId());
process.env.REPORT_RUN_ID = reportRunId;
const reportRunDir = nodePath.join(reportRoot, reportRunId);
const testResultsDir = nodePath.join(reportRunDir, 'test-results');
const allureResultsDir = nodePath.join(reportRunDir, 'allure-results');
const allureReportDir = nodePath.join(reportRunDir, 'allure-report');

if (!process.env.TEST_WORKER_INDEX) {
  console.log(`Writing test reports to ${nodePath.relative(process.cwd(), reportRunDir)}`);
}

export default defineConfig({
  testDir: './tests',
  testIgnore: ignoredTests,
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
        ['html', { outputFolder: nodePath.join(reportRunDir, 'playwright-report'), open: 'never' }],
        ['json', { outputFile: nodePath.join(testResultsDir, 'results.json') }],
        ['allure-playwright', { resultsDir: allureResultsDir, detail: true }],
        [
          './reporters/allure-html-reporter.mjs',
          { resultsDir: allureResultsDir, reportDir: allureReportDir },
        ],
      ]
    : [
        ['list'],
        ['html', { outputFolder: nodePath.join(reportRunDir, 'playwright-report'), open: 'never' }],
        ['json', { outputFile: nodePath.join(testResultsDir, 'results.json') }],
        ['allure-playwright', { resultsDir: allureResultsDir, detail: true }],
        [
          './reporters/allure-html-reporter.mjs',
          { resultsDir: allureResultsDir, reportDir: allureReportDir },
        ],
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
      testMatch: ['**/ui/**/*.spec.ts', '**/e2e/**/*.spec.ts', '**/journeys/**/*.spec.ts'],
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: paths.authFile,
      },
    },
  ],
  outputDir: nodePath.join(testResultsDir, 'artifacts'),
});
