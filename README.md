# Playwright Notes Automation Framework

A professional learning repo for Playwright with TypeScript, built around the
[ExpandTesting Notes App](https://practice.expandtesting.com/notes/app/) and
[Notes API Swagger docs](https://practice.expandtesting.com/notes/api/api-docs/).

The goal is simple: small app, serious framework. You can practise UI automation, API
automation, Page Object Model, fixtures, test data factories, authenticated browser state,
cleanup, reports, traces, and GitHub Actions in one clean repository.

## Tech Stack

- Playwright Test
- TypeScript
- Node.js
- APIRequestContext
- Page Object Model
- Fixtures
- Test data factories
- dotenv
- ESLint
- Prettier
- Playwright HTML report
- Playwright traces, screenshots, and videos
- GitHub Actions

## Project Structure

```text
tests/
  api/          API tests for health, auth, and notes CRUD
  e2e/          Tests that combine API setup with UI verification
  setup/        Auth setup and global teardown
  ui/           UI specs grouped by feature
pages/          Page objects
fixtures/       Playwright fixtures for auth, API, and notes cleanup
factories/      Dynamic test data builders
test-data/      Static reusable data
utils/          Environment, API client, cleanup, random data
types/          Shared TypeScript types
docs/           Strategy and contribution docs
```

## Setup

```bash
npm install
npm run install:browsers
cp .env.example .env
```

Credentials are optional. If `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` are empty, the setup
project creates a temporary API user and stores the auth state in `playwright/.auth/user.json`.
That directory is ignored by Git.

Do not use private personal data on public practice sites.

## Run Tests

```bash
npm test
npm run test:api
npm run test:ui
npm run test:e2e
npm run test:smoke
npm run test:regression
npm run report
```

Quality checks:

```bash
npm run lint
npm run typecheck
npm run format:check
```

## Authentication Flow

The `setup` Playwright project runs `tests/setup/auth.setup.ts`.

It does one of two things:

- Uses `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` from `.env`.
- Creates a temporary Notes API user if no credentials are supplied.

It logs in through the API, writes the Notes app token to browser local storage, and saves
Playwright storage state to `playwright/.auth/user.json`.

## Tags

Tests include title tags:

- `@smoke`
- `@regression`
- `@api`
- `@ui`
- `@e2e`

Examples:

```bash
npm run test:smoke
npm run test:api
npx playwright test --grep "@ui"
```

## Reports And Debugging

The config captures:

- HTML reports
- Traces on first retry
- Screenshots on failure
- Videos on failure

Open the latest HTML report with:

```bash
npm run report
```

## Learning Path

1. Run the existing tests and inspect the report.
2. Read `pages/LoginPage.ts` and `pages/NotesPage.ts`.
3. Add one new UI assertion to an existing test.
4. Add one new API negative test.
5. Add a new page object method instead of duplicating selectors.
6. Use API setup to prepare data for a UI test.
7. Open a pull request and review the changes before merging.
