import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { getNoteById } from "@/lib/note.server";
import NotePreviewClient from "./NotePreview.client";
interface NoteDetailsProps {
  params: Promise<{ id: string }>;
}
export { generateMetadata } from "@/app/(private routes)/notes/[id]/page";
export const dynamic = "force-dynamic";
export default async function NotePreview({ params }: NoteDetailsProps) {
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
      <NotePreviewClient />
    </HydrationBoundary>
  );
}
