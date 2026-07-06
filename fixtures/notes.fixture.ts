import type { Note, NotePayload } from '../types/notes';
import { createNote } from '../factories/noteFactory';
import { cleanupNotes } from '../utils/cleanup';
import { expect, test as base } from './api.fixture';

interface NotesFixtures {
  createdNoteIds: string[];
  createNoteViaApi: (overrides?: Partial<NotePayload>) => Promise<Note>;
}

export const test = base.extend<NotesFixtures>({
  createdNoteIds: async ({ notesApi, authToken }, use) => {
    const noteIds: string[] = [];
    await use(noteIds);
    await cleanupNotes(notesApi, authToken, noteIds);
  },

  createNoteViaApi: async ({ notesApi, authToken, createdNoteIds }, use) => {
    await use(async (overrides: Partial<NotePayload> = {}) => {
      const note = createNote(overrides);
      const created = await notesApi.createNote(authToken, note);
      expect(created.response.status(), created.body.message).toBe(200);

      createdNoteIds.push(created.body.data.id);
      return created.body.data;
    });
  },
});

export { expect };
