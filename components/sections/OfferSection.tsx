"use client";

import React, { useRef } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
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
  ImageIcon,
} from "lucide-react";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function OfferSection() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // General fade-in for section elements
      gsap.from(".offer-header > *", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".offer-header",
          start: "top 80%",
        },
      });

      gsap.from(".offer-panel", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".offer-grid",
          start: "top 75%",
        },
      });

      // 1. Kanban Animation (Continuous Loop)
      const kanbanTl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      kanbanTl
        .to(".kanban-moving-card", {
          y: 45, // Move down into Done area
          x: 2, // Slight wiggle
          duration: 1,
          ease: "back.inOut(1.2)",
        })
        .to(".kanban-moving-card", {
          backgroundColor: "#dcfce7", // Green bg
          borderColor: "#86efac",
          duration: 0.3,
        })
        .to(
          ".kanban-moving-check",
          { opacity: 1, scale: 1, duration: 0.3 },
          "<",
        )
        .to({}, { duration: 1.5 }) // Hold
        .to(".kanban-moving-card", {
          opacity: 0,
          scale: 0.8,
          duration: 0.4,
        })
        .set(".kanban-moving-card", {
          y: 0,
          x: 0,
          backgroundColor: "#ffffff",
          borderColor: "#f3f4f6",
        })
        .set(".kanban-moving-check", { opacity: 0, scale: 0 })
        .to(".kanban-moving-card", { opacity: 1, scale: 1, duration: 0.4 });

      // 2. Scheduler Animation (Events popping sequentially)
      gsap.fromTo(
        ".scheduler-event",
        { opacity: 0.3, scale: 0.95, x: 10 },
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.4,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut",
        },
      );

      // 3. AI Workspace Scanner Loop
      const scannerTl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
      scannerTl
        .fromTo(
          ".ai-scanner-line",
          { top: "-10%", opacity: 0 },
          { top: "110%", opacity: 1, duration: 1.5, ease: "linear" },
        )
        .to(".ai-scanner-line", { opacity: 0, duration: 0.2 })
        .fromTo(
          ".ai-output-data",
          { opacity: 0, y: 10, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1 },
          "-=0.5",
        )
        .to(".ai-output-data", { opacity: 0, duration: 0.5, delay: 1.5 });

      // 4. Flashcard Flip & Points Burst
      const cardTl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
      cardTl
        .to(".flashcard-inner", {
          rotateY: 180,
          duration: 0.8,
          ease: "power3.inOut",
        })
        .to(
          ".flashcard-points",
          {
            scale: 1.2,
            y: -15,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(2)",
          },
          "-=0.2",
        )
        .to(".flashcard-points", { scale: 1, duration: 0.2 })
        .to({}, { duration: 1 }) // Read time
        .to(".flashcard-inner", {
          rotateY: 0,
          duration: 0.8,
          ease: "power3.inOut",
        })
        .to(
          ".flashcard-points",
          { y: 0, opacity: 0, scale: 0.5, duration: 0.3 },
          "<",
        );

      // 5. Study Guide Roadmap Progress
      gsap.fromTo(
        ".roadmap-progress",
        { width: "0%" },
        {
          width: (i, target) => target.dataset.width + "%",
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".offer-panel-roadmap",
            start: "top 80%",
          },
        },
      );

      // 6. Leaderboard Flame Pulse
      gsap.to(".leaderboard-flame", {
        scale: 1.3,
        opacity: 0.8,
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className=" py-24 relative font-sans overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="offer-header flex flex-col items-center text-center mb-16">
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
        <div className="offer-grid grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-[1100px] mx-auto">
          {/* ═══ 1. Project Boards (col-span-5) ══════════════════════════ */}
          <div className="offer-panel md:col-span-5 bg-white rounded-[32px] border border-gray-100 p-8 pt-10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col items-center text-center">
            {/* Animating Kanban board preview */}
            <div className="relative w-full h-[220px] mb-8 flex gap-2.5 items-start px-2">
              <div className="flex-1 flex flex-col gap-2">
                <div className="rounded-full px-2 py-0.5 text-[9px] font-black inline-flex items-center gap-1 self-start bg-gray-100 text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  To Do
                </div>
                <div className="bg-white rounded-xl px-3 py-2.5 shadow-sm border border-gray-100 text-left">
                  <p className="text-[10px] font-semibold text-gray-600 leading-tight">
                    Research topic
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-2 relative z-10">
                <div className="rounded-full px-2 py-0.5 text-[9px] font-black inline-flex items-center gap-1 self-start bg-amber-100 text-amber-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  In Progress
                </div>
                {/* Moving Card */}
                <div className="kanban-moving-card bg-white rounded-xl px-3 py-2.5 shadow-md border border-gray-100 text-left relative">
                  <Check
                    size={12}
                    className="kanban-moving-check text-green-600 opacity-0 scale-0 absolute right-2 top-2"
                  />
                  <p className="text-[10px] font-semibold text-gray-600 leading-tight">
                    Write intro
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <div className="rounded-full px-2 py-0.5 text-[9px] font-black inline-flex items-center gap-1 self-start bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Done
                </div>
                <div className="bg-white rounded-xl px-3 py-2.5 shadow-sm border border-gray-100 text-left">
                  <Check size={9} className="text-green-500 mb-1" />
                  <p className="text-[10px] font-semibold text-gray-600 leading-tight">
                    Setup repo
                  </p>
                </div>
              </div>

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
                  +3
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2 mt-auto">
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
              Manage group projects with drag-and-drop Kanban boards. See
              animated real-time updates instantly.
            </p>
          </div>

          {/* ═══ 2. Smart Scheduler (col-span-7) ═════════════════════════ */}
          <div className="offer-panel md:col-span-7 bg-white rounded-[32px] border border-gray-100 py-8 px-10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col items-center justify-between text-center">
            {/* Animating calendar + events */}
            <div className="relative w-full h-[220px] mb-8 flex items-start justify-center gap-4 pt-2">
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
                      className={`text-[7px] text-center py-0.5 font-medium ${
                        i + 1 === 15
                          ? "bg-indigo-500 text-white rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                          : "text-gray-400"
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 space-y-2.5">
                {[
                  {
                    time: "09:00",
                    title: "Calculus Study Group",
                    color: "bg-indigo-500",
                  },
                  {
                    time: "11:30",
                    title: "Project Board Meeting",
                    color: "bg-purple-400",
                  },
                  {
                    time: "14:00",
                    title: "Review AI Summary",
                    color: "bg-sky-400",
                  },
                  {
                    time: "16:00",
                    title: "Submit Assignment",
                    color: "bg-rose-400",
                  },
                ].map((ev) => (
                  <div
                    key={ev.title}
                    className="scheduler-event bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm flex items-center gap-2.5 relative overflow-hidden"
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${ev.color} shrink-0`}
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[10.5px] font-bold text-gray-700 truncate">
                        {ev.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Clock size={8} className="text-gray-300" />
                      <span className="text-[8px] font-medium text-gray-400">
                        {ev.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
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
              <p className="text-[15px] text-gray-500 leading-relaxed max-w-[320px] mx-auto">
                Optimize your academic time with integrated schedules, smart
                alarms, and AI-powered reminders syncing to your calendar.
              </p>
            </div>
          </div>

          {/* ═══ 3. AI Workspace (col-span-8) ════════════════════════════ */}
          <div className="offer-panel md:col-span-8 bg-white rounded-[32px] border border-gray-100 py-10 px-12 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden relative">
            <div className="absolute top-12 left-12 w-[240px] z-20">
              <div className="w-10 h-10 bg-[#38bcfc]/10 rounded-xl mb-5 flex items-center justify-center shadow-sm text-[#38bcfc]">
                <BrainCircuit size={20} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#38bcfc] mb-3 block">
                AI Workspace
              </span>
              <h3 className="text-[22px] font-bold text-gray-900 mb-3 leading-tight">
                Instantly digitize <br /> whiteboard notes
              </h3>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                Snap a photo. Our "Vision AI" accurately scans handwritten text
                and formulas, turning them into editable notes and AI slide
                video generation seamlessly.
              </p>
            </div>

            {/* Animating Graphic */}
            <div className="ml-[220px] h-[300px] relative w-[130%]">
              <div className="absolute top-0 left-10 w-full h-[320px] bg-gray-50 rounded-tl-3xl border-t border-l border-gray-200 overflow-hidden p-6 pl-10">
                <div className="flex gap-6 relative mt-10">
                  {/* Photo Node */}
                  <div className="w-[180px] h-[140px] bg-white rounded-xl border-2 border-[#38bcfc]/30 shadow-sm relative overflow-hidden flex items-center justify-center">
                    <ImageIcon className="text-gray-300 opacity-50" size={32} />
                    <div className="absolute inset-0 bg-blue-50/50" />
                    {/* Fake text skeleton */}
                    <div className="absolute top-4 left-4 w-3/4 h-2 bg-gray-200 rounded" />
                    <div className="absolute top-8 left-4 w-1/2 h-2 bg-gray-200 rounded" />
                    {/* Laser Scanner */}
                    <div className="ai-scanner-line absolute left-0 w-full h-1 bg-[#38bcfc] shadow-[0_0_15px_rgba(56,188,252,0.8)] z-10" />
                  </div>

                  <div className="w-12 h-[140px] flex items-center justify-center">
                    <ArrowRight className="text-[#38bcfc] animate-pulse" />
                  </div>

                  {/* Output Node */}
                  <div className="w-[200px] h-[160px] bg-white rounded-xl shadow-md border border-gray-200 p-4 relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                      <div className="w-20 h-2 bg-gray-100 rounded-full" />
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="ai-output-data w-full h-[6px] bg-[#38bcfc]/20 rounded-full" />
                      <div className="ai-output-data w-5/6 h-[6px] bg-[#38bcfc]/20 rounded-full" />
                      <div className="ai-output-data w-4/6 h-[6px] bg-[#38bcfc]/20 rounded-full" />
                    </div>
                    <div className="ai-output-data w-full p-2 bg-blue-50 rounded text-[9px] text-blue-600 font-bold flex items-center gap-1">
                      <Zap size={10} /> Parsed & Read-to-Use
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ 4. AI Study Assistant (col-span-4) ══════════════════════ */}
          <div className="offer-panel md:col-span-4 bg-white rounded-[32px] border border-gray-100 p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border-dashed border-2 flex flex-col items-center">
            {/* Animating Flashcards */}
            <div className="relative w-full h-[180px] mb-8 mt-4 flex items-center justify-center perspective-[1000px]">
              {/* Back card (dummy) */}
              <div className="absolute left-4 top-2 w-32 h-28 bg-white border border-gray-100 rounded-2xl rotate-[-8deg] shadow-sm z-0" />

              {/* Flipping front card */}
              <div className="flashcard-inner w-36 h-32 relative transform-3d z-10">
                {/* Front Side */}
                <div className="absolute inset-0 bg-white border border-gray-200 rounded-2xl p-4 shadow-lg backface-hidden flex flex-col items-center justify-center">
                  <span className="text-[9px] font-bold text-[#38bcfc] uppercase mb-2">
                    Q:
                  </span>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mb-1" />
                  <div className="w-3/4 h-1.5 bg-gray-100 rounded-full" />
                </div>
                {/* Back Side */}
                <div className="absolute inset-0 bg-[#1a1c20] rounded-2xl p-4 shadow-lg backface-hidden transform-[rotateY(180deg)] flex flex-col items-center justify-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase mb-2">
                    A:
                  </span>
                  <div className="w-full h-1.5 bg-gray-700 rounded-full mb-1" />
                  <div className="w-1/2 h-1.5 bg-gray-700 rounded-full" />
                </div>
              </div>

              {/* Floating points coin */}
              <div className="flashcard-points opacity-0 absolute top-[-10px] right-2 w-[80px] h-[34px] bg-brand-500 rounded-xl shadow-[0_10px_20px_rgba(26,174,237,0.4)] z-20 flex items-center justify-center gap-1.5">
                <BrainCircuit size={12} className="text-white" />
                <span className="text-[12px] font-black tracking-tight text-white">
                  + 12
                </span>
              </div>
            </div>

            <div className="text-center mt-auto">
              <h3 className="text-[20px] font-bold text-gray-900 mb-2">
                AI Study Assistant
              </h3>
              <p className="text-[14px] text-gray-500 leading-relaxed max-w-[200px] mx-auto">
                Interactive video, quizzes & flashcards instantly generated from
                your notes.
              </p>
            </div>
          </div>

          {/* ═══ 5. Learning Roadmaps (col-span-6) ═══════════════════════ */}
          <div className="offer-panel offer-panel-roadmap md:col-span-6 bg-white rounded-[32px] border border-gray-100 p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col">
            <div className="w-full mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1a1c20] text-white rounded-full text-[10px] font-bold mb-4">
                <MapPin size={10} /> Learning Roadmap
              </div>
              <div className="space-y-3">
                {[
                  {
                    emoji: "📐",
                    title: "Linear Algebra",
                    targetWidth: 72,
                    color: "bg-[#38bcfc]",
                  },
                  {
                    emoji: "🧬",
                    title: "Molecular Biology",
                    targetWidth: 40,
                    color: "bg-purple-400",
                  },
                  {
                    emoji: "🌐",
                    title: "Web Development",
                    targetWidth: 90,
                    color: "bg-green-400",
                  },
                ].map((r) => (
                  <div
                    key={r.title}
                    className=" rounded-2xl border border-gray-100 p-3.5 flex items-center gap-3"
                  >
                    <span className="text-[24px] shrink-0 drop-shadow-sm">
                      {r.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[13px] font-bold text-gray-800 truncate">
                          {r.title}
                        </h4>
                        <span className="text-[10px] font-bold text-gray-400">
                          {r.targetWidth}%
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`roadmap-progress h-full rounded-full ${r.color} shadow-inner`}
                          data-width={r.targetWidth}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-xl bg-purple-100 flex items-center justify-center">
                  <BookOpenText size={14} className="text-purple-600" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-purple-600">
                  Study Guide
                </span>
              </div>
              <h3 className="text-[22px] font-bold text-gray-900 mb-2">
                Roadmaps & Progress
              </h3>
              <p className="text-[15px] text-gray-500 leading-relaxed max-w-sm">
                Generate structured learning paths. Watch your progress bar fill
                up continuously as you master subjects.
              </p>
            </div>
          </div>

          {/* ═══ 6. Study Group (col-span-6) ═══════════════════════ */}
          <div className="offer-panel md:col-span-6 bg-white rounded-[32px] border border-gray-100 p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col">
            <div className="w-full mb-8 flex gap-4">
              {/* Leaderboard Animating */}
              <div className="flex-1 bg-[#1a1c20] border border-gray-800 shadow-xl rounded-2xl p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-[#38bcfc]/10 to-transparent pointer-events-none" />
                <div className="flex items-center gap-1.5 mb-4 relative z-10 text-white">
                  <Crown size={14} className="text-brand-500" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">
                    Live Leaderboard
                  </span>
                </div>
                <div className="space-y-3 relative z-10">
                  {[
                    {
                      initial: "J",
                      name: "Jessica T.",
                      pts: "2,450",
                      rank: 1,
                      flame: true,
                    },
                    {
                      initial: "M",
                      name: "Michael R.",
                      pts: "2,120",
                      rank: 2,
                      flame: false,
                    },
                    {
                      initial: "B",
                      name: "Budi S.",
                      pts: "1,850",
                      rank: 3,
                      flame: false,
                    },
                  ].map((l) => (
                    <div
                      key={l.name}
                      className="flex items-center gap-2 py-2 border-b border-gray-800 last:border-0"
                    >
                      <span
                        className={`text-[11px] font-black w-4 shrink-0 ${l.rank === 1 ? "text-brand-500" : "text-gray-500"}`}
                      >
                        #{l.rank}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-inner">
                        {l.initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white truncate shadow-sm">
                          {l.name}
                        </p>
                        <div className="flex items-center gap-1">
                          {l.flame && (
                            <Flame
                              size={10}
                              className="leaderboard-flame text-brand-500 will-change-transform"
                            />
                          )}
                          <span
                            className={`${l.flame ? "text-brand-400" : "text-gray-400"} text-[9px] font-bold`}
                          >
                            {l.pts} pt
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live sessions stats */}
              <div className="w-[140px] shrink-0 flex flex-col gap-3">
                <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center relative shadow-sm text-center">
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-[ping_1.5s_ease-in-out_infinite]" />
                  <Users size={20} className="text-[#38bcfc] mb-2" />
                  <span className="text-[20px] font-black text-gray-900 leading-none">
                    124
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mt-1">
                    Online Now
                  </span>
                </div>
                <div className="flex-1 bg-linear-to-br from-[#38bcfc] to-blue-500 rounded-2xl p-4 flex flex-col items-center justify-center shadow-md">
                  <CheckCircle2 size={24} className="text-white mb-1" />
                  <span className="text-[11px] font-bold text-white text-center">
                    Groups
                    <br />
                    Joined
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-auto">
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
                Join live study sessions, collaborate with peers, and climb the
                dynamic leaderboard. Perfect for modern study spaces.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
