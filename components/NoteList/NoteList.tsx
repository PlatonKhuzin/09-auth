"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Note } from "@/types/note";
import { deleteNote } from "@/lib/api/clientApi";
import css from "./NoteList.module.css";
interface NoteListProps {
  notes: Note[];
  onDeleted: () => void;
}
export default function NoteList({ notes, onDeleted }: NoteListProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: async () => {
      onDeleted();
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
  return (
    <>
      <ul className={css.list}>
        {notes.map((note) => (
          <li key={note.id} className={css.listItem}>
            <h2 className={css.title}>{note.title}</h2>
            <p className={css.content}>{note.content}</p>
            <div className={css.footer}>
              <span className={css.tag}>{note.tag}</span>
              <Link className={css.link} href={`/notes/${note.id}`}>
                View details
              </Link>
              <button
                type="button"
                className={css.button}
                disabled={mutation.isPending}
                onClick={() => mutation.mutate(note.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {mutation.isError && (
        <p role="alert">Could not delete the note. Please try again.</p>
      )}
    </>
  );
}
