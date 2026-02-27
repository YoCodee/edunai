"use server";

import { createClient } from "@/utils/supabase/server";

export async function createBoard(title: string, description: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "User not authenticated" };

  // Generate a random 6-character alphanumeric code for invite
  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data: board, error } = await supabase
    .from("boards")
    .insert([{ title, description, owner_id: user.id, join_code: joinCode }])
    .select()
    .single();

  if (error) return { error: error.message };

  // Add the creator as an admin member
  await supabase
    .from("board_members")
    .insert([{ board_id: board.id, user_id: user.id, role: "admin" }]);

  // Create default lists for KanBan
  await supabase.from("board_lists").insert([
    { board_id: board.id, title: "To Do", position: 1 },
    { board_id: board.id, title: "In Progress", position: 2 },
    { board_id: board.id, title: "Done", position: 3 },
  ]);

  return { data: board };
}

export async function joinBoardViaCode(joinCode: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "User not authenticated" };

  // 1. Find board by code
  const { data: board, error: findError } = await supabase
    .from("boards")
    .select("id")
    .eq("join_code", joinCode.toUpperCase())
    .single();

  if (findError || !board)
    return { error: "Invalid Join Code or board not found" };

  // 2. Check if already a member
  const { data: existingMember } = await supabase
    .from("board_members")
    .select("id")
    .eq("board_id", board.id)
    .eq("user_id", user.id)
    .single();

  if (existingMember)
    return { error: "You are already a member of this board" };

  // 3. Add to members
  const { error: joinError } = await supabase
    .from("board_members")
    .insert([{ board_id: board.id, user_id: user.id, role: "member" }]);

  if (joinError) return { error: joinError.message };

  return { success: true };
}
