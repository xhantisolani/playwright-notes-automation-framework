import { createNote } from '../../../factories/noteFactory';
import { expect, test } from '../../../fixtures/ui.fixture';
import { NotesPage } from '../../../pages/NotesPage';

test.describe('Notes App search @ui @regression', () => {
  test('finds a note by title @smoke', async ({ page, createNoteViaApi }) => {
    const notesPage = new NotesPage(page);
    const target = await createNoteViaApi(createNote({ title: 'Search target note' }));
    const other = await createNoteViaApi(createNote({ title: 'Another note for filtering' }));

    await notesPage.goto();
    await notesPage.searchFor(target.title);

    await expect(notesPage.noteCardByTitle(target.title)).toBeVisible();
    await expect(notesPage.noteCardByTitle(other.title)).toBeHidden();
  });
});
