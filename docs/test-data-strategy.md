# Test Data Strategy

## Static Data

Static data lives in `test-data/`.

Use it for known values such as invalid login credentials, expected messages, and supported
categories.

## Dynamic Data

Factories live in `factories/`.

Use factories for users and notes because the API stores data. Dynamic values prevent duplicate
email and duplicate title problems when tests run repeatedly.

## Cleanup

Tests that create data should clean it up.

Recommended patterns:

- API tests delete created notes and temporary accounts in `finally` blocks.
- UI and E2E tests use fixtures from `fixtures/notes.fixture.ts`.
- Temporary auth accounts are deleted by `tests/setup/global.teardown.ts` unless
  `KEEP_TEST_ACCOUNT=true`.

## Secrets

Never commit `.env`, storage state files, API tokens, or passwords. The `playwright/.auth/`
directory is ignored by Git.
