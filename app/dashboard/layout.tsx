import Sidebar from "./components/Sidebar";
import DashboardHeader from "./components/DashboardHeader";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userFullName = "";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    if (profile) {
      userFullName = profile.full_name;
    } else {
      userFullName = user.user_metadata?.full_name || "Student";
    }
  }

  return (
    <div className="flex h-screen bg-[#fbfcff] overflow-hidden selection:bg-orange-200">
      {/* 1. Sidebar (Fixed to left on desktop) */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Background ambient light */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#38bcfc] rounded-full blur-[140px] opacity-[0.05] pointer-events-none z-0"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#fca03e] rounded-full blur-[140px] opacity-[0.05] pointer-events-none z-0"></div>

        {/* 2a. Header */}
        <DashboardHeader userFullName={userFullName} />

        {/* 2b. Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto w-full z-10 p-6 md:p-10 custom-scrollbar">
          <div className="max-w-[1200px] mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
