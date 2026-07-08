# Business Journey Tests

Business journey tests are longer end-to-end scenarios. They test a workflow the way a real user
or business stakeholder thinks about it, not one tiny control at a time.

## What They Cover

The journey suite lives in `tests/journeys/`.

Current journeys:

- New user onboarding: register, log in, update profile, create notes, search, filter, complete,
  edit, delete, log out, log back in, and verify saved state.
- Returning user daily work: seed a mixed backlog, review it in the UI, filter work tasks, complete
  urgent work, search for a follow-up, edit a note, delete stale work, and verify API state.

## Why They Are Separate

These tests are heavier than normal UI or API tests because they do more work:

- More browser actions
- More API verification
- More test data setup and cleanup
- More possible dependency on the public practice site being available

That is realistic for a business regression pack, but it is slower feedback while learning or
developing one feature.

## How To Run Them

```bash
npm run test:journey
npm run test:journey:headed
npm run test:nightly
```

The normal `npm test` command skips journeys by default. The suite is enabled through:

```bash
RUN_JOURNEY=true
```

## How To Read The Report

Open the HTML report:

```bash
npm run report
```

Expand a journey test and read the `test.step(...)` entries. They should tell a human story:

- Register a brand-new user account through the UI
- Complete the user profile from the UI
- Create Home, Work, and Personal notes through the UI
- Verify the final journey state through the API

That is the difference between a technical script and a stakeholder-readable business journey.
