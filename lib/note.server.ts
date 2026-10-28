import { cache } from "react";
import { fetchNoteById } from "@/lib/api/serverApi";
export const getNoteById = cache((id: string) => fetchNoteById(id));
