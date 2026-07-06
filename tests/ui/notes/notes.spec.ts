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

    await test.step('Open the authenticated Notes page', async () => {
      await notesPage.goto();
      await notesPage.expectLoaded();
    });

    await test.step('Create a Home note through the UI', async () => {
      await notesPage.addNote(note);
    });

    await test.step('Edit the note title, description, and category', async () => {
      await notesPage.editNoteByTitle(note.title, editedNote);
    });

    await test.step('Mark the edited note as completed', async () => {
      await notesPage.markNoteCompletedByTitle(editedNote.title);
    });

    await test.step('Delete the edited note', async () => {
      await notesPage.deleteNoteByTitle(editedNote.title);
    });

    await test.step('Verify the deleted note is no longer visible', async () => {
      await expect(notesPage.noteCardByTitle(editedNote.title)).toBeHidden();
    });
  });
});
