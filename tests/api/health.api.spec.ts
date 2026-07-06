import { expect, test } from '../../fixtures/api.fixture';

test.describe('Notes API health @api @smoke', () => {
  test('returns a healthy service response', async ({ notesApi }) => {
    const health = await test.step('Check that the Notes API service is healthy', async () => {
      return notesApi.healthCheck();
    });

    await test.step('Verify the health check response is successful', async () => {
      expect(health.response.status()).toBe(200);
      expect(health.body.success).toBe(true);
    });
  });
});
