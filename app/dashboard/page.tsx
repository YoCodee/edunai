import { createClient } from "@/utils/supabase/server";
import { isToday, parseISO } from "date-fns";
import OverviewClient from "./components/OverviewClient";

export default async function DashboardOverview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let firstName = "Student";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const fullName =
      profile?.full_name || user.user_metadata?.full_name || "Student";
    firstName = fullName.split(" ")[0];
  }

  // Fetch notes
  const { data: notes } = await supabase
    .from("notes")
    .select("id, title, created_at")
    .eq("user_id", user?.id || "")
    .order("created_at", { ascending: false })
    .limit(3);

  // Fetch boards
  const { data: boards } = await supabase
    .from("boards")
    .select("id, title, user_id")
    .order("created_at", { ascending: false })
    .limit(3);

  // Fetch study sets count
  const { data: studySets } = await supabase
    .from("study_sets")
    .select("id")
    .eq("user_id", user?.id || "");

  // Fetch events
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", user?.id || "")
    .order("start_time", { ascending: true });

  // Count notes
  const { count: totalNotesCount } = await supabase
    .from("notes")
    .select("id", { count: "exact" })
    .eq("user_id", user?.id || "");

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
    />
  );
}
