import { expect, type Locator, type Page } from '@playwright/test';
import type { NoteCategory, NotePayload } from '../types/notes';
import { BasePage } from './BasePage';

const mutationRenderTimeout = 30_000;

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
  readonly allCategoryButton: Locator;
  readonly logoutButton: Locator;

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
    this.allCategoryButton = this.byTestId('category-all');
    this.logoutButton = this.byTestId('logout');
  }

  async goto(): Promise<void> {
    await this.open('/');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.addNewNoteButton).toBeVisible();
  }

  async openNewNoteForm(): Promise<void> {
    await this.addNewNoteButton.click();
    await expect(this.titleInput).toBeVisible();
  }

  async addNote(note: NotePayload): Promise<void> {
    await this.openNewNoteForm();
    await this.fillNoteForm(note);
    await this.submitButton.click();
    await expect(this.noteCardByTitle(note.title)).toBeVisible({
      timeout: mutationRenderTimeout,
    });
  }

  async submitEmptyNoteForm(): Promise<void> {
    await this.openNewNoteForm();
    await this.submitButton.click();
  }

  async cancelNoteForm(): Promise<void> {
    await this.cancelButton.click();
    await expect(this.titleInput).toBeHidden();
  }

  async expectRequiredNoteValidation(): Promise<void> {
    await expect(this.titleInput).toHaveClass(/is-invalid/);
    await expect(this.descriptionInput).toHaveClass(/is-invalid/);
  }

  async editNoteByTitle(currentTitle: string, nextNote: NotePayload): Promise<void> {
    const card = this.noteCardByTitle(currentTitle);
    await expect(card).toBeVisible();
    await card.getByTestId('note-edit').click();
    await this.fillNoteForm(nextNote);
    await this.submitButton.click();
    await expect(this.noteCardByTitle(nextNote.title)).toBeVisible({
      timeout: mutationRenderTimeout,
    });
  }

  async deleteNoteByTitle(title: string): Promise<void> {
    const card = this.noteCardByTitle(title);
    await expect(card).toBeVisible();
    await card.getByTestId('note-delete').click();
    await this.byTestId('note-delete-confirm').click();
    await expect(card).toBeHidden({ timeout: mutationRenderTimeout });
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

  async clearSearch(): Promise<void> {
    await this.searchInput.fill('');
    await this.searchButton.click();
  }

  async showAllNotes(): Promise<void> {
    await this.clearSearch();
    await this.allCategoryButton.click();
  }

  async filterByCategory(category: NoteCategory): Promise<void> {
    await this.byTestId(`category-${category.toLowerCase()}`).click();
  }

  async viewNoteByTitle(title: string): Promise<void> {
    const card = this.noteCardByTitle(title);
    await expect(card).toBeVisible();
    await card.getByTestId('note-view').click();
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
    await expect(this.page).toHaveURL(/\/notes\/app\/?$/);
    await expect(this.addNewNoteButton).toBeHidden();
    await expect(this.page.getByRole('link', { name: 'Login' })).toBeVisible();
  }

  noteCardByTitle(title: string): Locator {
    return this.byTestId('note-card').filter({
      has: this.page.getByTestId('note-card-title').filter({ hasText: title }),
    });
  }

  noteDescriptionByTitle(title: string): Locator {
    return this.noteCardByTitle(title).getByTestId('note-card-description');
  }

  noteCompletedSwitchByTitle(title: string): Locator {
    return this.noteCardByTitle(title).getByTestId('toggle-note-switch');
  }

  private async fillNoteForm(note: NotePayload): Promise<void> {
    await this.titleInput.fill(note.title);
    await this.descriptionInput.fill(note.description);
    await this.categorySelect.selectOption(note.category);
  }
}
