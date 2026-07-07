import { expect, test } from '../../fixtures/ui.fixture';

test.describe('Notes UI and API integration @e2e @regression', () => {
  test('creates test data through the API and verifies it in the UI @smoke', async ({
    notesPage,
    createNoteViaApi,
  }) => {
    const apiNote = await test.step('Create a Personal note through the API', async () => {
      return createNoteViaApi({
        title: 'API-created note visible in UI',
        category: 'Personal',
      });
    });
    await test.step('Open the authenticated Notes page', async () => {
      await notesPage.goto();
    });

    await test.step('Verify the API-created note is visible in the UI', async () => {
      await expect(notesPage.noteCardByTitle(apiNote.title)).toBeVisible();
    });
  });

  test('marks a note completed in the UI and verifies the API state', async ({
    notesPage,
    createNoteViaApi,
    notesApi,
    authToken,
  }) => {
    const apiNote = await test.step('Create an incomplete Work note through the API', async () => {
      return createNoteViaApi({
        title: 'UI completion updates API state',
        category: 'Work',
      });
    });

    await test.step('Mark the note completed in the UI', async () => {
      await notesPage.goto();
      await notesPage.markNoteCompletedByTitle(apiNote.title);
      await expect(notesPage.noteCompletedSwitchByTitle(apiNote.title)).toBeChecked();
    });

    await test.step('Verify the note is completed through the API', async () => {
      const response = await notesApi.getNote(authToken, apiNote.id);
      expect(response.response.status(), response.body.message).toBe(200);
      expect(response.body.data.completed).toBe(true);
    });
  });
});
