import type { APIRequestContext, APIResponse } from '@playwright/test';
import type {
  ApiEnvelope,
  ApiMessage,
  LoginData,
  Note,
  NotePayload,
  NoteUpdatePayload,
  TestUser,
  UserProfile,
  UserProfileUpdate,
} from '../types/notes';

export interface ApiResult<TBody> {
  response: APIResponse;
  body: TBody;
}

export class NotesApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string,
  ) {}

  async healthCheck(): Promise<ApiResult<ApiMessage>> {
    return this.parse(await this.request.get(this.url('/health-check')));
  }

  async registerUser(user: TestUser): Promise<ApiResult<ApiEnvelope<UserProfile>>> {
    return this.parse(
      await this.request.post(this.url('/users/register'), {
        form: {
          name: user.name,
          email: user.email,
          password: user.password,
        },
      }),
    );
  }

  async login(email: string, password: string): Promise<ApiResult<ApiEnvelope<LoginData>>> {
    return this.parse(
      await this.request.post(this.url('/users/login'), {
        form: { email, password },
      }),
    );
  }

  async getProfile(token: string): Promise<ApiResult<ApiEnvelope<UserProfile>>> {
    return this.parse(
      await this.request.get(this.url('/users/profile'), {
        headers: this.authHeaders(token),
      }),
    );
  }

  async updateProfile(
    token: string,
    profile: UserProfileUpdate,
  ): Promise<ApiResult<ApiEnvelope<UserProfile>>> {
    return this.parse(
      await this.request.patch(this.url('/users/profile'), {
        headers: this.authHeaders(token),
        form: {
          name: profile.name,
          phone: profile.phone ?? '',
          company: profile.company ?? '',
        },
      }),
    );
  }

  async logout(token: string): Promise<ApiResult<ApiMessage>> {
    return this.parse(
      await this.request.delete(this.url('/users/logout'), {
        headers: this.authHeaders(token),
      }),
    );
  }

  async deleteAccount(token: string): Promise<ApiResult<ApiMessage>> {
    return this.parse(
      await this.request.delete(this.url('/users/delete-account'), {
        headers: this.authHeaders(token),
      }),
    );
  }

  async createNote(token: string, note: NotePayload): Promise<ApiResult<ApiEnvelope<Note>>> {
    return this.parse(
      await this.request.post(this.url('/notes'), {
        headers: this.authHeaders(token),
        form: {
          title: note.title,
          description: note.description,
          category: note.category,
        },
      }),
    );
  }

  async getNotes(token: string): Promise<ApiResult<ApiEnvelope<Note[]>>> {
    return this.parse(
      await this.request.get(this.url('/notes'), {
        headers: this.authHeaders(token),
      }),
    );
  }

  async getNote(token: string, noteId: string): Promise<ApiResult<ApiEnvelope<Note>>> {
    return this.parse(
      await this.request.get(this.url(`/notes/${noteId}`), {
        headers: this.authHeaders(token),
      }),
    );
  }

  async updateNote(
    token: string,
    noteId: string,
    note: NoteUpdatePayload,
  ): Promise<ApiResult<ApiEnvelope<Note>>> {
    return this.parse(
      await this.request.put(this.url(`/notes/${noteId}`), {
        headers: this.authHeaders(token),
        form: {
          title: note.title,
          description: note.description,
          category: note.category,
          completed: String(note.completed),
        },
      }),
    );
  }

  async updateNoteCompleted(
    token: string,
    noteId: string,
    completed: boolean,
  ): Promise<ApiResult<ApiEnvelope<Note>>> {
    return this.parse(
      await this.request.patch(this.url(`/notes/${noteId}`), {
        headers: this.authHeaders(token),
        form: {
          completed: String(completed),
        },
      }),
    );
  }

  async deleteNote(token: string, noteId: string): Promise<ApiResult<ApiMessage>> {
    return this.parse(
      await this.request.delete(this.url(`/notes/${noteId}`), {
        headers: this.authHeaders(token),
      }),
    );
  }

  private url(path: string): string {
    const base = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`;
    return new URL(path.replace(/^\//, ''), base).toString();
  }

  private authHeaders(token: string): Record<string, string> {
    return {
      'x-auth-token': token,
    };
  }

  private async parse<TBody>(response: APIResponse): Promise<ApiResult<TBody>> {
    const text = await response.text();
    const body = text ? (JSON.parse(text) as TBody) : ({} as TBody);

    return {
      response,
      body,
    };
  }
}
