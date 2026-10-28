import { cookies } from "next/headers";
import { api } from "./api";
import type { Note } from "@/types/note";
import type { User } from "@/types/user";
import type { FetchNotesParams, FetchNotesResponse } from "./clientApi";
import type { AxiosResponse } from "axios";
interface SessionResponse {
  success: boolean;
}
async function cookieHeaders(cookieHeader?: string) {
  return { Cookie: cookieHeader ?? (await cookies()).toString() };
}
export async function fetchNotes({
  page,
  perPage = 12,
  search = "",
  tag,
  signal,
}: FetchNotesParams): Promise<FetchNotesResponse> {
  const { data } = await api.get<FetchNotesResponse>("/notes", {
    headers: await cookieHeaders(),
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
export async function fetchNoteById(id: string): Promise<Note> {
  const { data } = await api.get<Note>(`/notes/${encodeURIComponent(id)}`, {
    headers: await cookieHeaders(),
  });
  return data;
}
export async function getMe(cookieHeader?: string): Promise<User> {
  const { data } = await api.get<User>("/users/me", {
    headers: await cookieHeaders(cookieHeader),
  });
  return data;
}
export async function checkSession(
  cookieHeader?: string,
): Promise<AxiosResponse<SessionResponse>> {
  return api.get<SessionResponse>("/auth/session", {
    headers: await cookieHeaders(cookieHeader),
  });
}
