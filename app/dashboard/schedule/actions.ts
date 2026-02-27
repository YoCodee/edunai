"use server";

import { createClient } from "@/utils/supabase/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { addWeeks, format } from "date-fns";

// 1. Matkul Tetap (Fixed Class) Generator
// Generate events for the next 16 weeks starting from a particular date
export async function addFixedClass(data: {
  title: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  color: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "User not authenticated" };

  const eventsToInsert = [];
  const startObj = new Date(data.startDate);

  // Loop to generate 16 weeks of this class
  for (let i = 0; i < 16; i++) {
    const targetDate = addWeeks(startObj, i);
    const dateString = format(targetDate, "yyyy-MM-dd");

    const startDateTime = new Date(
      `${dateString}T${data.startTime}:00`,
    ).toISOString();
    const endDateTime = new Date(
      `${dateString}T${data.endTime}:00`,
    ).toISOString();

    eventsToInsert.push({
      user_id: user.id,
      title: data.title,
      location: data.location,
      start_time: startDateTime,
      end_time: endDateTime,
      event_type: "class",
      color: data.color,
    });
  }

  const { error } = await supabase.from("events").insert(eventsToInsert);

  if (error) return { error: error.message };
  return { success: true };
}

// 2. AI Smart Scheduling (Tugas Dinamis)
export async function addAITask(data: {
  title: string;
  durationHours: number;
  deadlineDate: string; // YYYY-MM-DD
  color: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "User not authenticated" };

  const now = new Date();
  const deadline = new Date(`${data.deadlineDate}T23:59:59`); // End of the deadline day

  // Pull existing events between NOW and DEADLINE
  const { data: existingEvents } = await supabase
    .from("events")
    .select("title, start_time, end_time")
    .eq("user_id", user.id)
    .gte("start_time", now.toISOString())
    .lte("end_time", deadline.toISOString())
    .order("start_time", { ascending: true });

  const scheduleStr =
    existingEvents && existingEvents.length > 0
      ? existingEvents
          .map(
            (e) =>
              `- ${e.title}: ${format(new Date(e.start_time), "yyyy-MM-dd HH:mm")} to ${format(new Date(e.end_time), "HH:mm")}`,
          )
          .join("\n")
      : "No existing events. The schedule is completely free.";

  const prompt = `You are a smart scheduling assistant for a university student.
The student needs to do a task: "${data.title}"
Estimated Duration: ${data.durationHours} hours
Deadline: ${format(deadline, "yyyy-MM-dd HH:mm")}
Current Time Now: ${format(now, "yyyy-MM-dd HH:mm")}

Here is their current fixed schedule between now and the deadline:
${scheduleStr}

Rules for scheduling:
1. Find a block of ${data.durationHours} hours for this new task.
2. It MUST NOT overlap with any of the existing events listed above.
3. Schedule it between 08:00 and 22:00 (the student's local time).
4. Try to schedule it as early as possible before the deadline.
5. Return ONLY a pure JSON object (no markdown, no explanation):
{ "start_time": "YYYY-MM-DDTHH:mm:00", "end_time": "YYYY-MM-DDTHH:mm:00" }
VERY IMPORTANT: Use plain local datetime WITHOUT any timezone offset (e.g. "2026-02-28T14:00:00" NOT "2026-02-28T14:00:00Z" or "2026-02-28T14:00:00+07:00").`;

  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error("Missing AI API Key");

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: apiKey,
      temperature: 0.1,
    });

    const response = await model.invoke([
      new HumanMessage({ content: prompt }),
    ]);
    let responseText = response.content as string;

    // Clean markdown code blocks from AI response just in case
    responseText = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // Extract JSON object
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI returned invalid response format.");

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.start_time || !parsed.end_time) {
      throw new Error("AI returned invalid JSON format.");
    }

    // Normalise: strip trailing Z or timezone offset so it's treated as local time
    const cleanTime = (t: string) =>
      t.replace(/Z$/, "").replace(/[+-]\d{2}:\d{2}$/, "");

    const startLocal = cleanTime(parsed.start_time);
    const endLocal = cleanTime(parsed.end_time);

    // Validate the format
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(startLocal)) {
      throw new Error(`Invalid start_time format from AI: ${startLocal}`);
    }

    // Save the dynamically scheduled AI Task
    const { error: insertError } = await supabase.from("events").insert([
      {
        user_id: user.id,
        title: `AI Task: ${data.title}`,
        start_time: startLocal,
        end_time: endLocal,
        event_type: "task",
        color: data.color,
      },
    ]);

    if (insertError) throw new Error(insertError.message);

    return {
      success: true,
      ai_start: startLocal,
      ai_end: endLocal,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to optimally schedule task with AI.";
    console.error("AI Scheduling Error:", message);
    return { error: message };
  }
}

// 3. Bulk Import Classes from Excel
export interface BulkClassRow {
  course_name: string; // e.g. "Calculus"
  day_of_week: string; // e.g. "Monday" | "Tuesday" | ...
  start_time: string; // HH:mm e.g. "09:00"
  end_time: string; // HH:mm e.g. "10:30"
  location: string; // e.g. "Room A1"
  color: string; // "blue" | "purple" | "green" | "orange"
  semester_start_date: string; // YYYY-MM-DD first Monday of semester
  weeks: number; // how many weeks to repeat (default 16)
}

export async function bulkImportClasses(rows: BulkClassRow[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "User not authenticated" };

  const DAY_MAP: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const eventsToInsert: object[] = [];

  for (const row of rows) {
    const targetDayIndex = DAY_MAP[row.day_of_week.toLowerCase()];
    if (targetDayIndex === undefined) continue;

    const semesterStart = new Date(row.semester_start_date);
    const semesterStartDay = semesterStart.getDay(); // 0=Sun, 1=Mon ...

    // Calculate offset from semester start to the target day of week
    let dayOffset = targetDayIndex - semesterStartDay;
    if (dayOffset < 0) dayOffset += 7;

    // First occurrence of this day in the semester
    const firstOccurrence = new Date(semesterStart);
    firstOccurrence.setDate(semesterStart.getDate() + dayOffset);

    const totalWeeks = row.weeks > 0 ? row.weeks : 16;

    for (let w = 0; w < totalWeeks; w++) {
      const targetDate = addWeeks(firstOccurrence, w);
      const dateStr = format(targetDate, "yyyy-MM-dd");

      const startISO = new Date(
        `${dateStr}T${row.start_time}:00`,
      ).toISOString();
      const endISO = new Date(`${dateStr}T${row.end_time}:00`).toISOString();

      eventsToInsert.push({
        user_id: user.id,
        title: row.course_name,
        location: row.location || "",
        start_time: startISO,
        end_time: endISO,
        event_type: "class",
        color: row.color || "blue",
      });
    }
  }

  if (eventsToInsert.length === 0) {
    return { error: "No valid rows found to import." };
  }

  // Insert in batches of 500
  const BATCH_SIZE = 500;
  for (let i = 0; i < eventsToInsert.length; i += BATCH_SIZE) {
    const batch = eventsToInsert.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("events").insert(batch);
    if (error) return { error: error.message };
  }

  return { success: true, totalEvents: eventsToInsert.length };
}

// 4. Import KRS using Gemini Vision AI
// Accepts a base64-encoded image or PDF and returns parsed schedule rows
export async function importKRSWithAI(
  fileBase64: string,
  mimeType: string,
): Promise<{ rows?: BulkClassRow[]; rawText?: string; error?: string }> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return { error: "Missing AI API Key" };

  const today = format(new Date(), "yyyy-MM-dd");

  const prompt = `You are an expert academic schedule parser for Indonesian universities.
Analyze this KRS (Kartu Rencana Studi / Course Registration Card) document carefully.

Extract ALL courses/classes listed in this document.
For each course, output a JSON object with these exact fields:
- "course_name": Full course name (string). If it has a course code, include it or just the name.
- "day_of_week": The day this class meets. Must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.
  - Indonesian days: Senin=Monday, Selasa=Tuesday, Rabu=Wednesday, Kamis=Thursday, Jumat=Friday, Sabtu=Saturday, Minggu=Sunday
- "start_time": Class start time in 24-hour HH:mm format (e.g. "08:00", "13:30").
- "end_time": Class end time in 24-hour HH:mm format (e.g. "09:40", "15:00").
- "location": Room, building, or class code if visible. If not found, use empty string "".
- "color": Always use "blue" unless you can infer a category (lab=purple, elective=green, otherwise blue).
- "semester_start_date": Use "${today}" as the semester start date since we cannot determine it precisely.
- "weeks": Always use 16 (standard semester length).

IMPORTANT RULES:
1. If a course meets on MULTIPLE days per week (e.g. Mon & Wed), create SEPARATE entries for each day.
2. Parse ALL courses visible, even if the table has unusual formatting.
3. If time is shown as a range like "08.00-09.40" or "08:00 - 09:40", parse start and end accordingly.
4. Return ONLY a valid JSON array. No markdown code blocks, no explanation, no extra text.
5. If you truly cannot read any schedule, return an empty array [].

Example output format:
[
  {"course_name":"Kalkulus I","day_of_week":"Monday","start_time":"08:00","end_time":"09:40","location":"GK-101","color":"blue","semester_start_date":"${today}","weeks":16},
  {"course_name":"Fisika Dasar","day_of_week":"Wednesday","start_time":"13:00","end_time":"14:40","location":"GK-202","color":"blue","semester_start_date":"${today}","weeks":16}
]`;

  try {
    // Call Gemini via REST API directly — supports inline images AND inline PDFs
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: fileBase64,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096,
          },
        }),
      },
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(
        err?.error?.message || `Gemini API error: ${response.status}`,
      );
    }

    const result = await response.json();
    let rawText: string =
      result?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Strip markdown code fences if AI wraps JSON anyway
    rawText = rawText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    // Extract JSON array from the response
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return {
        rawText,
        error:
          "AI could not detect a schedule in this document. Please check the image/PDF quality and try again.",
      };
    }

    const parsed: BulkClassRow[] = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return {
        rawText,
        error:
          "No schedule entries were extracted. The document may be unclear or unsupported.",
      };
    }

    // Sanitize and normalize each row
    const VALID_DAYS = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const VALID_COLORS = ["blue", "purple", "green", "orange"];

    const sanitized: BulkClassRow[] = parsed
      .filter(
        (r) =>
          r.course_name && VALID_DAYS.includes(r.day_of_week?.toLowerCase()),
      )
      .map((r) => ({
        course_name: String(r.course_name).trim(),
        day_of_week:
          r.day_of_week.charAt(0).toUpperCase() +
          r.day_of_week.slice(1).toLowerCase(),
        start_time: /^\d{2}:\d{2}$/.test(r.start_time) ? r.start_time : "08:00",
        end_time: /^\d{2}:\d{2}$/.test(r.end_time) ? r.end_time : "09:40",
        location: String(r.location || "").trim(),
        color: VALID_COLORS.includes(r.color?.toLowerCase())
          ? r.color.toLowerCase()
          : "blue",
        semester_start_date: /^\d{4}-\d{2}-\d{2}$/.test(r.semester_start_date)
          ? r.semester_start_date
          : today,
        weeks: typeof r.weeks === "number" && r.weeks > 0 ? r.weeks : 16,
      }));

    return { rows: sanitized, rawText };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("KRS AI Import Error:", message);
    return { error: message };
  }
}
