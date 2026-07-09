# Reporting Guide

## What The Playwright Report Is For

The Playwright HTML report is mainly a tester and developer report. It explains what passed,
what failed, where it failed, and what evidence is available.

It is more detailed than a stakeholder summary. Stakeholders usually need a short release-style
summary. Testers and developers need steps, screenshots, traces, videos, and failure details.

## How To Open The Report

Run:

```bash
npm test
npm run report
npm run report:summary
npm run report:allure
```

Each run writes to a timestamped folder under `reports/`, for example:

```text
reports/2026-07-09_21-15-30/
```

The Playwright HTML report is written to that run's `playwright-report/` folder.
The Allure HTML report is generated automatically at the end of the run and written to that run's `allure-report/` folder.
It is generated in single-file mode so `allure-report/index.html` can be opened directly from the timestamped folder.
The summary command reads the latest run's `test-results/results.json` and prints a short terminal summary.
The Allure command can still regenerate or open the latest run's `allure-report/` from that same run's `allure-results/`.
To update older timestamped Allure reports to the same single-file format, run `npm run report:allure -- --all`.

Run any Playwright scope you need:

```bash
npm test
npx playwright test tests/api
npx playwright test tests/ui/auth/login.spec.ts
npx playwright test --grep @smoke
```

Then open the latest Playwright HTML report:

```bash
npm run report
```

Or open the latest Allure HTML report:

```bash
npm run report:allure:open
```

To generate or open a specific historical run, pass its timestamp:

```bash
npm run report:allure -- --run 2026-07-09_21-15-30
npm run report:summary -- --run 2026-07-09_21-15-30
```

## How To Read A Test

Each test now uses business-readable steps such as:

- Open the Notes App login page
- Submit invalid credentials
- Verify the login error message is shown
- Create a Work note through the API
- Verify the API-created note is visible in the UI
- Verify the final journey state through the API

Open a test in the report and expand the step list. The step names explain the test story.

## What Evidence Is Captured

The framework captures evidence only when it is useful:

- Screenshot on failure
- Video retained on failure
- Trace retained on failure
- HTML report for all runs
- Allure HTML report and raw results for richer test history and categorization

This avoids creating thousands of screenshots for passing tests while still giving enough detail
when something breaks.

## Screenshot, Video, And Trace

Screenshot answers:

```text
What did the page look like when the test failed?
```

Video answers:

```text
How did the browser reach the failure?
```

Trace answers:

```text
What exactly did Playwright do, including actions, assertions, DOM snapshots, and network calls?
```

## Stakeholder-Friendly Reporting

For stakeholders, do not send the raw Playwright report as the only update. Summarize it:

```text
Build: local or CI run
Environment: ExpandTesting Notes App
Result: 13 passed, 0 failed
Scope: login, notes CRUD, search, filters, API health, API auth, API CRUD, UI/API integration
Risks: public practice site availability can affect results
Evidence: Playwright HTML report attached in CI
```

The HTML report is still useful as evidence behind the summary.
