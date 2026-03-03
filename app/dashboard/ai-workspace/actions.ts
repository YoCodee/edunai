"use server";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { createClient } from "@/utils/supabase/server";

export async function processImageWithAI(base64Image: string) {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
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

    // Create the message with multi-modal content
    // We strip the "data:image/jpeg;base64," prefix if it exists to pass pure base64
    // Wait, LangChain's image_url accepts the full data URL scheme.
    // Ensure the base64Image has the data URL prefix.
    const message = new HumanMessage({
      content: [
        {
          type: "text",
          text: `Kamu adalah asisten akademik yang cerdas dan ahli dalam merangkum materi.
Tolong baca dengan teliti dan analisis gambar/foto catatan yang saya berikan.
Tugas kamu adalah:
1. Ekstrak (OCR) semua teks penting yang ada di dalam gambar.
2. Ubah dan rangkum kata-kata tersebut menjadi sebuah ringkasan (Summary) yang sangat rapi dan mudah dihafal oleh mahasiswa.
3. Gunakan format Markdown (Gunakan Heading, Bullet points, list, dan teks tebal/bold untuk keyword penting).
4. Buat bahasanya tetap berbobot namun mudah dipahami. Gunakan Bahasa Indonesia.`,
        },
        {
          type: "image_url",
          image_url: base64Image, // Expected to be in format: data:image/jpeg;base64,...
        },
      ],
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
