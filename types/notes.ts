export type NoteCategory = 'Home' | 'Work' | 'Personal';

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

export interface RegisteredUser extends TestUser {
  id: string;
  token: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

export interface UserProfileUpdate {
  name: string;
  phone?: string;
  company?: string;
}

export interface LoginData extends UserProfile {
  token: string;
}

export interface NotePayload {
  title: string;
  description: string;
  category: NoteCategory;
}

export interface NoteUpdatePayload extends NotePayload {
  completed: boolean;
}

export interface Note extends NoteUpdatePayload {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface ApiEnvelope<TData = unknown> {
  success: boolean;
  status: number;
  message: string;
  data: TData;
}

export interface ApiMessage {
  success: boolean;
  status: number;
  message: string;
}

export interface AuthSession {
  user: TestUser;
  token: string;
  createdByFramework: boolean;
  deleteAccountOnTeardown: boolean;
}
