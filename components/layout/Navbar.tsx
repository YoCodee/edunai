import { createClient } from "@/utils/supabase/server";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const supabase = await createClient();

  // Mengambil session dan profil langsung di server
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let initialUser = null;

  if (session?.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", session.user.id)
      .single();

    initialUser = { ...session.user, ...(profile || {}) };
  }

  // Lempar initialUser ke NavbarClient agar di-render SEKETIKA tanpa loading spinner!
  return <NavbarClient initialUser={initialUser} />;
}
