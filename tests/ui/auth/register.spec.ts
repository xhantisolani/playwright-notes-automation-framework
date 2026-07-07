import { createUser } from '../../../factories/userFactory';
import { expect, test } from '../../../fixtures/ui.fixture';
import { cleanupAccount } from '../../../utils/cleanup';

test.describe('Notes App registration @ui @regression', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('registers a new user through the UI and cleans it up through the API', async ({
    registerPage,
    notesApi,
  }) => {
    const user = createUser();
    let token: string | undefined;

    try {
      await test.step('Open the registration page', async () => {
        await registerPage.goto();
        await registerPage.expectLoaded();
      });

      await test.step('Register a unique user through the UI', async () => {
        await registerPage.register(user);
      });

      await test.step('Verify the registration success state is shown', async () => {
        await expect(registerPage.successMessage).toBeVisible();
        await expect(registerPage.loginLink).toBeVisible();
      });

      await test.step('Log in through the API to get a cleanup token', async () => {
        const login = await notesApi.login(user.email, user.password);
        expect(login.response.status(), login.body.message).toBe(200);
        token = login.body.data.token;
      });
    } finally {
      await test.step('Clean up the UI-created registration account', async () => {
        if (token) {
          await cleanupAccount(notesApi, token);
        }
      });
    }
  });
});
