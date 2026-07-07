import { createNote } from '../../factories/noteFactory';
import { expect, test } from '../../fixtures/api.fixture';
import { noteCategories } from '../../test-data/notes.data';
import {
  expectFailureMessage,
  expectNoteMatches,
  expectSuccessfulEnvelope,
} from '../../utils/apiAssertions';
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
        expectSuccessfulEnvelope(expect, response);
        expectNoteMatches(expect, response.body.data, note);
        noteIds.push(response.body.data.id);
        return response;
      });

      await test.step('Read the created note through the API', async () => {
        const fetched = await notesApi.getNote(registeredUser.token, created.body.data.id);
        expectSuccessfulEnvelope(expect, fetched);
        expectNoteMatches(expect, fetched.body.data, note);
      });

      const updatePayload = createNote({ title: `${note.title} updated`, category: 'Personal' });
      await test.step('Update the note title and category through the API', async () => {
        const updated = await notesApi.updateNote(registeredUser.token, created.body.data.id, {
          ...updatePayload,
          completed: false,
        });
        expectSuccessfulEnvelope(expect, updated);
        expectNoteMatches(expect, updated.body.data, updatePayload);
      });

      await test.step('Mark the note as completed through the API', async () => {
        const completed = await notesApi.updateNoteCompleted(
          registeredUser.token,
          created.body.data.id,
          true,
        );
        expectSuccessfulEnvelope(expect, completed);
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

  test('creates notes for every supported category @smoke', async ({
    notesApi,
    registeredUser,
  }) => {
    const noteIds: string[] = [];

    try {
      for (const category of noteCategories) {
        await test.step(`Create and verify a ${category} note`, async () => {
          const note = createNote({ category });
          const created = await notesApi.createNote(registeredUser.token, note);
          expectSuccessfulEnvelope(expect, created);
          expectNoteMatches(expect, created.body.data, note);
          noteIds.push(created.body.data.id);
        });
      }

      await test.step('Verify all category notes appear in the user note list', async () => {
        const notes = await notesApi.getNotes(registeredUser.token);
        expectSuccessfulEnvelope(expect, notes);

        for (const noteId of noteIds) {
          expect(notes.body.data.map((note) => note.id)).toContain(noteId);
        }
      });
    } finally {
      await test.step('Clean up category notes', async () => {
        await cleanupNotes(notesApi, registeredUser.token, noteIds);
      });
    }
  });

  test('rejects an invalid note payload', async ({ notesApi, registeredUser }) => {
    const invalidNote = createNote({ title: '' });

    const response = await test.step('Try to create a note without a title', async () => {
      return notesApi.createNote(registeredUser.token, invalidNote);
    });

    await test.step('Verify the API returns a bad request response', async () => {
      expectFailureMessage(expect, response, 400);
    });
  });

  test('rejects requests without a valid token', async ({ notesApi }) => {
    const response = await test.step('Call the Notes API with an invalid token', async () => {
      return notesApi.getNotes('invalid-token');
    });

    await test.step('Verify the API returns an unauthorized response', async () => {
      expectFailureMessage(expect, response, 401);
    });
  });
});
