import { api } from "./api";
import type { Note, NoteTag } from "@/types/note";
import type { User } from "@/types/user";
export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}
export interface FetchNotesParams {
  page: number;
  perPage?: number;
  search?: string;
  tag?: NoteTag;
  signal?: AbortSignal;
}
export interface CreateNoteParams {
  title: string;
  content: string;
  tag: NoteTag;
}
export async function fetchNotes({
  page,
  perPage = 12,
  search = "",
  tag,
  signal,
}: FetchNotesParams): Promise<FetchNotesResponse> {
  const { data } = await api.get<FetchNotesResponse>("/notes", {
    params: {
      page,
      perPage,
      ...(search ? { search } : {}),
      ...(tag ? { tag } : {}),
    },
    signal,
  });
  return data;
}
export async function createNote(values: CreateNoteParams): Promise<Note> {
  const { data } = await api.post<Note>("/notes", values);
  return data;
}
export async function deleteNote(id: string): Promise<Note> {
  const { data } = await api.delete<Note>(`/notes/${encodeURIComponent(id)}`);
  return data;
}

export async function fetchNoteById(
  id: string,
  signal?: AbortSignal,
): Promise<Note> {
  const { data } = await api.get<Note>(`/notes/${encodeURIComponent(id)}`, {
    signal,
  });
  return data;
}

export interface AuthRequest {
  email: string;
  password: string;
}
export interface UpdateMeRequest {
  username: string;
}
export interface SessionResponse {
  success: boolean;
}
export async function register(values: AuthRequest): Promise<User> {
  const { data } = await api.post<User>("/auth/register", values);
  return data;
}
export async function login(values: AuthRequest): Promise<User> {
  const { data } = await api.post<User>("/auth/login", values);
  return data;
}
export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
export async function checkSession(signal?: AbortSignal): Promise<boolean> {
  const { data } = await api.get<SessionResponse>("/auth/session", { signal });
  return data.success;
}
export async function getMe(signal?: AbortSignal): Promise<User> {
  const { data } = await api.get<User>("/users/me", { signal });
  return data;
}
export async function updateMe(values: UpdateMeRequest): Promise<User> {
  const { data } = await api.patch<User>("/users/me", values);
  return data;
}
