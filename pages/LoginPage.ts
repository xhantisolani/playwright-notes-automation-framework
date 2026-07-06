import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly alertMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = this.byTestId('login-email');
    this.passwordInput = this.byTestId('login-password');
    this.submitButton = this.byTestId('login-submit');
    this.alertMessage = this.byTestId('alert-message');
  }

  async goto(): Promise<void> {
    await this.open('/login');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectAlertContains(message: string | RegExp): Promise<void> {
    await expect(this.alertMessage).toBeVisible();
    await expect(this.alertMessage).toContainText(message);
  }
}
