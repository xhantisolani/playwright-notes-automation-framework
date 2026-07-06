import { LoginPage } from '../../../pages/LoginPage';
import { NotesPage } from '../../../pages/NotesPage';
import { expectedMessages } from '../../../test-data/expected-messages.data';
import { invalidUser } from '../../../test-data/users.data';
import { expect, test } from '../../../fixtures/ui.fixture';

test.describe('Notes App login @ui @regression', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('shows the login page controls @smoke', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.expectLoaded();
  });

  test('shows an error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(invalidUser.email, invalidUser.password);
    await loginPage.expectAlertContains(expectedMessages.loginFailed);
  });

  test('allows a registered user to log in @smoke', async ({ page, registeredUser }) => {
    const loginPage = new LoginPage(page);
    const notesPage = new NotesPage(page);

    await loginPage.goto();
    await loginPage.login(registeredUser.email, registeredUser.password);

    await expect(notesPage.addNewNoteButton).toBeVisible();
  });
});
