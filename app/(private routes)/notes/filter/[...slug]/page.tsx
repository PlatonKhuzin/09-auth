import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { fetchNotes } from "@/lib/api/serverApi";
import { notFound } from "next/navigation";
import { tags } from "@/lib/tags";
import NotesClient from "./Notes.client";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const selected = slug[0];
  if (
    slug.length !== 1 ||
    (selected !== "all" && !tags.some((tag) => tag === selected))
  )
    notFound();
  const title = `${selected === "all" ? "All notes" : `${selected} notes`} | NoteHub`;
  const description =
    selected === "all"
      ? "Browse, search and organize all your notes with NoteHub."
      : `Browse and search your ${selected} notes with NoteHub.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/notes/filter/${selected}`,
      images: [
        {
          url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
          width: 1200,
          height: 630,
          alt: "NoteHub — browse notes",
        },
      ],
    },
  };
}
export const dynamic = "force-dynamic";
export default async function Notes({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const selected = slug[0];
  if (
    slug.length !== 1 ||
    (selected !== "all" && !tags.some((tag) => tag === selected))
  )
    notFound();
  const tag = tags.find((tag) => tag === selected);
  const queryClient = new QueryClient();
  const queryKey = ["notes", tag ?? "all", "", 1];
  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => fetchNotes({ page: 1, perPage: 12, search: "", tag }),
  });
  if (queryClient.getQueryState(queryKey)?.status === "error")
    throw new Error(
      "Unable to load notes. Check your NoteHub token and connection.",
    );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient key={selected} tag={tag} />
    </HydrationBoundary>
  );
}
