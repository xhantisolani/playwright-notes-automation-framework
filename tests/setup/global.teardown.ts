import { request } from '@playwright/test';
import { NotesApiClient } from '../../utils/apiClient';
import { cleanupAccount } from '../../utils/cleanup';
import { env, readAuthSession } from '../../utils/env';

async function globalTeardown(): Promise<void> {
  const session = readAuthSession();

  if (!session?.deleteAccountOnTeardown) {
    return;
  }

  const apiContext = await request.newContext();
  const notesApi = new NotesApiClient(apiContext, env.apiBaseUrl);
  await cleanupAccount(notesApi, session.token);
  await apiContext.dispose();
}

export default globalTeardown;
