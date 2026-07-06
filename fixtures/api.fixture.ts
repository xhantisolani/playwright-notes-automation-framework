import type { RegisteredUser } from '../types/notes';
import { NotesApiClient } from '../utils/apiClient';
import { cleanupAccount } from '../utils/cleanup';
import { env } from '../utils/env';
import { createUser } from '../factories/userFactory';
import { expect, test as base } from './auth.fixture';

interface ApiFixtures {
  notesApi: NotesApiClient;
  registeredUser: RegisteredUser;
}

export const test = base.extend<ApiFixtures>({
  notesApi: async ({ request }, use) => {
    await use(new NotesApiClient(request, env.apiBaseUrl));
  },

  registeredUser: async ({ notesApi }, use) => {
    const user = createUser();
    const registration = await notesApi.registerUser(user);
    expect(registration.response.status(), registration.body.message).toBe(201);

    const login = await notesApi.login(user.email, user.password);
    expect(login.response.status(), login.body.message).toBe(200);

    const registeredUser: RegisteredUser = {
      ...user,
      id: login.body.data.id,
      token: login.body.data.token,
    };

    await use(registeredUser);
    await cleanupAccount(notesApi, registeredUser.token);
  },
});

export { expect };
