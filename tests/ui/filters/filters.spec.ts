import { createNote } from '../../../factories/noteFactory';
import { expect, test } from '../../../fixtures/ui.fixture';
import { NotesPage } from '../../../pages/NotesPage';

test.describe('Notes App category filters @ui @regression', () => {
  test('filters notes by category @smoke', async ({ page, createNoteViaApi }) => {
    const notesPage = new NotesPage(page);
    const workNote = await createNoteViaApi(createNote({ category: 'Work' }));
    const homeNote = await createNoteViaApi(createNote({ category: 'Home' }));

    await notesPage.goto();
    await notesPage.filterByCategory('Work');

    await expect(notesPage.noteCardByTitle(workNote.title)).toBeVisible();
    await expect(notesPage.noteCardByTitle(homeNote.title)).toBeHidden();
  });
});
