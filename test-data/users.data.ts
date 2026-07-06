import type { TestUser } from '../types/notes';

export const invalidUser: TestUser = {
  name: 'Invalid User',
  email: 'invalid-user@example.com',
  password: 'WrongPassword123!',
};

export const testUserDefaults = {
  password: 'Password123!',
};
