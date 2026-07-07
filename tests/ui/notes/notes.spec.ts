import { createNote } from '../../../factories/noteFactory';
import { expect, test } from '../../../fixtures/ui.fixture';
import { cleanupNotes } from '../../../utils/cleanup';

test.describe('Notes App note management @ui @regression', () => {
  test('validates and cancels the new note form', async ({ notesPage }) => {
    await test.step('Open the authenticated Notes page', async () => {
      await notesPage.goto();
      await notesPage.expectLoaded();
    });

    await test.step('Submit the empty note form', async () => {
      await notesPage.submitEmptyNoteForm();
    });

    await test.step('Verify required field validation is shown', async () => {
      await notesPage.expectRequiredNoteValidation();
    });

    await test.step('Cancel the note form without creating a note', async () => {
      await notesPage.cancelNoteForm();
    });
  });

  test('creates a note through the UI and cleans it up through the API @smoke', async ({
    notesPage,
    notesApi,
    authToken,
  }) => {
    const note = createNote({ category: 'Home' });
    const createdNoteIds: string[] = [];

    try {
      await test.step('Open the authenticated Notes page', async () => {
        await notesPage.goto();
        await notesPage.expectLoaded();
      });

      await test.step('Create a Home note through the UI', async () => {
        await notesPage.addNote(note);
      });

      await test.step('Find the UI-created note through the API for cleanup', async () => {
        const notes = await notesApi.getNotes(authToken);
        const createdNote = notes.body.data.find((apiNote) => apiNote.title === note.title);
        expect(createdNote).toBeTruthy();
        createdNoteIds.push(createdNote?.id ?? '');
      });
    } finally {
      await test.step('Clean up the UI-created note through the API', async () => {
        await cleanupNotes(notesApi, authToken, createdNoteIds.filter(Boolean));
      });
    }
  });

  test('edits an API-created note through the UI', async ({
    notesPage,
    createNoteViaApi,
    notesApi,
    authToken,
  }) => {
    const note = await test.step('Create a note with API setup', async () => {
      return createNoteViaApi(createNote({ category: 'Home' }));
    });
    const editedNote = createNote({
      title: `${note.title} edited`,
      description: `${note.description} edited`,
      category: 'Personal',
    });

    await test.step('Open the Notes page and edit the note', async () => {
      await notesPage.goto();
      await notesPage.editNoteByTitle(note.title, editedNote);
    });

    await test.step('Verify the edit through the API', async () => {
      const response = await notesApi.getNote(authToken, note.id);
      expect(response.response.status(), response.body.message).toBe(200);
      expect(response.body.data.title).toBe(editedNote.title);
      expect(response.body.data.description).toBe(editedNote.description);
      expect(response.body.data.category).toBe(editedNote.category);
    });
  });

  test('deletes an API-created note through the UI', async ({
    notesPage,
    createNoteViaApi,
    notesApi,
    authToken,
  }) => {
    const note = await test.step('Create a note with API setup', async () => {
      return createNoteViaApi(createNote({ category: 'Work' }));
    });

    await test.step('Open the Notes page and delete the note', async () => {
      await notesPage.goto();
      await notesPage.deleteNoteByTitle(note.title);
    });

    await test.step('Verify the deleted note is gone through the API', async () => {
      const notes = await notesApi.getNotes(authToken);
      expect(notes.response.status(), notes.body.message).toBe(200);
      expect(notes.body.data.map((apiNote) => apiNote.id)).not.toContain(note.id);
    });
  });

  test('opens a note detail page from the note card', async ({
    page,
    notesPage,
    createNoteViaApi,
  }) => {
    const note = await test.step('Create a note with API setup', async () => {
      return createNoteViaApi(createNote({ category: 'Work' }));
    });

    await test.step('Open the Notes page and view the note details', async () => {
      await notesPage.goto();
      await notesPage.viewNoteByTitle(note.title);
    });

    await test.step('Verify the note detail page shows the selected note', async () => {
      await expect(page).toHaveURL(new RegExp(`/notes/${note.id}$`));
      await expect(notesPage.noteCardByTitle(note.title)).toBeVisible();
      await expect(notesPage.noteDescriptionByTitle(note.title)).toContainText(note.description);
    });
  });
});
