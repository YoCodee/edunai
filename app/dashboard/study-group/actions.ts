"use server";

import { createClient } from "@/utils/supabase/server";

export async function createStudyGroup(title: string, description: string, subject: string, type: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "User not authenticated" };

    // Generate a random 6-character alphanumeric code for invite
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: group, error } = await supabase
        .from("study_groups")
        .insert([{ title, description, subject, owner_id: user.id, group_type: type, join_code: joinCode }])
        .select()
        .single();

    if (error) return { error: error.message };

    // Add the creator as an admin member
    await supabase
        .from("study_group_members")
        .insert([{ group_id: group.id, user_id: user.id, role: "admin" }]);

    return { data: group };
}

export async function joinStudyGroupViaCode(joinCode: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "User not authenticated" };

    // 1. Find group by code
    const { data: group, error: findError } = await supabase
        .from("study_groups")
        .select("id, title, group_type")
        .eq("join_code", joinCode.toUpperCase())
        .single();

    if (findError || !group)
        return { error: "Invalid Join Code or group not found" };

    // 2. Check if already a member
    const { data: existingMember } = await supabase
        .from("study_group_members")
        .select("group_id")
        .eq("group_id", group.id)
        .eq("user_id", user.id)
        .single();

    if (existingMember)
        return { error: "You are already a member of this study group", data: group };

    // 3. Add to members
    const { error: joinError } = await supabase
        .from("study_group_members")
        .insert([{ group_id: group.id, user_id: user.id, role: "member" }]);

    if (joinError) return { error: joinError.message };

    return { data: group, success: true };
}

export async function joinPublicGroup(groupId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "User not authenticated" };

    // Check if member
    const { data: existingMember } = await supabase
        .from("study_group_members")
        .select("group_id")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .single();

    if (existingMember) return { data: { id: groupId } };

    const { error } = await supabase
        .from("study_group_members")
        .insert([{ group_id: groupId, user_id: user.id, role: "member" }]);

    if (error) return { error: error.message };
    return { data: { id: groupId } };
}

export async function sendGroupMessage(groupId: string, content: string, attachmentType: string | null = null, attachmentId: string | null = null) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "User not authenticated" };

    const { data, error } = await supabase
        .from("study_group_messages")
        .insert([{
            group_id: groupId,
            user_id: user.id,
            content,
            attachment_type: attachmentType,
            attachment_id: attachmentId
        }])
        .select()
        .single();

    if (error) return { error: error.message };
    return { data };
}

export async function deleteStudyGroup(groupId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "User not authenticated" };

    // Delete group
    const { error } = await supabase
        .from("study_groups")
        .delete()
        .eq("id", groupId)
        .eq("owner_id", user.id);

    if (error) return { error: error.message };
    return { success: true };
}

export async function getNoteContent(noteId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "User not authenticated" };

    const { data, error } = await supabase
        .from("notes")
        .select("id, title, content_markdown, created_at, profiles:user_id(full_name)")
        .eq("id", noteId)
        .single();

    if (error) return { error: error.message };
    return { data };
}
