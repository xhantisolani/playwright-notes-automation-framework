import { expect, request, test as setup } from '@playwright/test';
import { createUser } from '../../factories/userFactory';
import { NotesApiClient } from '../../utils/apiClient';
import { env, paths, writeAuthSession } from '../../utils/env';
import type { AuthSession, TestUser } from '../../types/notes';

setup('authenticate once and save storage state @setup', async ({ page }) => {
  const apiContext = await request.newContext();
  const notesApi = new NotesApiClient(apiContext, env.apiBaseUrl);

  const user: TestUser = env.testUserEmail
    ? {
        name: env.testUserName,
        email: env.testUserEmail,
        password: env.testUserPassword ?? '',
      }
    : createUser({ name: env.testUserName });

  if (!env.testUserEmail) {
    const registration = await notesApi.registerUser(user);
    expect(registration.response.status(), registration.body.message).toBe(201);
  }

  const login = await notesApi.login(user.email, user.password);
  expect(login.response.status(), login.body.message).toBe(200);

  const session: AuthSession = {
    user,
    token: login.body.data.token,
    createdByFramework: !env.testUserEmail,
    deleteAccountOnTeardown: !env.testUserEmail && !env.keepTestAccount,
  };

  await page.goto(env.uiBaseUrl);
  await page.evaluate((token) => window.localStorage.setItem('token', token), session.token);
  await page.context().storageState({ path: paths.authFile });
  writeAuthSession(session);

  await apiContext.dispose();
});
