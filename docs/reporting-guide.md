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

The report opens from `playwright-report/`.
The summary command reads `test-results/results.json` and prints a short terminal summary.
The Allure command generates `allure-report/` from `allure-results/`.

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
- Allure results for richer test history and categorization

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
