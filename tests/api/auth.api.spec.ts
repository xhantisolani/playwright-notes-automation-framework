import { createUser } from '../../factories/userFactory';
import { expect, test } from '../../fixtures/api.fixture';
import { invalidUser } from '../../test-data/users.data';
import { expectFailureMessage, expectSuccessfulEnvelope } from '../../utils/apiAssertions';
import { cleanupAccount } from '../../utils/cleanup';

test.describe('Notes API authentication @api @regression', () => {
  test('registers and logs in a new user @smoke', async ({ notesApi }) => {
    const user = createUser();
    let token: string | undefined;

    try {
      await test.step('Create a unique practice user through the API', async () => {
        const registration = await notesApi.registerUser(user);
        expect(registration.response.status(), registration.body.message).toBe(201);
        expect(registration.body.data.email).toBe(user.email);
      });

      await test.step('Log in with the new user through the API', async () => {
        const login = await notesApi.login(user.email, user.password);
        expectSuccessfulEnvelope(expect, login);
        expect(login.body.data.token).toBeTruthy();
        token = login.body.data.token;
      });
    } finally {
      await test.step('Clean up the temporary user account', async () => {
        if (token) {
          await cleanupAccount(notesApi, token);
        }
      });
    }
  });

  test('rejects invalid login credentials', async ({ notesApi }) => {
    const login = await test.step('Try to log in with invalid credentials', async () => {
      return notesApi.login(invalidUser.email, invalidUser.password);
    });

    await test.step('Verify the API rejects the invalid login', async () => {
      expect([400, 401]).toContain(login.response.status());
      expect(login.body.success).toBe(false);
    });
  });

  test('invalidates the token when the user logs out', async ({ notesApi }) => {
    const user = createUser();
    let cleanupToken: string | undefined;

    try {
      await test.step('Register and log in a temporary user', async () => {
        const registration = await notesApi.registerUser(user);
        expect(registration.response.status(), registration.body.message).toBe(201);

        const login = await notesApi.login(user.email, user.password);
        expectSuccessfulEnvelope(expect, login);
        cleanupToken = login.body.data.token;
      });

      await test.step('Log out the temporary user', async () => {
        const logout = await notesApi.logout(cleanupToken ?? '');
        expect(logout.response.status(), logout.body.message).toBe(200);
        expect(logout.body.success).toBe(true);
      });

      await test.step('Verify the logged-out token no longer works', async () => {
        const profile = await notesApi.getProfile(cleanupToken ?? '');
        expectFailureMessage(expect, profile, 401);
      });

      await test.step('Log in again so the temporary account can be cleaned up', async () => {
        const login = await notesApi.login(user.email, user.password);
        expectSuccessfulEnvelope(expect, login);
        cleanupToken = login.body.data.token;
      });
    } finally {
      await test.step('Clean up the logout test account', async () => {
        if (cleanupToken) {
          await cleanupAccount(notesApi, cleanupToken);
        }
      });
    }
  });
});
