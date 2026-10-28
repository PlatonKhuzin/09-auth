export type NoteTag = "Todo" | "Work" | "Personal" | "Meeting" | "Shopping";
export interface NoteDraft {
  title: string;
  content: string;
  tag: NoteTag;
}
export interface Note {
  userId: string;
  id: string;
  title: string;
  content: string | null;
  tag: NoteTag;
  createdAt: string;
  updatedAt: string;
}
