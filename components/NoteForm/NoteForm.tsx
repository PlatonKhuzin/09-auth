"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "@/lib/api/clientApi";
import { useNoteStore } from "@/lib/store/noteStore";
import { tags } from "@/lib/tags";
import css from "./NoteForm.module.css";
interface FormState {
  error: string;
  attempt: number;
}
export default function NoteForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation({ mutationFn: createNote });
  const draft = useNoteStore((state) => state.draft);
  const setDraft = useNoteStore((state) => state.setDraft);
  const clearDraft = useNoteStore((state) => state.clearDraft);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.resolve(useNoteStore.persist.rehydrate()).finally(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);
  const [state, formAction, isPending] = useActionState(
    async (previous: FormState, formData: FormData): Promise<FormState> => {
      const title = String(formData.get("title") ?? "").trim();
      const content = String(formData.get("content") ?? "");
      const tag = tags.find((tag) => tag === formData.get("tag"));
      const failure = (error: string): FormState => ({
        error,
        attempt: previous.attempt + 1,
      });
      if (title.length < 3 || title.length > 50)
        return failure("Title must contain 3–50 characters.");
      if (content.length > 500)
        return failure("Content must contain at most 500 characters.");
      if (!tag) return failure("Choose a valid tag.");
      try {
        await mutation.mutateAsync({ title, content, tag });
      } catch {
        return failure(
          "Could not create the note. Your draft is saved. Please try again.",
        );
      }
      clearDraft();
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.push("/notes/filter/all");
      return { error: "", attempt: previous.attempt + 1 };
    },
    { error: "", attempt: 0 },
  );
  if (!ready) return <p>Loading draft, please wait...</p>;
  return (
    <form key={state.attempt} action={formAction} className={css.form}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          className={css.input}
          defaultValue={draft.title}
          onChange={(e) => setDraft({ title: e.target.value })}
          required
          minLength={3}
          maxLength={50}
          disabled={isPending}
        />
      </div>
      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          rows={8}
          className={css.textarea}
          defaultValue={draft.content}
          onChange={(e) => setDraft({ content: e.target.value })}
          maxLength={500}
          disabled={isPending}
        />
      </div>
      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          name="tag"
          className={css.select}
          defaultValue={draft.tag}
          onChange={(e) => {
            const tag = tags.find((tag) => tag === e.target.value);
            if (tag) setDraft({ tag });
          }}
          required
          disabled={isPending}
        >
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>
      {state.error && (
        <p role="alert" className={css.error}>
          {state.error}
        </p>
      )}
      <div className={css.actions}>
        <button
          type="button"
          className={css.cancelButton}
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </button>
        <button type="submit" className={css.submitButton} disabled={isPending}>
          {isPending ? "Creating..." : "Create note"}
        </button>
      </div>
    </form>
  );
}
