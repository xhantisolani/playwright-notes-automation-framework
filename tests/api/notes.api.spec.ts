import { createNote } from '../../factories/noteFactory';
import { expect, test } from '../../fixtures/api.fixture';
import { cleanupNotes } from '../../utils/cleanup';

test.describe('Notes API CRUD @api @regression', () => {
  test('creates, reads, updates, completes, and deletes a note @smoke', async ({
    notesApi,
    registeredUser,
  }) => {
    const noteIds: string[] = [];

    try {
      const note = createNote({ category: 'Work' });
      const created = await test.step('Create a Work note through the API', async () => {
        const response = await notesApi.createNote(registeredUser.token, note);
        expect(response.response.status(), response.body.message).toBe(200);
        expect(response.body.data.title).toBe(note.title);
        noteIds.push(response.body.data.id);
        return response;
      });

      await test.step('Read the created note through the API', async () => {
        const fetched = await notesApi.getNote(registeredUser.token, created.body.data.id);
        expect(fetched.response.status(), fetched.body.message).toBe(200);
        expect(fetched.body.data.description).toBe(note.description);
      });

      const updatePayload = createNote({ title: `${note.title} updated`, category: 'Personal' });
      await test.step('Update the note title and category through the API', async () => {
        const updated = await notesApi.updateNote(registeredUser.token, created.body.data.id, {
          ...updatePayload,
          completed: false,
        });
        expect(updated.response.status(), updated.body.message).toBe(200);
        expect(updated.body.data.title).toBe(updatePayload.title);
        expect(updated.body.data.category).toBe('Personal');
      });

      await test.step('Mark the note as completed through the API', async () => {
        const completed = await notesApi.updateNoteCompleted(
          registeredUser.token,
          created.body.data.id,
          true,
        );
        expect(completed.response.status(), completed.body.message).toBe(200);
        expect(completed.body.data.completed).toBe(true);
      });

      await test.step('Delete the note through the API', async () => {
        const deleted = await notesApi.deleteNote(registeredUser.token, created.body.data.id);
        expect(deleted.response.status(), deleted.body.message).toBe(200);
        noteIds.pop();
      });
    } finally {
      await test.step('Clean up any note left by the API test', async () => {
        await cleanupNotes(notesApi, registeredUser.token, noteIds);
      });
    }
  });

  test('rejects requests without a valid token', async ({ notesApi }) => {
    const response = await test.step('Call the Notes API with an invalid token', async () => {
      return notesApi.getNotes('invalid-token');
    });

    await test.step('Verify the API returns an unauthorized response', async () => {
      expect(response.response.status()).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
