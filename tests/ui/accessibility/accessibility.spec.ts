import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '../../../fixtures/ui.fixture';
import { paths } from '../../../utils/env';

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
    test.use({ storageState: paths.authFile });

    test('authenticated notes page has no unexpected serious structural accessibility violations', async ({
      notesPage,
      page,
    }, testInfo) => {
      testInfo.annotations.push({
        type: 'known-accessibility-issue',
        description: 'The public Notes app toggle checkbox currently lacks an accessible label.',
      });

      await test.step('Open the authenticated Notes page', async () => {
        await notesPage.goto();
        await notesPage.expectLoaded();
      });

      const results = await test.step('Run axe accessibility scan on the app root', async () => {
        return new AxeBuilder({ page }).include('#root').disableRules(['color-contrast']).analyze();
      });

      await test.step('Verify only known accessibility debt is reported', async () => {
        const unexpectedViolations = results.violations.filter(
          (violation) => violation.id !== 'label',
        );

        expect(unexpectedViolations).toEqual([]);
      });
    });
  });
});
