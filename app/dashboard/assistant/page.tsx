import { createClient } from "@/utils/supabase/server";
import AssistantClient from "./AssistantClient";

export default async function AssistantPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in first.</div>;
  }

  // Fetch user's existing notes
  const { data: notes } = await supabase
    .from("notes")
    .select("id, title, created_at, content_markdown")
    .order("created_at", { ascending: false });

  // Fetch user's existing flashcard study sets
  const { data: studySets } = await supabase
    .from("study_sets")
    .select("id, title, description, created_at")
    .order("created_at", { ascending: false });

  return (
    <AssistantClient notes={notes || []} initialStudySets={studySets || []} />
  );
}
