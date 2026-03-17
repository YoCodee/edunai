import { createClient } from "@/utils/supabase/server";
import AIWorkspaceClient from "./AIWorkspaceClient";

export default async function AIWorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ note?: string }>;
}) {
  const { note: selectedNoteId } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in first.</div>;
  }

  // Run all queries in parallel for faster loading
  const [notesRes, foldersRes, studySetsRes] = await Promise.all([
    supabase
      .from("notes")
      .select("id, title, created_at, content_markdown, tags, folder_id")
      .order("created_at", { ascending: false }),
    supabase
      .from("note_folders")
      .select("id, name, created_at")
      .order("created_at", { ascending: true }),
    supabase
      .from("study_sets")
      .select("id, title, description, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const notes = notesRes.data;
  const folders = foldersRes.data;
  const studySets = studySetsRes.data;

  return (
    <AIWorkspaceClient
      initialNotes={notes || []}
      initialFolders={folders || []}
      initialStudySets={studySets || []}
      selectedNoteId={selectedNoteId}
    />
  );
}
