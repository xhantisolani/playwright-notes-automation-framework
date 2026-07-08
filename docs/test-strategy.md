# Test Strategy

## Scope

This framework targets the ExpandTesting Notes App and Notes API.

Primary coverage:

- Login page behaviour
- Authenticated notes workflows
- Search and category filters
- Notes API health checks
- Notes API authentication
- Notes API CRUD operations
- UI and API integration flows
- Longer business journeys for onboarding and daily note triage

Out of scope for the first version:

- OAuth login providers
- Password reset email delivery
- Visual regression testing
- Load testing
- Cross-browser matrix in CI

## Test Levels

API tests validate service behaviour quickly and prepare confidence in the backend contract.

UI tests validate user-visible behaviour through the browser.

E2E tests combine API setup with UI verification so tests stay faster and less brittle than
creating every record through the UI.

## Selector Strategy

Prefer stable `data-testid` selectors from the Notes App. Use role selectors when they describe
the behaviour more clearly. Avoid brittle CSS selectors tied to styling.

## Debugging

Use Playwright HTML reports first. For retry failures, open the trace. Screenshots and videos are
retained only for failures to keep local and CI output manageable.

Tests use `test.step(...)` so the report shows business-readable steps before the lower-level
technical evidence.

## Specialized Suites

- Mocking tests demonstrate `page.route()` for stable UI behavior without real API dependency.
- Accessibility tests use axe against the Notes app root.
- Visual regression is opt-in through `RUN_VISUAL=true` and the `test:visual` scripts.
- Business journey tests are opt-in through `RUN_JOURNEY=true` and the `test:journey` scripts.
- CI runs API and Chromium suites through a matrix and two shards.
