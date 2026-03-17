import Sidebar from "./components/Sidebar";
import DashboardHeader from "./components/DashboardHeader";
import { createClient } from "@/utils/supabase/server";
import { FocusModeProvider } from "@/components/ui/FocusModeContext";
import FocusModeWrapper from "./components/FocusModeWrapper";
import { TutorialProvider } from "@/components/ui/TutorialContext";
import TutorialHighlight from "@/components/ui/TutorialHighlight";
import { ThemeProvider } from "@/components/ui/ThemeContext";
import { MobileMenuProvider } from "@/components/ui/MobileMenuContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Use auth metadata directly — avoids an extra DB query on every navigation
  const userFullName = user?.user_metadata?.full_name || "Student";

  return (
    <ThemeProvider>
      <MobileMenuProvider>
        <FocusModeProvider>
          <TutorialProvider>
        <div className="flex h-screen bg-dash-bg overflow-hidden selection:bg-dash-primary/20">
          {/* 1. Sidebar */}
          <Sidebar />

          {/* 2. Main Content Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Background ambient light */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#38bcfc] rounded-full blur-[140px] opacity-[0.05] pointer-events-none z-0"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-dash-primary rounded-full blur-[140px] opacity-[0.05] pointer-events-none z-0"></div>

            {/* 2a. Header */}
            <DashboardHeader userFullName={userFullName} />

            {/* 2b. Scrollable Page Content */}
            <main className="flex-1 overflow-y-auto w-full z-10 p-6 md:p-10 custom-scrollbar">
              <div className="max-w-[1200px] mx-auto w-full">{children}</div>
            </main>
          </div>

          {/* Focus Mode: Pomodoro timer & overlay */}
          <FocusModeWrapper />

          {/* Tutorial Highlight Overlay */}
            <TutorialHighlight />
          </div>
        </TutorialProvider>
      </FocusModeProvider>
    </MobileMenuProvider>
  </ThemeProvider>
);
}
