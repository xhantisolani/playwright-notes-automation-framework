import { expect, type Locator, type Page } from '@playwright/test';
import type { TestUser } from '../types/notes';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly loginLink: Locator;
  readonly alertMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = this.byTestId('register-name');
    this.emailInput = this.byTestId('register-email');
    this.passwordInput = this.byTestId('register-password');
    this.confirmPasswordInput = this.byTestId('register-confirm-password');
    this.submitButton = this.byTestId('register-submit');
    this.loginLink = this.byTestId('login-view');
    this.alertMessage = this.byTestId('alert-message');
    this.successMessage = this.page.getByText('User account created successfully');
  }

  async goto(): Promise<void> {
    await this.open('/register');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
  }

  async register(user: TestUser): Promise<void> {
    await this.nameInput.fill(user.name);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.confirmPasswordInput.fill(user.password);
    await this.submitButton.click();
  }
}
