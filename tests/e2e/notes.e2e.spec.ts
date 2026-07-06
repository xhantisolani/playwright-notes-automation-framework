import { expect, test } from '../../fixtures/ui.fixture';
import { NotesPage } from '../../pages/NotesPage';

test.describe('Notes UI and API integration @e2e @regression', () => {
  test('creates test data through the API and verifies it in the UI @smoke', async ({
    page,
    createNoteViaApi,
  }) => {
    const apiNote = await createNoteViaApi({
      title: 'API-created note visible in UI',
      category: 'Personal',
    });
    const notesPage = new NotesPage(page);

    await notesPage.goto();

    await expect(notesPage.noteCardByTitle(apiNote.title)).toBeVisible();
  });
});
