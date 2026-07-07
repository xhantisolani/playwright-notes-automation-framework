import type { Expect } from '@playwright/test';
import type { ApiEnvelope, ApiMessage, Note, NotePayload } from '../types/notes';
import type { ApiResult } from './apiClient';

type ApiFailureBody = Pick<ApiMessage, 'success' | 'status' | 'message'>;

export function expectSuccessfulEnvelope<TData>(
  expect: Expect,
  result: ApiResult<ApiEnvelope<TData>>,
  status = 200,
): void {
  expect(result.response.status(), result.body.message).toBe(status);
  expect(result.body.success).toBe(true);
  expect(result.body.status).toBe(status);
}

export function expectFailureMessage(
  expect: Expect,
  result: ApiResult<ApiFailureBody>,
  status: number,
): void {
  expect(result.response.status(), result.body.message).toBe(status);
  expect(result.body.success).toBe(false);
  expect(result.body.status).toBe(status);
}

export function expectNoteMatches(expect: Expect, actual: Note, expected: NotePayload): void {
  expect(actual.title).toBe(expected.title);
  expect(actual.description).toBe(expected.description);
  expect(actual.category).toBe(expected.category);
}
