import React from "react";
import {
  Compass,
  CalendarDays,
  LayoutDashboard,
  BrainCircuit,
  BookOpenText,
  Users,
  Settings,
  Sparkles,
  Calendar,
  BookOpen,
  FileText,
  Target,
  ArrowRight,
  ChevronRight,
  Camera,
  Plus,
} from "lucide-react";

const Solutions = () => {
  return (
    <section className=" py-24 relative overflow-hidden font-sans">
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="px-5 py-2 bg-white rounded-full border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-sm font-medium text-gray-600 mb-8 inline-flex items-center">
            Solutions
          </div>
          <h2 className="text-[40px] md:text-[52px] font-medium leading-[1.1] tracking-tight text-[#1a1c20] max-w-2xl">
            Everything you need to
            <br />
            learn smarter
          </h2>
          <p className="mt-4 text-[16px] text-gray-400 max-w-md">
            One platform that combines AI, scheduling, notes, and collaboration
            — built for modern learners.
          </p>
        </div>

        {/* ── Dashboard Mockup ─────────────────────────────────────────── */}
        <div className="relative mx-auto max-w-[1060px]">
          {/* Browser chrome bar */}
          <div className="bg-[#f0f1f3] rounded-t-[18px] px-4 py-3 flex items-center gap-3 border border-gray-200 border-b-0">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white rounded-md px-3 py-1 text-[11px] text-gray-400 border border-gray-200 max-w-[280px] mx-auto text-center">
                Senai.app/dashboard
              </div>
            </div>
          </div>

          {/* Dashboard Shell */}
          <div
            className="bg-[#f8f9fb] rounded-b-[18px] border border-gray-200 overflow-hidden"
            style={{ height: 580 }}
          >
            <div className="flex h-full">
              {/* ── Sidebar ───────────────────────────────────────────── */}
              <aside className="hidden md:flex w-[220px] bg-white border-r border-gray-200/60 flex-col h-full shrink-0">
                {/* Logo */}
                <div className="px-6 pt-5 pb-4">
                  <span
                    className="text-[22px] font-bold tracking-tight text-[#1a1c20]"
                    style={{ fontFamily: "serif" }}
                  >
                    Senai
                  </span>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 space-y-0.5 overflow-hidden">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-3">
                    Main Menu
                  </p>
                  {[
                    { name: "Overview", icon: Compass, active: true },
                    { name: "Smart Scheduler", icon: CalendarDays },
                    { name: "AI Workspace", icon: BrainCircuit },
                    { name: "Project Boards", icon: LayoutDashboard },
                    { name: "Study Guide", icon: BookOpenText },
                    { name: "Study Group", icon: Users },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.name}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium cursor-default ${
                          item.active
                            ? " text-[#1a1c20] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] font-bold"
                            : "text-gray-400"
                        }`}
                      >
                        <Icon
                          size={14}
                          className={
                            item.active ? "text-brand-500" : "text-gray-300"
                          }
                          strokeWidth={item.active ? 2.5 : 2}
                        />
                        {item.name}
                      </div>
                    );
                  })}
                </nav>

                {/* Bottom */}
                <div className="px-3 py-4 border-t border-gray-100/60">
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium text-gray-400 cursor-default">
                    <Settings size={14} className="text-gray-300" />
                    Settings
                  </div>
                </div>
              </aside>

              {/* ── Main Content ──────────────────────────────────────── */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Inner scroll area */}
                <div className="flex-1 overflow-hidden px-4 md:px-7 py-5 md:py-6 space-y-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className="md:hidden mt-1 text-gray-400">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                      </div>
                      <div>
                        <p className="text-[9px] md:text-[10px] font-semibold text-gray-400 tracking-wide mb-0.5">
                          Thursday, March 6, 2026
                        </p>
                        <h1 className="text-[18px] md:text-[22px] font-black text-gray-900 leading-tight">
                          Good morning,{" "}
                          <span className="bg-gradient-to-r from-gray-900 to-gray-400 bg-clip-text text-transparent">
                            Alex
                          </span>
                        </h1>
                        <p className="text-[10px] md:text-[11px] text-gray-400 mt-0.5">
                          You have 3 events scheduled today.
                        </p>
                      </div>
                    </div>

                    {/* Quick links */}
                    <div className="flex gap-1.5 flex-wrap justify-end max-w-[260px]">
                      {[
                        { label: "New Note", icon: BookOpen },
                        { label: "Schedule", icon: Calendar },
                        { label: "AI Chat", icon: BrainCircuit },
                      ].map(({ label, icon: Icon }) => (
                        <span
                          key={label}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold text-gray-500 bg-white border border-gray-200 shadow-sm"
                        >
                          <Icon size={10} className="text-gray-400" />
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-gray-100" />

                  {/* Stats row */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 flex-wrap">
                    {[
                      {
                        label: "Smart Notes",
                        value: "14",
                        sub: "Total notes created",
                        icon: FileText,
                      },
                      {
                        label: "Study Sets",
                        value: "6",
                        sub: "Flashcards & quizzes",
                        icon: Target,
                      },
                      {
                        label: "Today's Events",
                        value: "3",
                        sub: "Scheduled for today",
                        icon: Calendar,
                      },
                    ].map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={stat.label}
                          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-7 h-7 rounded-xl bg-gray-100 flex items-center justify-center">
                              <Icon size={13} className="text-gray-500" />
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                              {stat.label}
                            </span>
                          </div>
                          <div className="text-[28px] font-black text-gray-900 leading-none mb-0.5">
                            {stat.value}
                          </div>
                          <p className="text-[10px] text-gray-400 mb-3">
                            {stat.sub}
                          </p>
                          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gray-300 rounded-full"
                              style={{ width: "60%" }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Main panels */}
                  <div
                    className="grid grid-cols-1 md:grid-cols-5 gap-4"
                    style={{ height: "auto", minHeight: 200 }}
                  >
                    {/* Today's Schedule */}
                    <div className="md:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
                      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Calendar size={11} className="text-gray-500" />
                          </div>
                          <h3 className="text-[12px] font-bold text-gray-800">
                            Today&apos;s Schedule
                          </h3>
                        </div>
                        <span className="flex items-center gap-0.5 text-[10px] font-semibold text-gray-400">
                          View all <ArrowRight size={10} />
                        </span>
                      </div>
                      <div className="px-5 py-3 space-y-2 flex-1">
                        {[
                          {
                            time: "09:00",
                            period: "AM",
                            title: "Calculus Study Session",
                            type: "study",
                          },
                          {
                            time: "11:30",
                            period: "AM",
                            title: "Group Project Meeting",
                            type: "meeting",
                          },
                          {
                            time: "02:00",
                            period: "PM",
                            title: "Physics Review",
                            type: "study",
                          },
                        ].map((ev, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="min-w-[36px] text-right shrink-0">
                              <p className="text-[10px] font-bold text-gray-500">
                                {ev.time}
                              </p>
                              <p className="text-[8px] text-gray-300">
                                {ev.period}
                              </p>
                            </div>
                            <div className="flex flex-col items-center mt-1 gap-0.5">
                              <div className="w-2 h-2 rounded-full border-2 border-gray-300 bg-white shrink-0" />
                              {i < 2 && (
                                <div className="w-px flex-1 bg-gray-100 min-h-[10px]" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-[11px] font-semibold text-gray-800">
                                {ev.title}
                              </h4>
                              <span className="text-[9px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full capitalize">
                                {ev.type}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Notes + Boards stacked */}
                    <div className="md:col-span-2 flex flex-col gap-3">
                      {/* Recent Notes */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden flex-1">
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-lg bg-gray-100 flex items-center justify-center">
                              <BookOpen size={10} className="text-gray-500" />
                            </div>
                            <h3 className="text-[11px] font-bold text-gray-800">
                              Recent Notes
                            </h3>
                          </div>
                          <span className="text-[9px] font-semibold text-gray-400 flex items-center gap-0.5">
                            All <ChevronRight size={9} />
                          </span>
                        </div>
                        <div className="px-4 py-2 space-y-1">
                          {[
                            "Introduction to Calculus",
                            "Photosynthesis Notes",
                            "History: WW2 Summary",
                          ].map((note) => (
                            <div
                              key={note}
                              className="flex items-center gap-2 py-1"
                            >
                              <div className="w-5 h-5 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                <FileText size={9} className="text-gray-400" />
                              </div>
                              <span className="text-[10px] font-semibold text-gray-600 truncate">
                                {note}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Project Boards */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden flex-1">
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-lg bg-gray-100 flex items-center justify-center">
                              <LayoutDashboard
                                size={10}
                                className="text-gray-500"
                              />
                            </div>
                            <h3 className="text-[11px] font-bold text-gray-800">
                              Project Boards
                            </h3>
                          </div>
                          <span className="text-[9px] font-semibold text-gray-400 flex items-center gap-0.5">
                            All <ChevronRight size={9} />
                          </span>
                        </div>
                        <div className="px-4 py-2 space-y-1">
                          {["Final Year Thesis", "Science Fair Project"].map(
                            (board) => (
                              <div
                                key={board}
                                className="flex items-center gap-2 py-1"
                              >
                                <div className="w-5 h-5 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                  <LayoutDashboard
                                    size={9}
                                    className="text-gray-400"
                                  />
                                </div>
                                <span className="text-[10px] font-semibold text-gray-600 truncate">
                                  {board}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI CTA Banner */}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom fade gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fbfcff] to-transparent pointer-events-none rounded-b-[18px]" />
        </div>
      </div>
    </section>
  );
};

export default Solutions;
