import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProgressTrackerClient, { DayActivity } from "./ProgressTrackerClient";

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Which tools has the user touched? Derive from real tables.
  const unlockedTools: string[] = [];

  const [notesRes, boardsRes, studySetsRes, eventsRes, scannerRes] =
    await Promise.all([
      supabase.from("notes").select("id").eq("user_id", user.id).limit(1),
      supabase.from("boards").select("id").eq("owner_id", user.id).limit(1),
      supabase.from("study_sets").select("id").eq("user_id", user.id).limit(1),
      supabase.from("events").select("id").eq("user_id", user.id).limit(1),
      supabase
        .from("notes")
        .select("original_image_url")
        .eq("user_id", user.id)
        .not("original_image_url", "is", null)
        .limit(1),
    ]);

  if ((eventsRes.data?.length ?? 0) > 0) unlockedTools.push("schedule");
  if ((notesRes.data?.length ?? 0) > 0) unlockedTools.push("notes");
  if ((scannerRes.data?.length ?? 0) > 0) unlockedTools.push("scanner");
  if ((boardsRes.data?.length ?? 0) > 0) unlockedTools.push("boards");
  if ((studySetsRes.data?.length ?? 0) > 0) unlockedTools.push("assistant");

  // Activity log
  let activityData: DayActivity[] = [];
  let totalActiveDays = 0;
  let currentStreak = 0;

  const { data: logs } = await supabase
    .from("activity_log")
    .select("activity_date, activity_count")
    .eq("user_id", user.id)
    .order("activity_date", { ascending: true });

  if (logs) {
    activityData = logs.map((r) => ({
      date: r.activity_date as string,
      count: r.activity_count as number,
    }));
    totalActiveDays = logs.filter((r) => r.activity_count > 0).length;

    // Calculate current streak (consecutive days ending today)
    const today = new Date().toISOString().split("T")[0];
    const dateSet = new Set(
      logs.filter((r) => r.activity_count > 0).map((r) => r.activity_date),
    );
    let d = new Date();
    while (dateSet.has(d.toISOString().split("T")[0])) {
      currentStreak++;
      d.setDate(d.getDate() - 1);
    }
    // If today not logged yet, check from yesterday
    if (currentStreak === 0 && !dateSet.has(today)) {
      d = new Date();
      d.setDate(d.getDate() - 1);
      while (dateSet.has(d.toISOString().split("T")[0])) {
        currentStreak++;
        d.setDate(d.getDate() - 1);
      }
    }
  }

  return (
    <ProgressTrackerClient
      unlockedTools={unlockedTools}
      activityData={activityData}
      totalActiveDays={totalActiveDays}
      currentStreak={currentStreak}
    />
  );
}
