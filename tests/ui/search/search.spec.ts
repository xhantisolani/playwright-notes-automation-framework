import { createNote } from '../../../factories/noteFactory';
import { expect, test } from '../../../fixtures/ui.fixture';
import { NotesPage } from '../../../pages/NotesPage';

test.describe('Notes App search @ui @regression', () => {
  test('finds a note by title @smoke', async ({ page, createNoteViaApi }) => {
    const notesPage = new NotesPage(page);
    const { target, other } =
      await test.step('Create searchable notes through the API', async () => {
        return {
          target: await createNoteViaApi(createNote({ title: 'Search target note' })),
          other: await createNoteViaApi(createNote({ title: 'Another note for filtering' })),
        };
      });

    await test.step('Search for the target note title in the UI', async () => {
      await notesPage.goto();
      await notesPage.searchFor(target.title);
    });

    await test.step('Verify only the matching note is shown', async () => {
      await expect(notesPage.noteCardByTitle(target.title)).toBeVisible();
      await expect(notesPage.noteCardByTitle(other.title)).toBeHidden();
    });
  });
});
