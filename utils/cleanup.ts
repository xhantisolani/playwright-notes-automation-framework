import { NotesApiClient } from './apiClient';

export async function cleanupNotes(
  apiClient: NotesApiClient,
  token: string,
  noteIds: string[],
): Promise<void> {
  for (const noteId of [...noteIds].reverse()) {
    await apiClient.deleteNote(token, noteId).catch(() => undefined);
  }
}

export async function cleanupAccount(apiClient: NotesApiClient, token: string): Promise<void> {
  await apiClient.deleteAccount(token).catch(() => undefined);
}
