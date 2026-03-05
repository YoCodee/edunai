import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getUserRoadmaps, getUserNotes } from "./actions";
import StudyGuideClient from "./StudyGuideClient";

export default async function StudyGuidePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [roadmapsResult, notesResult] = await Promise.all([
    getUserRoadmaps(),
    getUserNotes(),
  ]);

  const roadmaps = roadmapsResult.data || [];
  const notes = notesResult.data || [];

  return (
    <StudyGuideClient 
      initialRoadmaps={roadmaps} 
      userNotes={notes}
    />
  );
}
