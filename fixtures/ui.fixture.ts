import { expect, test as base } from './notes.fixture';
import { LoginPage } from '../pages/LoginPage';
import { NotesPage } from '../pages/NotesPage';
import { ProfilePage } from '../pages/ProfilePage';
import { RegisterPage } from '../pages/RegisterPage';
import { blockThirdPartyNoise } from '../utils/network';

interface UiFixtures {
  blockThirdPartyNoise: void;
  loginPage: LoginPage;
  notesPage: NotesPage;
  profilePage: ProfilePage;
  registerPage: RegisterPage;
}

export const test = base.extend<UiFixtures>({
  blockThirdPartyNoise: [
    async ({ page }, use) => {
      await blockThirdPartyNoise(page);
      await use();
    },
    { auto: true },
  ],

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  notesPage: async ({ page }, use) => {
    await use(new NotesPage(page));
  },

  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },

  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
});

export { expect };
