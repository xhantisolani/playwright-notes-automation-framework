import { createNote } from '../../../factories/noteFactory';
import { expect, test } from '../../../fixtures/ui.fixture';
import { noteCategories } from '../../../test-data/notes.data';

test.describe('Notes App category filters @ui @regression', () => {
  test('filters notes by category @smoke', async ({ notesPage, createNoteViaApi }) => {
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

  for (const category of noteCategories) {
    test(`shows ${category} notes when the ${category} category filter is selected`, async ({
      notesPage,
      createNoteViaApi,
    }) => {
      const note = await test.step(`Create a ${category} note through the API`, async () => {
        return createNoteViaApi(createNote({ category }));
      });

      await test.step(`Filter the UI by ${category}`, async () => {
        await notesPage.goto();
        await notesPage.filterByCategory(category);
      });

      await test.step(`Verify the ${category} note is visible`, async () => {
        await expect(notesPage.noteCardByTitle(note.title)).toBeVisible();
      });
    });
  }
});
