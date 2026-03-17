import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    "https://umqsgpxjgejbfbvgurvw.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtcXNncHhqZ2VqYmZidmd1cnZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4OTk5MDUsImV4cCI6MjA4NzQ3NTkwNX0.QMbjsxs3avXs9w9fptvAxVBRKYIV-7dUc3pNkDCXWd8",
  );
}
