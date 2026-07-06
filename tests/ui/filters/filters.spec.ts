import { createNote } from '../../../factories/noteFactory';
import { expect, test } from '../../../fixtures/ui.fixture';
import { NotesPage } from '../../../pages/NotesPage';

test.describe('Notes App category filters @ui @regression', () => {
  test('filters notes by category @smoke', async ({ page, createNoteViaApi }) => {
    const notesPage = new NotesPage(page);
    const { workNote, homeNote } =
      await test.step('Create notes in different categories through the API', async () => {
        return {
          workNote: await createNoteViaApi(createNote({ category: 'Work' })),
          homeNote: await createNoteViaApi(createNote({ category: 'Home' })),
        };
      });

    await test.step('Open the Notes page and filter by Work category', async () => {
      await notesPage.goto();
      await notesPage.filterByCategory('Work');
    });

    await test.step('Verify Work notes are shown and Home notes are hidden', async () => {
      await expect(notesPage.noteCardByTitle(workNote.title)).toBeVisible();
      await expect(notesPage.noteCardByTitle(homeNote.title)).toBeHidden();
    });
  });
});
