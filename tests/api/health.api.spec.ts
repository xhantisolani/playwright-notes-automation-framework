import { expect, test } from '../../fixtures/api.fixture';

test.describe('Notes API health @api @smoke', () => {
  test('returns a healthy service response', async ({ notesApi }) => {
    const health = await notesApi.healthCheck();

    expect(health.response.status()).toBe(200);
    expect(health.body.success).toBe(true);
  });
});
