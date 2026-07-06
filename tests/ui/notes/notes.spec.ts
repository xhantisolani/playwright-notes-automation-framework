import { createNote } from '../../../factories/noteFactory';
import { expect, test } from '../../../fixtures/ui.fixture';
import { NotesPage } from '../../../pages/NotesPage';

test.describe('Notes App note management @ui @regression', () => {
  test('creates, edits, completes, and deletes a note @smoke', async ({ page }) => {
    const notesPage = new NotesPage(page);
    const note = createNote({ category: 'Home' });
    const editedNote = createNote({
      title: `${note.title} edited`,
      description: `${note.description} edited`,
      category: 'Personal',
    });

    await notesPage.goto();
    await notesPage.expectLoaded();
    await notesPage.addNote(note);
    await notesPage.editNoteByTitle(note.title, editedNote);
    await notesPage.markNoteCompletedByTitle(editedNote.title);
    await notesPage.deleteNoteByTitle(editedNote.title);

    await expect(notesPage.noteCardByTitle(editedNote.title)).toBeHidden();
  });
});
