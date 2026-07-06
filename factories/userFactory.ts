import type { TestUser } from '../types/notes';
import { uniqueEmail, uniqueSuffix } from '../utils/randomData';

export const defaultPassword = 'Password123!';

export function createUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    name: `PW User ${uniqueSuffix('u').slice(-8)}`,
    email: uniqueEmail(),
    password: defaultPassword,
    ...overrides,
  };
}
