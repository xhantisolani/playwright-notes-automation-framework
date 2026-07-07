import { expect, test } from '../../../fixtures/ui.fixture';
import { uniqueSuffix } from '../../../utils/randomData';

test.describe('Notes App profile @ui @regression', () => {
  test('shows the authenticated user profile @smoke', async ({ profilePage, authSession }) => {
    await test.step('Open the authenticated profile page', async () => {
      await profilePage.goto();
      await profilePage.expectLoaded();
    });

    await test.step('Verify the profile belongs to the authenticated user', async () => {
      await expect(profilePage.emailInput).toHaveValue(authSession.user.email);
    });
  });

  test('updates profile details and verifies them through the API', async ({
    profilePage,
    notesApi,
    authToken,
  }) => {
    const profile = {
      name: `PW UI ${uniqueSuffix('u').slice(-8)}`,
      phone: '0821234567',
      company: 'QA Learning Lab',
    };

    await test.step('Open the profile page', async () => {
      await profilePage.goto();
      await profilePage.expectLoaded();
    });

    await test.step('Update profile details in the UI', async () => {
      await profilePage.updateProfile(profile);
      await expect(profilePage.nameInput).toHaveValue(profile.name);
    });

    await test.step('Verify updated details through the API', async () => {
      const response = await notesApi.getProfile(authToken);
      expect(response.response.status(), response.body.message).toBe(200);
      expect(response.body.data.name).toBe(profile.name);
      expect(response.body.data.phone).toBe(profile.phone);
      expect(response.body.data.company).toBe(profile.company);
    });
  });

  test('validates required fields on the change password tab', async ({ profilePage }) => {
    await test.step('Open the change password tab', async () => {
      await profilePage.goto();
      await profilePage.openChangePassword();
    });

    await test.step('Submit the empty change password form', async () => {
      await profilePage.submitEmptyPasswordChange();
    });

    await test.step('Verify required password fields are highlighted', async () => {
      await expect(profilePage.currentPasswordInput).toHaveClass(/is-invalid/);
      await expect(profilePage.newPasswordInput).toHaveClass(/is-invalid/);
      await expect(profilePage.confirmPasswordInput).toHaveClass(/is-invalid/);
    });
  });
});
