# Contribution Guide

## Branch Workflow

Do not work directly on `main`.

Recommended flow:

```bash
git checkout -b feature/add-new-note-tests
npm run lint
npm run typecheck
npm test
git add .
git commit -m "Add note management tests"
git push -u origin feature/add-new-note-tests
```

Open a pull request and review the changes before merging.

## Coding Rules

- Use TypeScript strict mode.
- Prefer page object methods over duplicated selectors.
- Prefer factories over hardcoded record names.
- Keep tests independent.
- Clean up created data.
- Do not commit secrets or auth state.

## Before Opening A PR

Run:

```bash
npm run lint
npm run typecheck
npm test
```

If a test fails, inspect the Playwright report and trace before changing the test.
