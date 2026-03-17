import { createClient } from "@/utils/supabase/server";
import { isToday, parseISO } from "date-fns";
import OverviewClient from "./components/OverviewClient";

export default async function DashboardOverview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id || "";

  // Run ALL queries in parallel for maximum speed
  const [profileRes, notesRes, boardsRes, studySetsRes, eventsRes, notesCountRes, activityRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single(),
      supabase
        .from("notes")
        .select("id, title, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("boards")
        .select("id, title, user_id")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("study_sets")
        .select("id")
        .eq("user_id", userId),
      supabase
        .from("events")
        .select("*")
        .eq("user_id", userId)
        .order("start_time", { ascending: true }),
      supabase
        .from("notes")
        .select("id", { count: "exact" })
        .eq("user_id", userId),
      supabase
        .from("user_activity")
        .select("last_tool, last_resource_title, progress_value, last_visited_at")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

  const fullName =
    profileRes.data?.full_name || user?.user_metadata?.full_name || "Student";
  const firstName = fullName.split(" ")[0];

  const notes = notesRes.data;
  const boards = boardsRes.data;
  const studySets = studySetsRes.data;
  const events = eventsRes.data;
  const totalNotesCount = notesCountRes.count;
  const activity = activityRes.data;

  const totalStudySets = studySets?.length || 0;

  const todayEvents =
    events?.filter((event) => isToday(parseISO(event.start_time))) || [];

  return (
    <OverviewClient
      firstName={firstName}
      totalNotesCount={totalNotesCount || 0}
      totalStudySets={totalStudySets}
      notes={notes || []}
      boards={boards || []}
      todayEvents={todayEvents}
      lastTool={activity?.last_tool ?? null}
      lastResourceTitle={activity?.last_resource_title ?? null}
      progressValue={activity?.progress_value ?? 0}
      lastVisitedAt={activity?.last_visited_at ?? null}
    />
  );
}
