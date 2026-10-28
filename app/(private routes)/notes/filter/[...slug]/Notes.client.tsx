"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import { fetchNotes } from "@/lib/api/clientApi";
import SearchBox from "@/components/SearchBox/SearchBox";
import NoteList from "@/components/NoteList/NoteList";
import Link from "next/link";
import Pagination from "@/components/Pagination/Pagination";
import StatusMessage from "@/components/StatusMessage/StatusMessage";
import css from "./NotesPage.module.css";
import type { NoteTag } from "@/types/note";
export default function NotesClient({ tag }: { tag?: NoteTag }) {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isPending, isFetching, isError, isPlaceholderData } = useQuery({
    queryKey: ["notes", tag ?? "all", search, page],
    queryFn: ({ signal }) =>
      fetchNotes({ page, perPage: 12, search, tag, signal }),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
  });
  const debouncedSearch = useDebouncedCallback((value: string): void => {
    setSearch(value.trim());
    setPage(1);
  }, 300);
  function changeSearch(value: string): void {
    setInput(value);
    debouncedSearch(value);
  }
  function deleted(): void {
    if (data?.notes.length === 1 && page > 1)
      setPage((previous) => previous - 1);
  }
  const notes = data?.notes ?? [];
  const totalPages = data?.totalPages ?? 0;
  return (
    <main className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={input} onChange={changeSearch} />
        {totalPages > 1 && (
          <Pagination
            page={Math.min(page, totalPages)}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
        <Link href="/notes/action/create" className={css.button}>
          Create note +
        </Link>
      </header>
      {isPending && (
        <StatusMessage>Loading notes, please wait...</StatusMessage>
      )}
      {!isPending && isFetching && (
        <StatusMessage>Updating notes...</StatusMessage>
      )}
      {isError && (
        <StatusMessage error>
          There was an error, please try again...
        </StatusMessage>
      )}
      {!isError && notes.length > 0 && (
        <NoteList notes={notes} onDeleted={deleted} />
      )}
      {!isPending &&
        !isFetching &&
        !isError &&
        !isPlaceholderData &&
        notes.length === 0 && <StatusMessage>No notes found.</StatusMessage>}
    </main>
  );
}
