import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    "https://umqsgpxjgejbfbvgurvw.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtcXNncHhqZ2VqYmZidmd1cnZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4OTk5MDUsImV4cCI6MjA4NzQ3NTkwNX0.QMbjsxs3avXs9w9fptvAxVBRKYIV-7dUc3pNkDCXWd8",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
