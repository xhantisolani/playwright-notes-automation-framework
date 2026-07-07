import { expect, test } from '../../../fixtures/ui.fixture';

test.describe('Visual regression @ui @visual', () => {
  test('notes list layout matches the approved baseline', async ({ page, notesPage }) => {
    await test.step('Mock the API with stable visual test data', async () => {
      await page.route('**/notes/api/notes', async (route) => {
        if (route.request().method() !== 'GET') {
          await route.continue();
          return;
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            status: 200,
            message: 'Visual test notes retrieved',
            data: [
              {
                id: 'visual-note-001',
                title: 'Visual baseline note',
                description: 'Stable mocked data keeps the visual comparison meaningful.',
                category: 'Work',
                completed: false,
                created_at: '2026-07-07T08:00:00.000Z',
                updated_at: '2026-07-07T08:00:00.000Z',
                user_id: 'visual-user-001',
              },
            ],
          }),
        });
      });
    });

    await test.step('Open the Notes page with stable data', async () => {
      await notesPage.goto();
      await expect(notesPage.noteCardByTitle('Visual baseline note')).toBeVisible();
    });

    await test.step('Compare the Notes app root against the baseline screenshot', async () => {
      await expect(page.locator('#root')).toHaveScreenshot('notes-list-layout.png', {
        animations: 'disabled',
        maxDiffPixelRatio: 0.03,
      });
    });
  });
});
