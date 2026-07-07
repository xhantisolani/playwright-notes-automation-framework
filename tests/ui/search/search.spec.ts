import { createNote } from '../../../factories/noteFactory';
import { expect, test } from '../../../fixtures/ui.fixture';

test.describe('Notes App search @ui @regression', () => {
  test('finds a note by title @smoke', async ({ notesPage, createNoteViaApi }) => {
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

  test('shows an empty result message when no note matches the search', async ({ notesPage }) => {
    const uniqueSearchTerm = `missing-note-${Date.now()}`;

    await test.step('Open the Notes page and search for a unique missing term', async () => {
      await notesPage.goto();
      await notesPage.searchFor(uniqueSearchTerm);
    });

    await test.step('Verify the app explains that no notes matched', async () => {
      await expect(notesPage.noNotesMessage).toBeVisible();
      await expect(notesPage.noNotesMessage).toContainText("Couldn't find any notes");
    });
  });
});
