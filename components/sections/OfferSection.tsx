"use client";

import React from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Search,
  BrainCircuit,
  CalendarDays,
  LayoutDashboard,
  BookOpenText,
  Users,
  MapPin,
  Clock,
  Zap,
  Crown,
  Flame,
  Check,
  ChevronRight,
} from "lucide-react";

export default function OfferSection() {
  return (
    <section className="bg-[#fbfcff] py-24 relative font-sans">
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="px-5 py-2 bg-white rounded-full border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-sm font-medium text-gray-600 mb-8 inline-flex items-center">
            Features
          </div>
          <h2 className="text-[40px] md:text-[50px] font-medium leading-[1.1] tracking-tight text-[#1a1c20] max-w-2xl mb-4">
            Everything in one workspace
          </h2>
          <p className="text-[17px] text-gray-500 max-w-lg mx-auto">
            Forget switching between scattered apps. Edunai integrates your
            entire academic life seamlessly.
          </p>
        </div>

        {/* ── Grid ────────────────────────────────────────────────────── */}
        {/*
          Row 1 (top): Project Boards (5) | Smart Scheduler (7)
          Row 2 (mid): AI Workspace (8) | AI Study Assistant (4)
          Row 3 (bot): Study Guide (6) | Study Group (6)
        */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-[1100px] mx-auto">
          {/* ═══ 1. Project Boards (col-span-5) ══════════════════════════ */}
          <div className="md:col-span-5 bg-white rounded-[32px] border border-gray-100 p-8 pt-10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col items-center text-center hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] transition-all">
            {/* Mini Kanban board */}
            <div className="relative w-full h-[220px] mb-8 flex gap-2.5 items-start px-2">
              {[
                {
                  label: "To Do",
                  color: "bg-gray-100 text-gray-500",
                  cards: ["Research topic", "Outline draft"],
                  dot: "bg-gray-400",
                },
                {
                  label: "In Progress",
                  color: "bg-amber-100 text-amber-600",
                  cards: ["Write intro", "Add charts"],
                  dot: "bg-amber-400",
                },
                {
                  label: "Done",
                  color: "bg-green-100 text-green-700",
                  cards: ["Setup repo"],
                  dot: "bg-green-500",
                },
              ].map((col) => (
                <div key={col.label} className="flex-1 flex flex-col gap-2">
                  <div
                    className={`rounded-full px-2 py-0.5 text-[9px] font-black inline-flex items-center gap-1 self-start ${col.color}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                    {col.label}
                  </div>
                  {col.cards.map((card) => (
                    <div
                      key={card}
                      className="bg-white rounded-xl px-3 py-2.5 shadow-sm border border-gray-100 text-left"
                    >
                      {col.label === "Done" && (
                        <Check size={9} className="text-green-500 mb-1" />
                      )}
                      <p className="text-[10px] font-semibold text-gray-600 leading-tight">
                        {card}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
              {/* Board members */}
              <div className="absolute -bottom-2 left-2 bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] p-3 flex items-center gap-2 border border-gray-100">
                <div className="flex -space-x-1.5">
                  {["bg-blue-200", "bg-purple-200", "bg-green-200"].map(
                    (c, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full border-2 border-white ${c}`}
                      />
                    ),
                  )}
                </div>
                <span className="text-[10px] font-semibold text-gray-600">
                  +3 members
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center">
                <LayoutDashboard size={14} className="text-amber-600" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600">
                Project Boards
              </span>
            </div>
            <h3 className="text-[22px] font-bold text-gray-900 mb-3">
              Trello-style Collaboration
            </h3>
            <p className="text-[15px] text-gray-500 leading-relaxed max-w-[280px]">
              Manage group projects with drag-and-drop Kanban boards. Assign
              tasks and track progress in real-time.
            </p>
          </div>

          {/* ═══ 2. Smart Scheduler (col-span-7) ═════════════════════════ */}
          <div className="md:col-span-7 bg-white rounded-[32px] border border-gray-100 py-8 px-10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col items-center text-center hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] transition-all">
            {/* Mini calendar + events */}
            <div className="relative w-full h-[220px] mb-8 flex items-start justify-center gap-4">
              {/* Calendar */}
              <div className="w-[130px] bg-white border border-gray-100 rounded-2xl shadow-sm p-3 shrink-0">
                <div className="flex items-center gap-1 mb-2">
                  <CalendarDays size={9} className="text-indigo-400" />
                  <span className="text-[8px] font-bold text-indigo-400">
                    March 2026
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <div
                      key={i}
                      className="text-[6px] text-gray-300 text-center font-bold"
                    >
                      {d}
                    </div>
                  ))}
                  {Array.from({ length: 28 }, (_, i) => (
                    <div
                      key={i}
                      className={`text-[7px] text-center rounded py-0.5 font-medium ${
                        i + 1 === 6
                          ? "bg-indigo-500 text-white rounded-full"
                          : i + 1 === 12 || i + 1 === 18
                            ? "bg-indigo-100 text-indigo-600"
                            : "text-gray-400"
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* Event list */}
              <div className="flex-1 space-y-2.5 pt-1">
                {[
                  {
                    time: "09:00",
                    title: "Calculus Study",
                    tag: "study",
                    color: "bg-indigo-500",
                  },
                  {
                    time: "11:30",
                    title: "Group Meeting",
                    tag: "meeting",
                    color: "bg-purple-400",
                  },
                  {
                    time: "14:00",
                    title: "Physics Review",
                    tag: "study",
                    color: "bg-sky-400",
                  },
                  {
                    time: "16:00",
                    title: "Submit Assignment",
                    tag: "deadline",
                    color: "bg-rose-400",
                  },
                ].map((ev) => (
                  <div
                    key={ev.title}
                    className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm flex items-center gap-2.5"
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${ev.color} shrink-0`}
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[10px] font-bold text-gray-700 truncate">
                        {ev.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Clock size={8} className="text-gray-300" />
                      <span className="text-[8px] text-gray-400">
                        {ev.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center">
                <CalendarDays size={14} className="text-indigo-600" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
                Smart Scheduler
              </span>
            </div>
            <h3 className="text-[22px] font-bold text-gray-900 mb-3">
              Planning Kegiatan
            </h3>
            <p className="text-[15px] text-gray-500 leading-relaxed max-w-[320px]">
              Optimize your academic time with integrated smart schedules,
              assignment trackers, and AI-powered reminders.
            </p>
          </div>

          {/* ═══ 3. AI Workspace (col-span-8) ════════════════════════════ */}
          <div className="md:col-span-8 bg-white rounded-[32px] border border-gray-100 py-10 px-12 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden relative group hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] transition-all">
            {/* Left text */}
            <div className="absolute top-12 left-12 w-[240px] z-20">
              <div className="w-10 h-10 bg-sky-50 rounded-xl mb-5 flex items-center justify-center border border-sky-100 shadow-sm text-sky-500">
                <BrainCircuit size={20} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-sky-500 mb-3 block">
                AI Workspace
              </span>
              <h3 className="text-[22px] font-bold text-gray-900 mb-3 leading-tight">
                Notes, Flashcards
                <br />& AI in One Place
              </h3>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                Snap a photo of the whiteboard. Let AI instantly convert it into
                editable notes, flashcards, and study guides.
              </p>
            </div>

            {/* Right graphic */}
            <div className="ml-[220px] h-[300px] relative w-[130%]">
              <div className="absolute top-0 left-10 w-full h-[320px] bg-gray-50 rounded-tl-3xl border-t border-l border-gray-200 overflow-hidden p-6 pl-10">
                <div className="flex gap-4 mb-6">
                  <div className="w-32 h-3 bg-gray-200 rounded-full" />
                  <div className="w-48 h-3 bg-gray-200 rounded-full" />
                </div>
                <div className="flex gap-6 relative">
                  <div className="w-[180px] h-[140px] bg-sky-100/50 rounded-xl border border-sky-200 p-2 relative shadow-inner">
                    <div className="w-full h-full bg-sky-300/30 rounded-lg flex items-center justify-center border-dashed border-2 border-sky-400/50">
                      <FileText className="text-sky-500/50" />
                    </div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-sky-500 rounded-t blur-[2px] animate-pulse" />
                  </div>
                  <div className="w-12 h-[140px] flex items-center justify-center">
                    <ArrowRight className="text-sky-400" />
                  </div>
                  <div className="w-[200px] h-[190px] bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <div className="w-20 h-2 bg-gray-200 rounded-full" />
                    </div>
                    <div className="space-y-1.5 mb-3">
                      <div className="w-full h-1.5 bg-gray-100 rounded-full" />
                      <div className="w-5/6 h-1.5 bg-gray-100 rounded-full" />
                      <div className="w-4/6 h-1.5 bg-gray-100 rounded-full" />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {["Derivatives", "Limits", "Integration"].map((t) => (
                        <span
                          key={t}
                          className="text-[8px] bg-sky-100 text-sky-600 px-1.5 py-0.5 rounded-full font-semibold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="w-full mt-3 p-2 bg-sky-50 rounded text-[9px] text-sky-600 font-medium">
                      Saved to your &apos;Physics&apos; board
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ 4. AI Study Assistant (col-span-4) ══════════════════════ */}
          <div className="md:col-span-4 bg-white rounded-[32px] border border-gray-100 p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border-dashed border-2 flex flex-col items-center hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] transition-all">
            <div className="relative w-full h-[180px] mb-8 mt-4 flex items-center justify-center">
              <div className="absolute -left-2 top-0 w-28 h-28 bg-white border border-gray-100 rounded-2xl p-2 rotate-[-6deg] shadow-sm z-0 overflow-hidden">
                <div className="text-[10px] font-medium text-gray-500 bg-white inline-block px-1">
                  Flashcards
                </div>
                <div className="mt-2 space-y-1.5">
                  <div className="w-full h-1.5 bg-gray-100 rounded-full" />
                  <div className="w-4/5 h-1.5 bg-gray-100 rounded-full" />
                </div>
              </div>
              <div className="absolute right-0 bottom-4 w-28 h-[100px] bg-white border border-gray-100 rounded-2xl rotate-[8deg] shadow-sm z-0 p-3 pt-6">
                <div className="text-[9px] font-bold text-gray-400 absolute top-2 right-3">
                  Quiz Mode
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full mb-2 mt-2" />
                <div className="w-3/4 h-1.5 bg-gray-100 rounded-full mb-4" />
                <div className="flex gap-1 justify-end">
                  <div className="w-3 h-3 rounded bg-green-200" />
                </div>
              </div>
              <div className="absolute w-[100px] h-[100px] bg-[#ffdb58] rounded-[24px] shadow-[0_20px_40px_-5px_rgba(255,219,88,0.4)] z-20 flex flex-col items-center justify-center rotate-3 border-2 border-white">
                <div className="bg-white/90 px-3 py-1 rounded-full text-[14px] font-black tracking-tight text-gray-800 mb-2">
                  + 12 pts
                </div>
                <div className="flex gap-2 text-gray-800 bg-white/50 px-2 py-0.5 rounded-full">
                  <BrainCircuit size={12} strokeWidth={2.5} />
                  <CheckCircle2
                    size={12}
                    strokeWidth={2.5}
                    className="text-[#1da144]"
                  />
                </div>
              </div>
            </div>
            <div className="text-center mt-auto">
              <h3 className="text-[20px] font-bold text-gray-900 mb-2">
                AI Study Assistant
              </h3>
              <p className="text-[14px] text-gray-500 leading-relaxed max-w-[200px] mx-auto">
                Generate quizzes & flashcards instantly to supercharge your
                prep.
              </p>
            </div>
          </div>

          {/* ═══ 5. Study Guide (col-span-6) — NEW ═══════════════════════ */}
          <div className="md:col-span-6 bg-white rounded-[32px] border border-gray-100 p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] transition-all">
            {/* Preview: roadmap cards */}
            <div className="w-full mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-[10px] font-bold mb-4">
                <MapPin size={10} /> Learning Roadmap
              </div>
              <div className="space-y-2.5">
                {[
                  {
                    emoji: "📐",
                    title: "Linear Algebra",
                    progress: 72,
                    units: "18/25",
                    color: "bg-violet-500",
                    badge: "Mata Kuliah",
                    badgeColor: "bg-blue-50 text-blue-600",
                  },
                  {
                    emoji: "🧬",
                    title: "Molecular Biology",
                    progress: 40,
                    units: "8/20",
                    color: "bg-purple-400",
                    badge: "Topik",
                    badgeColor: "bg-purple-50 text-purple-600",
                  },
                  {
                    emoji: "🌐",
                    title: "Web Development",
                    progress: 90,
                    units: "27/30",
                    color: "bg-green-500",
                    badge: "Mata Kuliah",
                    badgeColor: "bg-blue-50 text-blue-600",
                  },
                ].map((r) => (
                  <div
                    key={r.title}
                    className="bg-[#fbfcff] rounded-2xl border border-gray-100 p-3.5 flex items-center gap-3"
                  >
                    <span className="text-[24px] shrink-0">{r.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-[13px] font-bold text-gray-800 truncate">
                          {r.title}
                        </h4>
                        <div className="flex items-center gap-2 ml-2 shrink-0">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${r.badgeColor}`}
                          >
                            {r.badge}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">
                            {r.units} unit
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${r.color}`}
                          style={{ width: `${r.progress}%` }}
                        />
                      </div>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-gray-300 shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center">
                <BookOpenText size={14} className="text-violet-600" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600">
                Study Guide
              </span>
            </div>
            <h3 className="text-[22px] font-bold text-gray-900 mb-2">
              AI Learning Roadmaps
            </h3>
            <p className="text-[15px] text-gray-500 leading-relaxed">
              Generate structured learning paths from any topic or your own
              notes. Track progress unit by unit and master subjects
              step-by-step.
            </p>
          </div>

          {/* ═══ 6. Study Group (col-span-6) — NEW ═══════════════════════ */}
          <div className="md:col-span-6 bg-white rounded-[32px] border border-gray-100 p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] transition-all">
            {/* Preview: live sessions + leaderboard */}
            <div className="w-full mb-8 flex gap-3">
              {/* Live sessions */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">
                    Live Sessions
                  </span>
                </div>
                {[
                  {
                    title: "Advanced React Patterns",
                    subject: "Software Eng.",
                    color: "from-blue-500 to-indigo-500",
                    count: 12,
                  },
                  {
                    title: "Calculus III: Integrals",
                    subject: "Mathematics",
                    color: "from-purple-500 to-pink-500",
                    count: 8,
                  },
                  {
                    title: "Macroeconomics Study",
                    subject: "Economics",
                    color: "from-emerald-400 to-teal-500",
                    count: 24,
                  },
                ].map((s) => (
                  <div
                    key={s.title}
                    className="bg-[#fbfcff] border border-gray-100 rounded-xl p-3 flex items-center gap-2.5"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0`}
                    >
                      <Zap size={12} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-gray-800 truncate">
                        {s.title}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Users size={8} className="text-gray-400" />
                        <span className="text-[9px] text-gray-400">
                          {s.count} joined
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Leaderboard */}
              <div className="w-[130px] shrink-0 bg-[#fbfcff] border border-gray-100 rounded-2xl p-3">
                <div className="flex items-center gap-1 mb-3">
                  <Crown size={11} className="text-amber-500" />
                  <span className="text-[10px] font-bold text-gray-700">
                    Top Scholars
                  </span>
                </div>
                {[
                  { initial: "J", name: "Jessica T.", pts: "2,450", rank: 1 },
                  { initial: "M", name: "Michael R.", pts: "2,120", rank: 2 },
                  { initial: "B", name: "Budi S.", pts: "1,850", rank: 3 },
                  { initial: "A", name: "Amanda W.", pts: "1,640", rank: 4 },
                ].map((l) => (
                  <div
                    key={l.name}
                    className="flex items-center gap-1.5 py-1.5 border-b border-gray-50 last:border-0"
                  >
                    <span
                      className={`text-[9px] font-black w-4 shrink-0 ${l.rank === 1 ? "text-amber-500" : "text-gray-300"}`}
                    >
                      #{l.rank}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 border border-white flex items-center justify-center text-[9px] font-black text-indigo-600 shrink-0">
                      {l.initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-gray-700 truncate">
                        {l.name}
                      </p>
                      <div className="flex items-center gap-0.5">
                        <Flame size={8} className="text-orange-400" />
                        <span className="text-[8px] text-gray-400">
                          {l.pts} pt
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Users size={14} className="text-emerald-600" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                Study Group
              </span>
            </div>
            <h3 className="text-[22px] font-bold text-gray-900 mb-2">
              Learn Together in Real-Time
            </h3>
            <p className="text-[15px] text-gray-500 leading-relaxed">
              Join live study sessions, collaborate with peers, share resources,
              and compete on the leaderboard. Learning is more fun together.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
