import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { getNoteById } from "@/lib/note.server";
import type { Metadata } from "next";
import NoteDetailsClient from "./NoteDetails.client";
interface NoteDetailsProps {
  params: Promise<{ id: string }>;
}
export async function generateMetadata({
  params,
}: NoteDetailsProps): Promise<Metadata> {
  const { id } = await params;
  let title = "Note unavailable | NoteHub",
    description = "This note could not be loaded.";
  try {
    const note = await getNoteById(id);
    title = `${note.title} | NoteHub`;
    description =
      note.content?.trim().slice(0, 160) ||
      `${note.title} — a ${note.tag} note on NoteHub.`;
  } catch {}
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/notes/${encodeURIComponent(id)}`,
      images: [
        {
          url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
          width: 1200,
          height: 630,
          alt: "NoteHub — note details",
        },
      ],
    },
  };
}
export const dynamic = "force-dynamic";
export default async function NoteDetails({ params }: NoteDetailsProps) {
  const { id } = await params;
  const queryClient = new QueryClient();
  const queryKey = ["note", id];
  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => getNoteById(id),
  });
  if (queryClient.getQueryState(queryKey)?.status === "error")
    throw new Error(
      "Unable to load note details. The note may no longer exist.",
    );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteDetailsClient />
    </HydrationBoundary>
  );
}
