import { expect, test } from '../../../fixtures/ui.fixture';
import type { ApiEnvelope, Note } from '../../../types/notes';

test.describe('Notes App API mocking @ui @regression', () => {
  test('renders a mocked notes list from page.route()', async ({ page, notesPage }) => {
    const mockedNote: Note = {
      id: 'mock-note-001',
      title: 'Mocked route note',
      description: 'This note came from a Playwright route mock, not the real API.',
      category: 'Work',
      completed: false,
      created_at: '2026-07-07T08:00:00.000Z',
      updated_at: '2026-07-07T08:00:00.000Z',
      user_id: 'mock-user-001',
    };

    await test.step('Mock the Notes API list response', async () => {
      await page.route('**/notes/api/notes', async (route) => {
        if (route.request().method() !== 'GET') {
          await route.continue();
          return;
        }

        const body: ApiEnvelope<Note[]> = {
          success: true,
          status: 200,
          message: 'Mocked notes successfully retrieved',
          data: [mockedNote],
        };

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(body),
        });
      });
    });

    await test.step('Open the Notes page using the mocked API response', async () => {
      await notesPage.goto();
    });

    await test.step('Verify the mocked note is rendered in the UI', async () => {
      await expect(notesPage.noteCardByTitle(mockedNote.title)).toBeVisible();
      await expect(notesPage.noteDescriptionByTitle(mockedNote.title)).toContainText(
        mockedNote.description,
      );
    });
  });
});
