"use server";

import { createClient } from "@/utils/supabase/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { revalidatePath } from "next/cache";

// ================== Types ==================
export interface RoadmapUnit {
  id: string;
  roadmap_id: string;
  title: string;
  summary: string | null;
  position_x: number;
  position_y: number;
  status: "locked" | "available" | "completed" | "mastered";
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Roadmap {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  cover_emoji: string;
  subject_type: "course" | "topic";
  total_units: number;
  completed_units: number;
  created_at: string;
  updated_at: string;
}

export interface UnitResource {
  id: string;
  unit_id: string;
  resource_type: "link" | "note" | "flashcard" | "reference";
  title: string;
  url: string | null;
  linked_note_id: string | null;
  linked_study_set_id: string | null;
  description?: string | null;
  source_type?: string | null;
}

interface GeneratedUnit {
  title: string;
  summary: string;
  position_x: number;
  position_y: number;
  order_index: number;
  requires: number[]; // indices of required units
}

// Helper to safely parse possibly truncated JSON
function safeParseJSON(text: string): unknown {
  // Remove markdown code blocks
  let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  
  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (initialError) {
    // Try to repair common issues
    
    // 1. Find the start of JSON
    const jsonStart = cleaned.indexOf("{");
    if (jsonStart > 0) {
      cleaned = cleaned.slice(jsonStart);
    }
    
    // 2. Count braces to check if truncated
    let openBraces = 0;
    let openBrackets = 0;
    let inString = false;
    let escape = false;
    
    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === "\\") {
        escape = true;
        continue;
      }
      if (char === '"' && !escape) {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === "{") openBraces++;
        if (char === "}") openBraces--;
        if (char === "[") openBrackets++;
        if (char === "]") openBrackets--;
      }
    }
    
    // 3. If we're in an unterminated string, try to close it
    if (inString) {
      // Find last quote and truncate there, then close properly
      const lastQuote = cleaned.lastIndexOf('"');
      if (lastQuote > 0) {
        cleaned = cleaned.slice(0, lastQuote + 1);
      } else {
        cleaned += '"';
      }
    }
    
    // 4. Add missing closing brackets/braces
    // If truncated mid-object in array, close the object first
    if (openBraces > openBrackets) {
      // We have more objects to close than arrays
      while (openBraces > 0) {
        cleaned += "}";
        openBraces--;
      }
    }
    while (openBrackets > 0) {
      cleaned += "]";
      openBrackets--;
    }
    while (openBraces > 0) {
      cleaned += "}";
      openBraces--;
    }
    
    // Try parsing again
    try {
      return JSON.parse(cleaned);
    } catch (repairError) {
      // Last resort: try to extract just the units array
      const unitsMatch = cleaned.match(/"units"\s*:\s*\[[\s\S]*?\}\s*\]/);
      if (unitsMatch) {
        try {
          return JSON.parse(`{${unitsMatch[0]}}`);
        } catch {
          // Give up
        }
      }
      throw initialError;
    }
  }
}

// ================== AI Generation ==================

async function generateRoadmapStructure(
  topic: string,
  description?: string
): Promise<{ units: GeneratedUnit[] } | { error: string }> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return { error: "Missing AI API Key" };

  try {
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: apiKey,
      temperature: 0.4,
      maxOutputTokens: 8192,
    });

    const prompt = `Kamu adalah ahli kurikulum dan learning design. Buatkan struktur learning roadmap untuk topik berikut:

Topik: ${topic}
${description ? `Deskripsi tambahan: ${description}` : ""}

Tugasmu:
1. Pecah topik menjadi 6-12 unit pembelajaran yang logis dan bertahap
2. Setiap unit harus memiliki: judul singkat, ringkasan materi (2-3 kalimat), dan dependensi (unit mana yang harus diselesaikan dulu)
3. Susun dalam bentuk tree/graph dengan posisi X (horizontal, 0-4) dan Y (vertical/level, 0 = awal)
4. Unit dasar di Y=0, makin advance makin tinggi Y-nya
5. Jika ada unit yang bisa dipelajari paralel, beri X berbeda tapi Y sama

RULES:
1. Return ONLY valid JSON, tanpa markdown ticks
2. Format:
{
  "units": [
    {
      "title": "Judul Unit",
      "summary": "Ringkasan singkat materi dalam Bahasa Indonesia",
      "position_x": 0,
      "position_y": 0,
      "order_index": 0,
      "requires": []
    },
    {
      "title": "Unit Lanjutan",
      "summary": "Ringkasan materi",
      "position_x": 0,
      "position_y": 1,
      "order_index": 1,
      "requires": [0]
    }
  ]
}

3. "requires" adalah array INDEX unit yang harus selesai dulu (bukan title)
4. Unit pertama (index 0) HARUS punya requires: [] kosong agar bisa dibuka
5. Pastikan tidak ada circular dependency`;

    const response = await model.invoke([
      new HumanMessage({ content: prompt }),
    ]);

    const rawText = response.content as string;
    const parsed = safeParseJSON(rawText) as { units: GeneratedUnit[] };
    return { units: parsed.units };
  } catch (err) {
    console.error("AI Generation Error:", err);
    return { error: err instanceof Error ? err.message : "Failed to generate roadmap structure" };
  }
}

async function generateRoadmapFromNoteContent(
  noteContents: { title: string; content: string }[]
): Promise<{ units: GeneratedUnit[] } | { error: string }> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return { error: "Missing AI API Key" };

  try {
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: apiKey,
      temperature: 0.4,
      maxOutputTokens: 8192,
    });

    // Truncate very long note contents to avoid token limits
    const truncatedNotes = noteContents.map((n) => ({
      title: n.title,
      content: n.content.length > 3000 ? n.content.slice(0, 3000) + "..." : n.content,
    }));

    const notesText = truncatedNotes
      .map((n, i) => `--- Note ${i + 1}: ${n.title} ---\n${n.content}`)
      .join("\n\n");

    const prompt = `Kamu adalah ahli kurikulum dan learning design. Analisis catatan berikut dan buatkan struktur learning roadmap berdasarkan konten yang ada:

${notesText}

Tugasmu:
1. Identifikasi konsep-konsep utama dari catatan tersebut
2. Pecah menjadi 6-12 unit pembelajaran yang logis dan bertahap
3. Setiap unit harus memiliki: judul singkat, ringkasan materi (2-3 kalimat), dan dependensi
4. Susun dalam bentuk tree dengan posisi X (0-4) dan Y (level, 0 = dasar)
5. Unit dasar di Y=0, makin advance makin tinggi Y-nya

RULES:
1. Return ONLY valid JSON, tanpa markdown ticks
2. Format:
{
  "units": [
    {
      "title": "Judul Unit",
      "summary": "Ringkasan singkat materi dalam Bahasa Indonesia",
      "position_x": 0,
      "position_y": 0,
      "order_index": 0,
      "requires": []
    }
  ]
}

3. "requires" adalah array INDEX unit yang harus selesai dulu
4. Unit pertama HARUS punya requires: [] kosong
5. Tidak boleh ada circular dependency`;

    const response = await model.invoke([
      new HumanMessage({ content: prompt }),
    ]);

    const rawText = response.content as string;
    const parsed = safeParseJSON(rawText) as { units: GeneratedUnit[] };
    return { units: parsed.units };
  } catch (err) {
    console.error("AI Generation Error:", err);
    return { error: err instanceof Error ? err.message : "Failed to generate roadmap from notes" };
  }
}

// ================== CRUD Operations ==================

export async function getUserRoadmaps() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return { error: error.message };
  return { data };
}

export async function getRoadmapWithUnits(roadmapId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Fetch roadmap
  const { data: roadmap, error: roadmapError } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("id", roadmapId)
    .eq("user_id", user.id)
    .single();

  if (roadmapError || !roadmap) return { error: "Roadmap not found" };

  // Fetch units
  const { data: units, error: unitsError } = await supabase
    .from("roadmap_units")
    .select("*")
    .eq("roadmap_id", roadmapId)
    .order("order_index", { ascending: true });

  if (unitsError) return { error: unitsError.message };

  // Fetch dependencies
  const unitIds = units?.map((u) => u.id) || [];
  const { data: dependencies } = await supabase
    .from("unit_dependencies")
    .select("*")
    .in("unit_id", unitIds);

  return { roadmap, units: units || [], dependencies: dependencies || [] };
}

export async function createRoadmapFromTopic(
  title: string,
  description: string,
  subjectType: "course" | "topic",
  emoji: string = "📚"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Generate structure with AI
  const result = await generateRoadmapStructure(title, description);
  if ("error" in result) return { error: result.error };

  // Create roadmap
  const { data: roadmap, error: roadmapError } = await supabase
    .from("roadmaps")
    .insert({
      user_id: user.id,
      title,
      description,
      cover_emoji: emoji,
      subject_type: subjectType,
    })
    .select()
    .single();

  if (roadmapError || !roadmap) {
    return { error: roadmapError?.message || "Failed to create roadmap" };
  }

  // Create units
  const unitsToInsert = result.units.map((u, idx) => ({
    roadmap_id: roadmap.id,
    title: u.title,
    summary: u.summary,
    position_x: u.position_x,
    position_y: u.position_y,
    order_index: idx,
    status: u.requires.length === 0 ? "available" : "locked",
  }));

  const { data: createdUnits, error: unitsError } = await supabase
    .from("roadmap_units")
    .insert(unitsToInsert)
    .select();

  if (unitsError || !createdUnits) {
    // Rollback: delete roadmap
    await supabase.from("roadmaps").delete().eq("id", roadmap.id);
    return { error: unitsError?.message || "Failed to create units" };
  }

  // Create dependencies
  const dependenciesToInsert: { unit_id: string; required_unit_id: string }[] = [];
  result.units.forEach((u, idx) => {
    u.requires.forEach((reqIdx) => {
      if (reqIdx >= 0 && reqIdx < createdUnits.length && reqIdx !== idx) {
        dependenciesToInsert.push({
          unit_id: createdUnits[idx].id,
          required_unit_id: createdUnits[reqIdx].id,
        });
      }
    });
  });

  if (dependenciesToInsert.length > 0) {
    await supabase.from("unit_dependencies").insert(dependenciesToInsert);
  }

  revalidatePath("/dashboard/study-guide");
  return { data: roadmap };
}

export async function createRoadmapFromNotes(
  noteIds: string[],
  title: string,
  subjectType: "course" | "topic",
  emoji: string = "📖"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Fetch notes content
  const { data: notes, error: notesError } = await supabase
    .from("notes")
    .select("title, content_markdown")
    .in("id", noteIds)
    .eq("user_id", user.id);

  if (notesError || !notes || notes.length === 0) {
    return { error: "Notes not found" };
  }

  const noteContents = notes.map((n) => ({
    title: n.title,
    content: n.content_markdown || "",
  }));

  // Generate structure with AI
  const result = await generateRoadmapFromNoteContent(noteContents);
  if ("error" in result) return { error: result.error };

  // Create roadmap
  const { data: roadmap, error: roadmapError } = await supabase
    .from("roadmaps")
    .insert({
      user_id: user.id,
      title,
      description: `Generated from ${notes.length} note(s)`,
      cover_emoji: emoji,
      subject_type: subjectType,
    })
    .select()
    .single();

  if (roadmapError || !roadmap) {
    return { error: roadmapError?.message || "Failed to create roadmap" };
  }

  // Create units
  const unitsToInsert = result.units.map((u, idx) => ({
    roadmap_id: roadmap.id,
    title: u.title,
    summary: u.summary,
    position_x: u.position_x,
    position_y: u.position_y,
    order_index: idx,
    status: u.requires.length === 0 ? "available" : "locked",
  }));

  const { data: createdUnits, error: unitsError } = await supabase
    .from("roadmap_units")
    .insert(unitsToInsert)
    .select();

  if (unitsError || !createdUnits) {
    await supabase.from("roadmaps").delete().eq("id", roadmap.id);
    return { error: unitsError?.message || "Failed to create units" };
  }

  // Create dependencies
  const dependenciesToInsert: { unit_id: string; required_unit_id: string }[] = [];
  result.units.forEach((u, idx) => {
    u.requires.forEach((reqIdx) => {
      if (reqIdx >= 0 && reqIdx < createdUnits.length && reqIdx !== idx) {
        dependenciesToInsert.push({
          unit_id: createdUnits[idx].id,
          required_unit_id: createdUnits[reqIdx].id,
        });
      }
    });
  });

  if (dependenciesToInsert.length > 0) {
    await supabase.from("unit_dependencies").insert(dependenciesToInsert);
  }

  revalidatePath("/dashboard/study-guide");
  return { data: roadmap };
}

export async function createRoadmapManual(
  title: string,
  description: string,
  subjectType: "course" | "topic",
  emoji: string,
  units: { title: string; summary: string }[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Create roadmap
  const { data: roadmap, error: roadmapError } = await supabase
    .from("roadmaps")
    .insert({
      user_id: user.id,
      title,
      description,
      cover_emoji: emoji,
      subject_type: subjectType,
    })
    .select()
    .single();

  if (roadmapError || !roadmap) {
    return { error: roadmapError?.message || "Failed to create roadmap" };
  }

  // Create units in a simple linear chain
  const unitsToInsert = units.map((u, idx) => ({
    roadmap_id: roadmap.id,
    title: u.title,
    summary: u.summary,
    position_x: 0,
    position_y: idx,
    order_index: idx,
    status: idx === 0 ? "available" : "locked",
  }));

  const { data: createdUnits, error: unitsError } = await supabase
    .from("roadmap_units")
    .insert(unitsToInsert)
    .select();

  if (unitsError || !createdUnits) {
    await supabase.from("roadmaps").delete().eq("id", roadmap.id);
    return { error: unitsError?.message || "Failed to create units" };
  }

  // Create linear dependencies (each unit requires the previous)
  const dependenciesToInsert = createdUnits.slice(1).map((unit, idx) => ({
    unit_id: unit.id,
    required_unit_id: createdUnits[idx].id,
  }));

  if (dependenciesToInsert.length > 0) {
    await supabase.from("unit_dependencies").insert(dependenciesToInsert);
  }

  revalidatePath("/dashboard/study-guide");
  return { data: roadmap };
}

export async function updateUnitStatus(
  unitId: string,
  status: "available" | "completed" | "mastered"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Verify ownership via roadmap
  const { data: unit } = await supabase
    .from("roadmap_units")
    .select("id, roadmap_id, status, roadmaps!inner(user_id)")
    .eq("id", unitId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roadmapData = (unit?.roadmaps as any);
  if (!unit || !roadmapData || roadmapData.user_id !== user.id) {
    return { error: "Unit not found or unauthorized" };
  }

  // Don't allow changing locked units directly
  if (unit.status === "locked" && status !== "available") {
    return { error: "Cannot change status of locked unit" };
  }

  const { error } = await supabase
    .from("roadmap_units")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", unitId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/study-guide");
  return { success: true };
}

export async function updateUnit(
  unitId: string,
  updates: { title?: string; summary?: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Verify ownership via roadmap
  const { data: unit } = await supabase
    .from("roadmap_units")
    .select("id, roadmap_id, roadmaps!inner(user_id)")
    .eq("id", unitId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roadmapData = (unit?.roadmaps as any);
  if (!unit || !roadmapData || roadmapData.user_id !== user.id) {
    return { error: "Unit not found or unauthorized" };
  }

  const { data, error } = await supabase
    .from("roadmap_units")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", unitId)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/study-guide");
  return { data };
}

export async function deleteRoadmap(roadmapId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("roadmaps")
    .delete()
    .eq("id", roadmapId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/study-guide");
  return { success: true };
}

// ================== Resources ==================

export async function getUnitResources(unitId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("unit_resources")
    .select(`
      *,
      notes:linked_note_id(id, title),
      study_sets:linked_study_set_id(id, title)
    `)
    .eq("unit_id", unitId);

  if (error) return { error: error.message };
  return { data };
}

export async function addResourceLink(
  unitId: string,
  title: string,
  url: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("unit_resources")
    .insert({
      unit_id: unitId,
      resource_type: "link",
      title,
      url,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function attachNoteToUnit(unitId: string, noteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Get note title
  const { data: note } = await supabase
    .from("notes")
    .select("title")
    .eq("id", noteId)
    .eq("user_id", user.id)
    .single();

  if (!note) return { error: "Note not found" };

  const { data, error } = await supabase
    .from("unit_resources")
    .insert({
      unit_id: unitId,
      resource_type: "note",
      title: note.title,
      linked_note_id: noteId,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function attachFlashcardToUnit(unitId: string, studySetId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Get study set title
  const { data: studySet } = await supabase
    .from("study_sets")
    .select("title")
    .eq("id", studySetId)
    .eq("user_id", user.id)
    .single();

  if (!studySet) return { error: "Study set not found" };

  const { data, error } = await supabase
    .from("unit_resources")
    .insert({
      unit_id: unitId,
      resource_type: "flashcard",
      title: studySet.title,
      linked_study_set_id: studySetId,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function removeResource(resourceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("unit_resources")
    .delete()
    .eq("id", resourceId);

  if (error) return { error: error.message };
  return { success: true };
}

// ================== Helper: Get user notes & study sets ==================

export async function getUserNotes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("notes")
    .select("id, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { data };
}

export async function createScannedNoteAndAttachToUnit(
  unitId: string,
  noteTitle: string,
  noteContent: string,
  roadmapTitle: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Find or create folder based on roadmap title
  let folderId: string | null = null;
  
  // Check if folder with this name exists
  const { data: existingFolder } = await supabase
    .from("note_folders")
    .select("id")
    .eq("user_id", user.id)
    .eq("name", roadmapTitle)
    .single();

  if (existingFolder) {
    folderId = existingFolder.id;
  } else {
    // Create new folder
    const { data: newFolder, error: folderError } = await supabase
      .from("note_folders")
      .insert({
        user_id: user.id,
        name: roadmapTitle,
      })
      .select()
      .single();

    if (!folderError && newFolder) {
      folderId = newFolder.id;
    }
  }

  // Create the note with folder assignment
  const { data: note, error: noteError } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      title: noteTitle,
      content_markdown: noteContent,
      tags: ["Study Guide"],
      folder_id: folderId,
    })
    .select()
    .single();

  if (noteError || !note) {
    return { error: noteError?.message || "Failed to create note" };
  }

  // Attach the note to the unit
  const { data: resource, error: resourceError } = await supabase
    .from("unit_resources")
    .insert({
      unit_id: unitId,
      resource_type: "note",
      title: note.title,
      linked_note_id: note.id,
    })
    .select()
    .single();

  if (resourceError) {
    return { error: resourceError.message };
  }

  revalidatePath("/dashboard/study-guide");
  revalidatePath("/dashboard/ai-workspace");
  return { data: { note, resource } };
}

// ================== AI References Generation ==================

export interface GeneratedReference {
  title: string;
  url: string;
  description: string;
  source_type: "youtube" | "article" | "documentation" | "other";
}

export async function generateUnitReferences(
  unitId: string,
  unitTitle: string,
  unitSummary: string | null,
  roadmapTitle: string
): Promise<{ data?: GeneratedReference[]; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return { error: "Missing AI API Key" };

  try {
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: apiKey,
      temperature: 0.5,
      maxOutputTokens: 2048,
    });

    const prompt = `Kamu adalah asisten pendidikan yang ahli dalam menemukan sumber belajar berkualitas.

Konteks Roadmap: ${roadmapTitle}
Unit/Topik: ${unitTitle}
${unitSummary ? `Ringkasan Materi: ${unitSummary}` : ""}

Tugasmu adalah merekomendasikan 3-5 sumber belajar terbaik untuk topik ini. Prioritaskan:
1. Video YouTube berbahasa Indonesia atau dengan subtitle Indonesia
2. Artikel/tutorial berbahasa Indonesia
3. Dokumentasi resmi (jika ada)

RULES:
1. Return ONLY valid JSON, tanpa markdown ticks
2. Hanya rekomendasikan sumber yang BENAR-BENAR ADA dan dapat diakses
3. Untuk YouTube, gunakan format URL: https://www.youtube.com/results?search_query=[encoded_search_term]
4. Untuk artikel, gunakan URL pencarian Google: https://www.google.com/search?q=[encoded_search_term]
5. Format:
[
  {
    "title": "Judul Resource dalam Bahasa Indonesia",
    "url": "URL yang valid",
    "description": "Deskripsi singkat (1-2 kalimat) tentang apa yang akan dipelajari",
    "source_type": "youtube" | "article" | "documentation" | "other"
  }
]`;

    const response = await model.invoke([
      new HumanMessage({ content: prompt }),
    ]);

    let rawText = response.content as string;
    rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    // Parse with error handling
    let references: GeneratedReference[];
    try {
      references = JSON.parse(rawText);
    } catch {
      // Try to extract array
      const arrayStart = rawText.indexOf("[");
      const arrayEnd = rawText.lastIndexOf("]");
      if (arrayStart >= 0 && arrayEnd > arrayStart) {
        let arrayText = rawText.slice(arrayStart, arrayEnd + 1);
        // Fix unterminated strings by closing them
        try {
          references = JSON.parse(arrayText);
        } catch {
          // Return empty if all parsing fails
          console.error("Failed to parse references JSON:", rawText);
          return { data: [] };
        }
      } else {
        return { data: [] };
      }
    }

    // Save references to database
    const resourcesToInsert = references.map((ref) => ({
      unit_id: unitId,
      resource_type: "reference" as const,
      title: ref.title,
      url: ref.url,
    }));

    const { error: insertError } = await supabase
      .from("unit_resources")
      .insert(resourcesToInsert);

    if (insertError) {
      console.error("Failed to save references:", insertError);
    }

    return { data: references };
  } catch (err) {
    console.error("AI Reference Generation Error:", err);
    return { error: err instanceof Error ? err.message : "Failed to generate references" };
  }
}

export async function getUserStudySets() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("study_sets")
    .select("id, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { data };
}
