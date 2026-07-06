import { randomUUID } from 'node:crypto';

export function uniqueSuffix(prefix = 'pw'): string {
  return `${prefix}-${Date.now()}-${randomUUID().slice(0, 8)}`;
}

export function uniqueEmail(prefix = 'pw-notes'): string {
  return `${uniqueSuffix(prefix)}@example.com`;
}
