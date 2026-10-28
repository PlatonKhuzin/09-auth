"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchNoteById } from "@/lib/api/clientApi";
import { useCallback } from "react";
import Modal from "@/components/Modal/Modal";
import css from "./NotePreview.module.css";
export default function NotePreviewClient() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const {
    data: note,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["note", id],
    queryFn: ({ signal }) => fetchNoteById(id, signal),
    refetchOnMount: false,
  });
  const close = useCallback(() => router.back(), [router]);
  if (isLoading)
    return (
      <Modal onClose={close}>
        <p>Loading, please wait...</p>
      </Modal>
    );
  if (isError || !note)
    return (
      <Modal onClose={close}>
        <p>Something went wrong.</p>
      </Modal>
    );
  return (
    <Modal onClose={close}>
      <button
        type="button"
        className={css.backBtn}
        onClick={close}
        aria-label="Close preview"
      >
        Close
      </button>
      <div className={css.container}>
        <div className={css.item}>
          <div className={css.header}>
            <h2>{note.title}</h2>
          </div>
          <p className={css.tag}>{note.tag}</p>
          <p className={css.content}>{note.content}</p>
          <p className={css.date}>
            {new Date(note.createdAt).toISOString().slice(0, 10)}
          </p>
        </div>
      </div>
    </Modal>
  );
}
