import { expect, test } from '../../fixtures/api.fixture';
import { expectFailureMessage, expectSuccessfulEnvelope } from '../../utils/apiAssertions';

test.describe('Notes API profile @api @regression', () => {
  test('retrieves the authenticated user profile @smoke', async ({ notesApi, registeredUser }) => {
    const profile = await test.step('Get the current user profile through the API', async () => {
      return notesApi.getProfile(registeredUser.token);
    });

    await test.step('Verify the profile belongs to the registered user', async () => {
      expectSuccessfulEnvelope(expect, profile);
      expect(profile.body.data.email).toBe(registeredUser.email);
      expect(profile.body.data.name).toBe(registeredUser.name);
    });
  });

  test('updates profile details through the API', async ({ notesApi, registeredUser }) => {
    const updatedProfile = {
      name: 'PW API Learner',
      phone: '0123456789',
      company: 'Playwright Academy',
    };

    const response = await test.step('Patch the profile name, phone, and company', async () => {
      return notesApi.updateProfile(registeredUser.token, updatedProfile);
    });

    await test.step('Verify the updated profile fields are returned', async () => {
      expectSuccessfulEnvelope(expect, response);
      expect(response.body.data.name).toBe(updatedProfile.name);
      expect(response.body.data.phone).toBe(updatedProfile.phone);
      expect(response.body.data.company).toBe(updatedProfile.company);
    });
  });

  test('rejects profile access without a valid token', async ({ notesApi }) => {
    const response = await test.step('Request a profile with an invalid token', async () => {
      return notesApi.getProfile('invalid-token');
    });

    await test.step('Verify the API rejects the profile request', async () => {
      expectFailureMessage(expect, response, 401);
    });
  });
});
