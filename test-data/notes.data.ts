import type { NoteCategory, NotePayload } from '../types/notes';

export const noteCategories: NoteCategory[] = ['Home', 'Work', 'Personal'];

export const sampleNote: NotePayload = {
  title: 'Sample automation note',
  description: 'A note used for learning Playwright tests.',
  category: 'Work',
};
