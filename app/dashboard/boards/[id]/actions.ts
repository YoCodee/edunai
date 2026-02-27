"use server";

import { createClient } from "@/utils/supabase/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

export async function moveCard(
  cardId: string,
  newListId: string,
  newPosition: number,
) {
  const supabase = await createClient();

  // A real app would verify user permissions here (check board_members)

  const { error } = await supabase
    .from("board_cards")
    .update({
      list_id: newListId,
      position: newPosition,
    })
    .eq("id", cardId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function createCard(
  listId: string,
  title: string,
  description: string = "",
  position: number = 0,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("board_cards")
    .insert([
      {
        list_id: listId,
        title: title,
        description: description,
        position: position,
      },
    ])
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function updateCardLabels(cardId: string, newLabels: any[]) {
  const supabase = await createClient();

  // A real app would verify user permissions here

  const { error } = await supabase
    .from("board_cards")
    .update({
      labels: newLabels,
    })
    .eq("id", cardId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteCard(cardId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("board_cards")
    .delete()
    .eq("id", cardId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function generateAITasks(
  boardId: string,
  syllabusContent: string,
) {
  const supabase = await createClient();

  // 1. Get the "To Do" list or the first list for this board
  const { data: lists, error: listsError } = await supabase
    .from("board_lists")
    .select("id, title")
    .eq("board_id", boardId)
    .order("position", { ascending: true });

  if (listsError || !lists || lists.length === 0) {
    return { error: "Could not find any lists in this board to add tasks to." };
  }

  // Best effort to find a "To Do" list, otherwise use the first one
  let targetListId = lists[0].id;
  const todoList = lists.find(
    (l) =>
      l.title.toLowerCase().includes("to do") ||
      l.title.toLowerCase().includes("todo"),
  );
  if (todoList) {
    targetListId = todoList.id;
  }

  // 2. Query Gemini to break down the syllabus
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error("Missing AI API Key");

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: apiKey,
      temperature: 0.2,
    });

    const prompt = `You are an expert Project Manager. You are helping a group of students break down their project syllabus/description into actionable kanban task cards.
Below is the syllabus/description:
---
${syllabusContent}
---

Your job is to read it, figure out the logical steps/deliverables needed, and break it down into 5 to 10 actionable task cards. 
Formatting RULES:
1. Return ONLY valid JSON format. No markdown ticks like \`\`\`json, no explanations. 
2. The format MUST be an array of objects: [{"title": "Task name", "description": "Short explanation of the task"}]
3. Make sure the JSON is perfectly valid.`;

    const response = await model.invoke([
      new HumanMessage({ content: prompt }),
    ]);
    let responseText = response.content as string;

    // Clean potential markdown blocks
    responseText = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const tasks = JSON.parse(responseText);

    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new Error("AI did not return a valid list of tasks.");
    }

    // 3. Get the max position in the target list so we can append
    const { data: existingCards } = await supabase
      .from("board_cards")
      .select("position")
      .eq("list_id", targetListId)
      .order("position", { ascending: false })
      .limit(1);

    let startPosition =
      existingCards && existingCards.length > 0
        ? existingCards[0].position + 1
        : 0;

    // 4. Insert tasks into the DB
    const cardsToInsert = tasks.map((t: any, idx: number) => ({
      list_id: targetListId,
      title: t.title || "Untitled Task",
      description: t.description || "",
      position: startPosition + idx,
    }));

    const { error: insertError } = await supabase
      .from("board_cards")
      .insert(cardsToInsert);

    if (insertError) throw new Error(insertError.message);

    return { success: true, count: cardsToInsert.length };
  } catch (error: any) {
    console.error("AI Task Generation Error:", error);
    return {
      error:
        error.message || "Failed to automatically generate tasks using AI.",
    };
  }
}
