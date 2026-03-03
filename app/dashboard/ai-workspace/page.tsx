import { createClient } from "@/utils/supabase/server";
import AIWorkspaceClient from "./AIWorkspaceClient";

export default async function AIWorkspacePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in first.</div>;
  }

  // Fetch user's existing notes (include folder_id)
  const { data: notes } = await supabase
    .from("notes")
    .select("id, title, created_at, content_markdown, tags, folder_id")
    .order("created_at", { ascending: false });

  // Fetch folders
  const { data: folders } = await supabase
    .from("note_folders")
    .select("id, name, created_at")
    .order("created_at", { ascending: true });

  // Fetch user's existing flashcard study sets
  const { data: studySets } = await supabase
    .from("study_sets")
    .select("id, title, description, created_at")
    .order("created_at", { ascending: false });

  return (
    <AIWorkspaceClient
      initialNotes={notes || []}
      initialFolders={folders || []}
      initialStudySets={studySets || []}
    />
  );
}
