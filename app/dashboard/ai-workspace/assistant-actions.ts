"use server";

import { createClient } from "@/utils/supabase/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

export async function generateStudyMaterial(
  noteId: string,
  type: "summary" | "flashcards" | "quiz",
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Fetch Note content
  const { data: note, error: noteError } = await supabase
    .from("notes")
    .select("title, content_markdown")
    .eq("id", noteId)
    .single();

  if (noteError || !note) {
    return { error: "Note not found." };
  }

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return { error: "Missing AI API Key" };

  try {
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: apiKey,
      temperature: 0.3,
    });

    if (type === "summary") {
      const prompt = `You are an expert tutor. Summarize the following study material concisely but comprehensively. Use markdown formatting (bullet points, bold text).
      
Material Title: ${note.title}
Material Content:
${note.content_markdown}
      `;
      const response = await model.invoke([
        new HumanMessage({ content: prompt }),
      ]);
      return {
        success: true,
        type: "summary",
        data: response.content as string,
      };
    } else if (type === "flashcards") {
      const prompt = `You are an expert tutor creating flashcards. Based on the following study material, create 5 to 10 high-quality flashcards to help a student memorize the key concepts.
      
Material Title: ${note.title}
Material Content:
${note.content_markdown}

Formatting RULES:
1. Return ONLY valid JSON format. No markdown ticks like \`\`\`json.
2. The format MUST be an array of objects: [{"front": "Question/Concept", "back": "Answer/Definition"}]
      `;
      const response = await model.invoke([
        new HumanMessage({ content: prompt }),
      ]);
      let rawText = response.content as string;
      rawText = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      const flashcardsData = JSON.parse(rawText);

      // Save to Supabase
      const { data: studySet, error: setErr } = await supabase
        .from("study_sets")
        .insert({
          user_id: user.id,
          note_id: noteId,
          title: `${note.title} Flashcards`,
          description: "AI Generated Flashcards",
        })
        .select()
        .single();

      if (setErr || !studySet) throw new Error("Failed to create study set.");

      const cardsToInsert = flashcardsData.map((c: any) => ({
        set_id: studySet.id,
        front_text: c.front,
        back_text: c.back,
      }));

      await supabase.from("flashcards").insert(cardsToInsert);

      return {
        success: true,
        type: "flashcards",
        setId: studySet.id,
        flashcards: cardsToInsert,
      };
    } else if (type === "quiz") {
      const prompt = `You are an expert tutor creating a practice quiz. Based on the following study material, create a 5-question multiple choice quiz.
      
Material Title: ${note.title}
Material Content:
${note.content_markdown}

Formatting RULES:
1. Return ONLY valid JSON format. No markdown ticks like \`\`\`json.
2. The format MUST be an array of objects: 
[
  {
    "question": "The question text?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "Why A is correct."
  }
]
`;
      const response = await model.invoke([
        new HumanMessage({ content: prompt }),
      ]);
      let rawText = response.content as string;
      rawText = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      const quizData = JSON.parse(rawText);

      return { success: true, type: "quiz", data: quizData };
    }

    return { error: "Unknown type" };
  } catch (err: any) {
    console.error("AI Generation Error:", err);
    return {
      error: err.message || "Something went wrong parsing AI response.",
    };
  }
}

export async function getStudySet(setId: string) {
  const supabase = await createClient();

  // Validate if it belongs to user
  const { data: set, error: setErr } = await supabase
    .from("study_sets")
    .select("*")
    .eq("id", setId)
    .single();
  if (setErr || !set) return { error: "Study set not found" };

  const { data: flashcards } = await supabase
    .from("flashcards")
    .select("*")
    .eq("set_id", setId)
    .order("id", { ascending: true });

  return { set, flashcards: flashcards || [] };
}
