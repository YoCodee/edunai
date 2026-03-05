import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getRoadmapWithUnits, getUserNotes } from "../actions";
import RoadmapDetailClient from "./RoadmapDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoadmapDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [roadmapResult, notesResult] = await Promise.all([
    getRoadmapWithUnits(id),
    getUserNotes(),
  ]);

  if (roadmapResult.error || !roadmapResult.roadmap) {
    notFound();
  }

  return (
    <RoadmapDetailClient
      roadmap={roadmapResult.roadmap}
      units={roadmapResult.units || []}
      dependencies={roadmapResult.dependencies || []}
      userNotes={notesResult.data || []}
    />
  );
}
