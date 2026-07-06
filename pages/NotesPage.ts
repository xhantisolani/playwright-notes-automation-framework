import { expect, type Locator, type Page } from '@playwright/test';
import type { NoteCategory, NotePayload } from '../types/notes';
import { BasePage } from './BasePage';

export class NotesPage extends BasePage {
  readonly addNewNoteButton: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly categorySelect: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly notesList: Locator;
  readonly noNotesMessage: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.addNewNoteButton = this.byTestId('add-new-note');
    this.titleInput = this.byTestId('note-title');
    this.descriptionInput = this.byTestId('note-description');
    this.categorySelect = this.byTestId('note-category');
    this.submitButton = this.byTestId('note-submit');
    this.cancelButton = this.byTestId('note-cancel');
    this.notesList = this.byTestId('notes-list');
    this.noNotesMessage = this.byTestId('no-notes-message');
    this.searchInput = this.byTestId('search-input');
    this.searchButton = this.byTestId('search-btn');
  }

  async goto(): Promise<void> {
    await this.open('/');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.addNewNoteButton).toBeVisible();
  }

  async addNote(note: NotePayload): Promise<void> {
    await this.addNewNoteButton.click();
    await this.fillNoteForm(note);
    await this.submitButton.click();
    await expect(this.noteCardByTitle(note.title)).toBeVisible();
  }

  async editNoteByTitle(currentTitle: string, nextNote: NotePayload): Promise<void> {
    const card = this.noteCardByTitle(currentTitle);
    await expect(card).toBeVisible();
    await card.getByTestId('note-edit').click();
    await this.fillNoteForm(nextNote);
    await this.submitButton.click();
    await expect(this.noteCardByTitle(nextNote.title)).toBeVisible();
  }

  async deleteNoteByTitle(title: string): Promise<void> {
    const card = this.noteCardByTitle(title);
    await expect(card).toBeVisible();
    await card.getByTestId('note-delete').click();
    await this.byTestId('note-delete-confirm').click();
    await expect(card).toBeHidden();
  }

  async markNoteCompletedByTitle(title: string): Promise<void> {
    const card = this.noteCardByTitle(title);
    await expect(card).toBeVisible();
    await card.getByTestId('toggle-note-switch').check({ force: true });
  }

  async searchFor(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }

  async filterByCategory(category: NoteCategory): Promise<void> {
    await this.byTestId(`category-${category.toLowerCase()}`).click();
  }

  noteCardByTitle(title: string): Locator {
    return this.byTestId('note-card').filter({
      has: this.page.getByTestId('note-card-title').filter({ hasText: title }),
    });
  }

  private async fillNoteForm(note: NotePayload): Promise<void> {
    await this.titleInput.fill(note.title);
    await this.descriptionInput.fill(note.description);
    await this.categorySelect.selectOption(note.category);
  }
}
