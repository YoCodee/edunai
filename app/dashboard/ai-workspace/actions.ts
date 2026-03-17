"use server";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { createClient } from "@/utils/supabase/server";

export async function processImageWithAI(base64Image: string | string[]) {
  try {
    const apiKey = "AIzaSyAXzH_tLDjO-53RtCgraA4-FJ9QrOe-bPY";
    if (!apiKey) {
      throw new Error("Missing Gemini API Key");
    }

    // Initialize LangChain's Google GenAI Chat Model
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash", // Fast and efficient for multi-modal tasks
      apiKey: apiKey,
      maxOutputTokens: 2048,
      temperature: 0.4, // Keep it relatively deterministic for summarizing
    });

    // Handle single or multiple images
    const imagesArray = Array.isArray(base64Image) ? base64Image : [base64Image];

    const contentArr: any[] = [
      {
        type: "text",
        text: `Kamu adalah asisten akademik yang cerdas dan ahli dalam merangkum materi.
Tolong baca dengan teliti dan analisis gambar/foto catatan yang saya berikan.
Tugas kamu adalah:
1. Ekstrak (OCR) semua teks penting yang ada di dalam gambar.
2. Gabungkan informasi dari semua gambar jika ada lebih dari satu, lalu ubah dan rangkum kata-kata tersebut menjadi sebuah ringkasan (Summary) yang sangat rapi dan mudah dihafal oleh mahasiswa.
3. Gunakan format Markdown (Gunakan Heading, Bullet points, list, dan teks tebal/bold untuk keyword penting).
4. Buat bahasanya tetap berbobot namun mudah dipahami. Gunakan Bahasa Indonesia.`,
      }
    ];

    imagesArray.forEach((img) => {
      contentArr.push({
        type: "image_url",
        image_url: img,
      });
    });

    const message = new HumanMessage({
      content: contentArr,
    });

    const response = await model.invoke([message]);

    return {
      success: true,
      content: response.content as string,
    };
  } catch (error: any) {
    console.error("AI Processing Error:", error);
    return {
      success: false,
      error: error.message || "Failed to process image with AI",
    };
  }
}

export async function saveGeneratedNote(
  title: string,
  markdownContent: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not logged in" };
  }

  const { data, error } = await supabase
    .from("notes")
    .insert([
      {
        user_id: user.id,
        title: title,
        content_markdown: markdownContent,
        tags: ["AI-Generated", "Scanner"],
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Supabase Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function deleteNoteWithResources(noteId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not logged in" };
  }

  // First, delete any unit_resources that reference this note
  await supabase
    .from("unit_resources")
    .delete()
    .eq("linked_note_id", noteId);

  // Then delete the note itself
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
