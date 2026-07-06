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
      const created = await notesApi.createNote(registeredUser.token, note);
      expect(created.response.status(), created.body.message).toBe(200);
      expect(created.body.data.title).toBe(note.title);
      noteIds.push(created.body.data.id);

      const fetched = await notesApi.getNote(registeredUser.token, created.body.data.id);
      expect(fetched.response.status(), fetched.body.message).toBe(200);
      expect(fetched.body.data.description).toBe(note.description);

      const updatePayload = createNote({ title: `${note.title} updated`, category: 'Personal' });
      const updated = await notesApi.updateNote(registeredUser.token, created.body.data.id, {
        ...updatePayload,
        completed: false,
      });
      expect(updated.response.status(), updated.body.message).toBe(200);
      expect(updated.body.data.title).toBe(updatePayload.title);
      expect(updated.body.data.category).toBe('Personal');

      const completed = await notesApi.updateNoteCompleted(
        registeredUser.token,
        created.body.data.id,
        true,
      );
      expect(completed.response.status(), completed.body.message).toBe(200);
      expect(completed.body.data.completed).toBe(true);

      const deleted = await notesApi.deleteNote(registeredUser.token, created.body.data.id);
      expect(deleted.response.status(), deleted.body.message).toBe(200);
      noteIds.pop();
    } finally {
      await cleanupNotes(notesApi, registeredUser.token, noteIds);
    }
  });

  test('rejects requests without a valid token', async ({ notesApi }) => {
    const response = await notesApi.getNotes('invalid-token');

    expect(response.response.status()).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
