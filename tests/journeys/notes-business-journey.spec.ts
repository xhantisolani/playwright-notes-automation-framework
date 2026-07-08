import { createNote } from '../../factories/noteFactory';
import { createUser } from '../../factories/userFactory';
import { expect, test } from '../../fixtures/ui.fixture';
import type { Note, NotePayload, TestUser } from '../../types/notes';
import { NotesApiClient } from '../../utils/apiClient';
import { cleanupAccount } from '../../utils/cleanup';
import { uniqueSuffix } from '../../utils/randomData';

async function getCleanupToken(
  notesApi: NotesApiClient,
  user: TestUser,
): Promise<string | undefined> {
  try {
    const login = await notesApi.login(user.email, user.password);
    return login.response.status() === 200 ? login.body.data.token : undefined;
  } catch {
    return undefined;
  }
}

async function getNotes(notesApi: NotesApiClient, token: string): Promise<Note[]> {
  const response = await notesApi.getNotes(token);
  expect(response.response.status(), response.body.message).toBe(200);
  return response.body.data;
}

function expectNotePayload(actual: Note | undefined, expected: NotePayload): void {
  expect(actual, `Expected to find API note "${expected.title}"`).toBeTruthy();
  expect(actual).toMatchObject({
    title: expected.title,
    description: expected.description,
    category: expected.category,
  });
}

test.describe('New customer onboarding business journey @journey @critical @nightly', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('new user signs up, updates profile, manages notes, and returns later @journey @critical @nightly', async ({
    registerPage,
    loginPage,
    notesPage,
    profilePage,
    notesApi,
  }, testInfo) => {
    test.slow();
    test.setTimeout(120_000);
    testInfo.annotations.push(
      { type: 'persona', description: 'New Notes App user' },
      {
        type: 'business-risk',
        description: 'A new user must be able to start using notes without support.',
      },
    );

    const suffix = uniqueSuffix('journey').slice(-8);
    const user = createUser({ name: `Journey User ${suffix}` });
    const profile = {
      name: `Journey Owner ${suffix}`,
      phone: '0821234567',
      company: 'Notes Workflow Team',
    };
    const homeNote = createNote({
      title: `Home onboarding checklist ${suffix}`,
      description: 'Capture home admin tasks after account creation.',
      category: 'Home',
    });
    const workNote = createNote({
      title: `Work launch plan ${suffix}`,
      description: 'Track the launch actions that must be completed today.',
      category: 'Work',
    });
    const personalNote = createNote({
      title: `Personal learning plan ${suffix}`,
      description: 'Track Playwright learning goals for the week.',
      category: 'Personal',
    });
    const editedPersonalNote = createNote({
      title: `Personal learning plan ${suffix} updated`,
      description: 'Track Playwright learning goals, reports, and CI practice.',
      category: 'Personal',
    });
    let cleanupToken: string | undefined;

    try {
      await test.step('Register a brand-new user account through the UI', async () => {
        await registerPage.goto();
        await registerPage.expectLoaded();
        await registerPage.register(user);
        await expect(registerPage.successMessage).toBeVisible();
        await expect(registerPage.loginLink).toBeVisible();
      });

      await test.step('Log in with the new user credentials through the UI', async () => {
        await registerPage.loginLink.click();
        await loginPage.expectLoaded();
        await loginPage.login(user.email, user.password);
        await notesPage.expectLoaded();
      });

      await test.step('Capture an API token for journey verification and cleanup', async () => {
        const login = await notesApi.login(user.email, user.password);
        expect(login.response.status(), login.body.message).toBe(200);
        cleanupToken = login.body.data.token;
      });

      await test.step('Complete the user profile from the UI', async () => {
        await profilePage.goto();
        await profilePage.expectLoaded();
        await profilePage.updateProfile(profile);
        await expect(profilePage.nameInput).toHaveValue(profile.name);
        await expect(profilePage.phoneInput).toHaveValue(profile.phone);
        await expect(profilePage.companyInput).toHaveValue(profile.company);
      });

      await test.step('Verify profile changes through the API', async () => {
        const response = await notesApi.getProfile(cleanupToken ?? '');
        expect(response.response.status(), response.body.message).toBe(200);
        expect(response.body.data).toMatchObject(profile);
      });

      await test.step('Create Home, Work, and Personal notes through the UI', async () => {
        await notesPage.goto();
        await notesPage.expectLoaded();
        await notesPage.addNote(homeNote);
        await notesPage.addNote(workNote);
        await notesPage.addNote(personalNote);
      });

      await test.step('Verify the UI-created notes exist in the backend', async () => {
        const notes = await getNotes(notesApi, cleanupToken ?? '');
        expectNotePayload(
          notes.find((note) => note.title === homeNote.title),
          homeNote,
        );
        expectNotePayload(
          notes.find((note) => note.title === workNote.title),
          workNote,
        );
        expectNotePayload(
          notes.find((note) => note.title === personalNote.title),
          personalNote,
        );
      });

      await test.step('Search for the Work note and confirm unrelated notes are hidden', async () => {
        await notesPage.searchFor(workNote.title);
        await expect(notesPage.noteCardByTitle(workNote.title)).toBeVisible();
        await expect(notesPage.noteCardByTitle(homeNote.title)).toBeHidden();
        await expect(notesPage.noteCardByTitle(personalNote.title)).toBeHidden();
      });

      await test.step('Filter by Work and mark the Work note completed', async () => {
        await notesPage.clearSearch();
        await notesPage.filterByCategory('Work');
        await expect(notesPage.noteCardByTitle(workNote.title)).toBeVisible();
        await expect(notesPage.noteCardByTitle(homeNote.title)).toBeHidden();
        await notesPage.markNoteCompletedByTitle(workNote.title);
        await expect(notesPage.noteCompletedSwitchByTitle(workNote.title)).toBeChecked();
      });

      await test.step('Edit the Personal note and delete the Home note', async () => {
        await notesPage.goto();
        await notesPage.showAllNotes();
        await notesPage.editNoteByTitle(personalNote.title, editedPersonalNote);
        await notesPage.deleteNoteByTitle(homeNote.title);
      });

      await test.step('Verify the final journey state through the API', async () => {
        const notes = await getNotes(notesApi, cleanupToken ?? '');
        const workApiNote = notes.find((note) => note.title === workNote.title);
        const personalApiNote = notes.find((note) => note.title === editedPersonalNote.title);

        expect(notes.map((note) => note.title)).not.toContain(homeNote.title);
        expect(workApiNote).toMatchObject({ completed: true });
        expectNotePayload(personalApiNote, editedPersonalNote);
      });

      await test.step('Log out, log back in, and confirm the saved notes are still there', async () => {
        await notesPage.logout();
        await loginPage.goto();
        await loginPage.expectLoaded();
        await loginPage.login(user.email, user.password);
        await notesPage.expectLoaded();
        await expect(notesPage.noteCardByTitle(workNote.title)).toBeVisible();
        await expect(notesPage.noteCardByTitle(editedPersonalNote.title)).toBeVisible();
        await expect(notesPage.noteCardByTitle(homeNote.title)).toBeHidden();
      });
    } finally {
      await test.step('Clean up the journey account through the API', async () => {
        if (!cleanupToken) {
          cleanupToken = await getCleanupToken(notesApi, user);
        }

        if (cleanupToken) {
          await cleanupAccount(notesApi, cleanupToken);
        }
      });
    }
  });
});

test.describe('Existing user daily work business journey @journey @nightly', () => {
  test('power user triages a mixed notes backlog across search, filters, edits, and delete @journey @nightly', async ({
    notesPage,
    createNoteViaApi,
    notesApi,
    authToken,
  }, testInfo) => {
    test.slow();
    test.setTimeout(120_000);
    testInfo.annotations.push(
      { type: 'persona', description: 'Returning power user' },
      {
        type: 'business-risk',
        description: 'Daily note triage must not lose, duplicate, or corrupt user tasks.',
      },
    );

    const suffix = uniqueSuffix('backlog').slice(-8);
    const payrollNote = createNote({
      title: `Approve payroll batch ${suffix}`,
      description: 'Finance team needs approval before 15:00.',
      category: 'Work',
    });
    const releaseNote = createNote({
      title: `Review release checklist ${suffix}`,
      description: 'Confirm smoke testing, stakeholder sign-off, and release notes.',
      category: 'Work',
    });
    const customerNote = createNote({
      title: `Call customer about feedback ${suffix}`,
      description: 'Record the discussion points and next action.',
      category: 'Work',
    });
    const homeArchiveNote = createNote({
      title: `Archive old home receipts ${suffix}`,
      description: 'Remove this once the receipt folder has been cleaned.',
      category: 'Home',
    });
    const homeKeepNote = createNote({
      title: `Renew home insurance ${suffix}`,
      description: 'Keep this reminder until the policy is renewed.',
      category: 'Home',
    });
    const learningNote = createNote({
      title: `Practise Playwright reports ${suffix}`,
      description: 'Read the HTML report and Allure report after a test run.',
      category: 'Personal',
    });
    const editedLearningNote = createNote({
      title: `Practise Playwright reports ${suffix} updated`,
      description: 'Read HTML, trace, video, screenshot, Allure, and GitHub summaries.',
      category: 'Personal',
    });

    const seeded = await test.step('Seed a realistic mixed backlog through the API', async () => {
      return {
        payroll: await createNoteViaApi(payrollNote),
        release: await createNoteViaApi(releaseNote),
        customer: await createNoteViaApi(customerNote),
        homeArchive: await createNoteViaApi(homeArchiveNote),
        homeKeep: await createNoteViaApi(homeKeepNote),
        learning: await createNoteViaApi(learningNote),
      };
    });

    await test.step('Open the Notes page and verify the full backlog is visible', async () => {
      await notesPage.goto();
      await notesPage.expectLoaded();
      await expect(notesPage.noteCardByTitle(payrollNote.title)).toBeVisible();
      await expect(notesPage.noteCardByTitle(releaseNote.title)).toBeVisible();
      await expect(notesPage.noteCardByTitle(customerNote.title)).toBeVisible();
      await expect(notesPage.noteCardByTitle(homeArchiveNote.title)).toBeVisible();
      await expect(notesPage.noteCardByTitle(homeKeepNote.title)).toBeVisible();
      await expect(notesPage.noteCardByTitle(learningNote.title)).toBeVisible();
    });

    await test.step('Filter to Work tasks and complete the urgent work items', async () => {
      await notesPage.filterByCategory('Work');
      await expect(notesPage.noteCardByTitle(payrollNote.title)).toBeVisible();
      await expect(notesPage.noteCardByTitle(releaseNote.title)).toBeVisible();
      await expect(notesPage.noteCardByTitle(homeKeepNote.title)).toBeHidden();
      await notesPage.markNoteCompletedByTitle(payrollNote.title);
      await notesPage.markNoteCompletedByTitle(releaseNote.title);
      await expect(notesPage.noteCompletedSwitchByTitle(payrollNote.title)).toBeChecked();
      await expect(notesPage.noteCompletedSwitchByTitle(releaseNote.title)).toBeChecked();
    });

    await test.step('Search for a customer follow-up and confirm only that note is shown', async () => {
      await notesPage.goto();
      await notesPage.searchFor(customerNote.title);
      await expect(notesPage.noteCardByTitle(customerNote.title)).toBeVisible();
      await expect(notesPage.noteCardByTitle(payrollNote.title)).toBeHidden();
      await expect(notesPage.noteCardByTitle(homeArchiveNote.title)).toBeHidden();
    });

    await test.step('Update the personal learning note with richer reporting tasks', async () => {
      await notesPage.goto();
      await notesPage.showAllNotes();
      await notesPage.editNoteByTitle(learningNote.title, editedLearningNote);
      await expect(notesPage.noteCardByTitle(editedLearningNote.title)).toBeVisible();
    });

    await test.step('Delete stale Home work while keeping active Home reminders', async () => {
      await notesPage.deleteNoteByTitle(homeArchiveNote.title);
      await expect(notesPage.noteCardByTitle(homeKeepNote.title)).toBeVisible();
    });

    await test.step('Verify the backend matches the completed business triage', async () => {
      const notes = await getNotes(notesApi, authToken);
      const notesById = new Map(notes.map((note) => [note.id, note]));

      expect(notesById.has(seeded.homeArchive.id)).toBe(false);
      expect(notesById.get(seeded.payroll.id)).toMatchObject({ completed: true });
      expect(notesById.get(seeded.release.id)).toMatchObject({ completed: true });
      expect(notesById.get(seeded.customer.id)).toMatchObject({ completed: false });
      expect(notesById.get(seeded.homeKeep.id)).toMatchObject({ completed: false });
      expectNotePayload(notesById.get(seeded.learning.id), editedLearningNote);
    });
  });
});
