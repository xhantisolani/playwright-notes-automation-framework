import { expect, type Locator, type Page } from '@playwright/test';
import type { UserProfileUpdate } from '../types/notes';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  readonly userIdInput: Locator;
  readonly emailInput: Locator;
  readonly nameInput: Locator;
  readonly phoneInput: Locator;
  readonly companyInput: Locator;
  readonly updateProfileButton: Locator;
  readonly changePasswordTab: Locator;
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly updatePasswordButton: Locator;
  readonly alertMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.userIdInput = this.byTestId('user-id');
    this.emailInput = this.byTestId('user-email');
    this.nameInput = this.byTestId('user-name');
    this.phoneInput = this.byTestId('user-phone');
    this.companyInput = this.byTestId('user-company');
    this.updateProfileButton = this.byTestId('update-profile');
    this.changePasswordTab = this.byTestId('change-password');
    this.currentPasswordInput = this.byTestId('current-password');
    this.newPasswordInput = this.byTestId('new-password');
    this.confirmPasswordInput = this.byTestId('confirm-password');
    this.updatePasswordButton = this.byTestId('update-password');
    this.alertMessage = this.byTestId('alert-message');
  }

  async goto(): Promise<void> {
    await this.open('/profile');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.userIdInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.nameInput).toBeVisible();
  }

  async updateProfile(profile: UserProfileUpdate): Promise<void> {
    await this.nameInput.fill(profile.name);
    await this.phoneInput.fill(profile.phone ?? '');
    await this.companyInput.fill(profile.company ?? '');
    await this.updateProfileButton.click();
  }

  async openChangePassword(): Promise<void> {
    await this.changePasswordTab.click();
    await expect(this.currentPasswordInput).toBeVisible();
  }

  async submitEmptyPasswordChange(): Promise<void> {
    await this.updatePasswordButton.click();
  }
}
