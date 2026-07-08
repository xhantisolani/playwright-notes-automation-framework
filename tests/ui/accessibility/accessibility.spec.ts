import AxeBuilder from '@axe-core/playwright';
import type { Result } from 'axe-core';
import { createNote } from '../../../factories/noteFactory';
import { expect, test } from '../../../fixtures/ui.fixture';

function isKnownCompletionToggleLabelViolation(violation: Result): boolean {
  return (
    violation.id === 'label' &&
    violation.nodes.length > 0 &&
    violation.nodes.every((node) => node.html.includes('data-testid="toggle-note-switch"'))
  );
}

test.describe('Accessibility checks @ui @accessibility', () => {
  test.describe('public pages', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('login page has no serious structural accessibility violations', async ({
      loginPage,
      page,
    }) => {
      await test.step('Open the login page', async () => {
        await loginPage.goto();
        await loginPage.expectLoaded();
      });

      const results = await test.step('Run axe accessibility scan on the app root', async () => {
        return new AxeBuilder({ page }).include('#root').disableRules(['color-contrast']).analyze();
      });

      await test.step('Verify no axe violations are reported', async () => {
        expect(results.violations).toEqual([]);
      });
    });
  });

  test.describe('authenticated pages', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('authenticated notes page has no unexpected serious structural accessibility violations', async ({
      notesPage,
      notesApi,
      page,
      registeredUser,
    }, testInfo) => {
      testInfo.annotations.push({
        type: 'known-accessibility-issue',
        description: 'The public Notes app toggle checkbox currently lacks an accessible label.',
      });

      const seededNote = createNote({
        title: 'Accessibility seeded note with completion toggle',
        category: 'Work',
      });

      await test.step('Seed a note card with a completion toggle for the isolated user', async () => {
        const created = await notesApi.createNote(registeredUser.token, seededNote);
        expect(created.response.status(), created.body.message).toBe(200);
      });

      await page.addInitScript((token) => {
        window.localStorage.setItem('token', token);
      }, registeredUser.token);

      await test.step('Open the authenticated Notes page', async () => {
        await notesPage.goto();
        await notesPage.expectLoaded();
        await expect(notesPage.noteCardByTitle(seededNote.title)).toBeVisible();
      });

      const results = await test.step('Run axe accessibility scan on the app root', async () => {
        return new AxeBuilder({ page }).include('#root').disableRules(['color-contrast']).analyze();
      });

      await test.step('Verify only known accessibility debt is reported', async () => {
        const unexpectedViolations = results.violations.filter(
          (violation) => !isKnownCompletionToggleLabelViolation(violation),
        );
        const knownViolations = results.violations.filter(isKnownCompletionToggleLabelViolation);

        if (knownViolations.length > 0) {
          await testInfo.attach('known-accessibility-violations', {
            body: JSON.stringify(knownViolations, null, 2),
            contentType: 'application/json',
          });
        }

        expect(unexpectedViolations).toEqual([]);
      });
    });
  });
});
