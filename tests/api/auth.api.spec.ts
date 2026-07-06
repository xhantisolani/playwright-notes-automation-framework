import { createUser } from '../../factories/userFactory';
import { expect, test } from '../../fixtures/api.fixture';
import { invalidUser } from '../../test-data/users.data';
import { cleanupAccount } from '../../utils/cleanup';

test.describe('Notes API authentication @api @regression', () => {
  test('registers and logs in a new user @smoke', async ({ notesApi }) => {
    const user = createUser();
    let token: string | undefined;

    try {
      const registration = await notesApi.registerUser(user);
      expect(registration.response.status(), registration.body.message).toBe(201);
      expect(registration.body.data.email).toBe(user.email);

      const login = await notesApi.login(user.email, user.password);
      expect(login.response.status(), login.body.message).toBe(200);
      expect(login.body.data.token).toBeTruthy();
      token = login.body.data.token;
    } finally {
      if (token) {
        await cleanupAccount(notesApi, token);
      }
    }
  });

  test('rejects invalid login credentials', async ({ notesApi }) => {
    const login = await notesApi.login(invalidUser.email, invalidUser.password);

    expect([400, 401]).toContain(login.response.status());
    expect(login.body.success).toBe(false);
  });
});
