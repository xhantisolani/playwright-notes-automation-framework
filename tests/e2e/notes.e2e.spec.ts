import { expect, test } from '../../fixtures/ui.fixture';
import { NotesPage } from '../../pages/NotesPage';

test.describe('Notes UI and API integration @e2e @regression', () => {
  test('creates test data through the API and verifies it in the UI @smoke', async ({
    page,
    createNoteViaApi,
  }) => {
    const apiNote = await test.step('Create a Personal note through the API', async () => {
      return createNoteViaApi({
        title: 'API-created note visible in UI',
        category: 'Personal',
      });
    });
    const notesPage = new NotesPage(page);

    await test.step('Open the authenticated Notes page', async () => {
      await notesPage.goto();
    });

    await test.step('Verify the API-created note is visible in the UI', async () => {
      await expect(notesPage.noteCardByTitle(apiNote.title)).toBeVisible();
    });
  });
});
