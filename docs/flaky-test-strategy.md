# Flaky Test Strategy

Flaky tests sometimes pass and sometimes fail without a real product change.

This framework handles flakiness in layers:

- Block third-party ad and analytics traffic that can cover controls or slow teardown.
- Keep UI tests focused on one main behavior.
- Use API setup and cleanup instead of long UI-only journeys.
- Capture screenshots, videos, traces, HTML report, JSON report, and Allure results.
- Run fewer local browser workers against the public practice site.
- Use CI retries for transient public-site and network instability.
- Keep visual regression opt-in with `RUN_VISUAL=true` because public websites and OS fonts can
  make visual baselines noisy.

## What Not To Do

Do not hide failures with broad `try/catch`.

Do not add arbitrary waits such as:

```ts
await page.waitForTimeout(5000);
```

Prefer assertions and locators that wait for the real condition:

```ts
await expect(notesPage.noteCardByTitle(title)).toBeVisible();
```

## Quarantine Rule

If a test fails repeatedly for an external reason, mark it with a clear annotation and open an
issue. Do not silently delete it.

Example:

```ts
test.info().annotations.push({
  type: 'flaky-risk',
  description: 'Depends on public practice site availability',
});
```
