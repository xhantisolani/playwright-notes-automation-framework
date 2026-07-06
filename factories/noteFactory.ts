import type { NoteCategory, NotePayload } from '../types/notes';
import { uniqueSuffix } from '../utils/randomData';

const categories: NoteCategory[] = ['Home', 'Work', 'Personal'];

export function createNote(overrides: Partial<NotePayload> = {}): NotePayload {
  const suffix = uniqueSuffix('note');

  return {
    title: `Automation note ${suffix}`,
    description: `Created by Playwright for test data practice: ${suffix}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    ...overrides,
  };
}
