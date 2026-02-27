"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import {
  BookOpen,
  BrainCircuit,
  Clock,
  ArrowRight,
  Sparkles,
  Calendar,
  LayoutDashboard,
  Camera,
  ChevronRight,
  Target,
  CheckCircle,
  FileText,
  Plus,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface Note {
  id: string;
  title: string;
  created_at: string;
}

interface Board {
  id: string;
  title: string;
}

interface Event {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
  event_type: string;
}

interface Props {
  firstName: string;
  totalNotesCount: number;
  totalStudySets: number;
  notes: Note[];
  boards: Board[];
  todayEvents: Event[];
}

// Animated Counter
function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 1.6,
      ease: "power3.out",
      delay: 0.4,
      onUpdate: () => setCount(Math.round(obj.val)),
    });
  }, [target]);

  return <span>{count}</span>;
}

export default function OverviewClient({
  firstName,
  totalNotesCount,
  totalStudySets,
  notes,
  boards,
  todayEvents,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header
      gsap.fromTo(
        ".ov-header",
        { opacity: 0, y: -24 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
      );

      // Stat cards
      gsap.fromTo(
        ".ov-stat",
        { opacity: 0, y: 32, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.4)",
          stagger: 0.1,
          delay: 0.25,
        },
      );

      // Panels
      gsap.fromTo(
        ".ov-panel",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.12,
          delay: 0.5,
        },
      );

      // Quick links
      gsap.fromTo(
        ".ov-ql",
        { opacity: 0, x: -16 },
        {
          opacity: 1,
          x: 0,
          duration: 0.45,
          ease: "power2.out",
          stagger: 0.07,
          delay: 0.7,
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const quickLinks = [
    { label: "New Note", icon: BookOpen, href: "/dashboard/notes" },
    { label: "Scan Board", icon: Camera, href: "/dashboard/scanner" },
    { label: "Schedule", icon: Calendar, href: "/dashboard/schedule" },
    { label: "AI Chat", icon: BrainCircuit, href: "/dashboard/assistant" },
    { label: "Boards", icon: LayoutDashboard, href: "/dashboard/boards" },
  ];

  const stats = [
    {
      label: "Smart Notes",
      value: totalNotesCount,
      icon: FileText,
      sub: "Total notes created",
    },
    {
      label: "Study Sets",
      value: totalStudySets,
      icon: Target,
      sub: "Flashcards & quizzes",
    },
    {
      label: "Today's Events",
      value: todayEvents.length,
      icon: Calendar,
      sub: "Scheduled for today",
    },
  ];

  return (
    <>
      <style>{`
        @keyframes progress-reveal {
          from { width: 0% }
        }
        .pb-fill { animation: progress-reveal 1.4s cubic-bezier(0.23,1,0.32,1) 0.7s both; }

        .card-hover {
          transition: box-shadow 0.25s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        .card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.07);
        }

        .ql-hover {
          transition: background 0.18s ease, transform 0.18s ease;
        }
        .ql-hover:hover {
          background: #f3f4f6;
          transform: translateX(2px);
        }

        .row-hover {
          transition: background 0.15s ease;
        }
        .row-hover:hover { background: #f9fafb; }

        @keyframes shimmer-name {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .name-shimmer {
          background: linear-gradient(90deg, #111827 40%, #9ca3af 55%, #111827 70%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-name 3.5s linear infinite;
        }
      `}</style>

      <div ref={containerRef} className="w-full space-y-7">
        {/* ── HEADER ── */}
        <div className="ov-header">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-[13px] font-semibold text-gray-400 mb-1 tracking-wide">
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </p>
              <h1 className="text-[30px] font-black text-gray-900 leading-tight">
                {greeting}, <span className="name-shimmer">{firstName}</span>
              </h1>
              <p className="text-[14px] text-gray-400 mt-1.5">
                {todayEvents.length === 0
                  ? "No events today — great day to learn something new."
                  : `You have ${todayEvents.length} event${todayEvents.length > 1 ? "s" : ""} scheduled today.`}
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-2 mt-1">
              {quickLinks.map((q) => {
                const Icon = q.icon;
                return (
                  <Link
                    key={q.label}
                    href={q.href}
                    className="ov-ql ql-hover inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold text-gray-600 bg-white border border-gray-200 shadow-sm"
                  >
                    <Icon size={13} className="text-gray-400" />
                    {q.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="mt-6 h-px bg-gray-100" />
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {stats.map((s) => {
            const Icon = s.icon;
            const max =
              s.label === "Smart Notes"
                ? 20
                : s.label === "Study Sets"
                  ? 10
                  : 5;
            const pct = Math.min((s.value / max) * 100, 100);
            return (
              <div
                key={s.label}
                className="ov-stat card-hover bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Icon size={17} className="text-gray-500" strokeWidth={2} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {s.label}
                  </span>
                </div>
                <div className="text-[40px] font-black text-gray-900 leading-none mb-1">
                  <AnimatedCounter target={s.value} />
                </div>
                <p className="text-[12px] text-gray-400 mb-4">{s.sub}</p>
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="pb-fill h-full bg-gray-300 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT — Today's Schedule */}
          <div className="ov-panel lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Calendar size={15} className="text-gray-500" />
                </div>
                <h3 className="text-[15px] font-bold text-gray-800">
                  Today&apos;s Schedule
                </h3>
              </div>
              <Link
                href="/dashboard/schedule"
                className="flex items-center gap-1 text-[12px] font-semibold text-gray-400 hover:text-gray-700 transition-colors"
              >
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {/* Events */}
            <div className="px-7 py-5 space-y-3">
              {todayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                    <Calendar size={22} className="text-gray-300" />
                  </div>
                  <p className="text-[14px] font-semibold text-gray-400">
                    No events today
                  </p>
                  <p className="text-[12px] text-gray-300 mt-1">
                    Your schedule is clear ✨
                  </p>
                  <Link
                    href="/dashboard/schedule"
                    className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <Plus size={13} /> Add event
                  </Link>
                </div>
              ) : (
                todayEvents.slice(0, 5).map((event, i) => (
                  <div
                    key={event.id}
                    className="row-hover flex items-start gap-4 p-3.5 rounded-xl -mx-1"
                  >
                    {/* Time */}
                    <div className="min-w-[48px] text-right shrink-0 pt-0.5">
                      <p className="text-[12px] font-bold text-gray-500">
                        {format(parseISO(event.start_time), "hh:mm")}
                      </p>
                      <p className="text-[10px] text-gray-300">
                        {format(parseISO(event.start_time), "a")}
                      </p>
                    </div>

                    {/* Connector */}
                    <div className="flex flex-col items-center mt-1 gap-1">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-300 bg-white shrink-0" />
                      {i < todayEvents.slice(0, 5).length - 1 && (
                        <div className="w-px flex-1 bg-gray-100 min-h-[20px]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-[14px] font-semibold text-gray-800 leading-snug">
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-1 shrink-0 mt-0.5">
                          <Clock size={10} className="text-gray-300" />
                          <span className="text-[10px] text-gray-400 font-medium">
                            {format(parseISO(event.end_time), "h:mm a")}
                          </span>
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-[12px] text-gray-400 mt-0.5 line-clamp-1">
                          {event.description}
                        </p>
                      )}
                      <span className="mt-1.5 inline-block text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                        {event.event_type}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT — Notes + Boards */}
          <div className="ov-panel lg:col-span-2 flex flex-col gap-5">
            {/* Recent Notes */}
            <div className="card-hover bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden flex-1">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                    <BookOpen size={13} className="text-gray-500" />
                  </div>
                  <h3 className="text-[14px] font-bold text-gray-800">
                    Recent Notes
                  </h3>
                </div>
                <Link
                  href="/dashboard/notes"
                  className="text-[11px] font-semibold text-gray-400 hover:text-gray-700 flex items-center gap-0.5 transition-colors"
                >
                  All <ChevronRight size={12} />
                </Link>
              </div>

              <div className="px-6 py-4">
                {!notes || notes.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-[13px] text-gray-400">No notes yet.</p>
                    <Link
                      href="/dashboard/notes"
                      className="text-[12px] font-semibold text-gray-500 hover:text-gray-800 mt-1 inline-flex items-center gap-1 transition-colors"
                    >
                      <Plus size={12} /> Create first note
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notes.map((note) => (
                      <Link
                        key={note.id}
                        href="/dashboard/notes"
                        className="row-hover flex items-center gap-3 py-2.5 px-2 rounded-xl -mx-2 group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <FileText size={12} className="text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] font-semibold text-gray-700 truncate group-hover:text-gray-900 transition-colors">
                            {note.title}
                          </h4>
                          <p className="text-[11px] text-gray-300 mt-0.5">
                            {format(parseISO(note.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <ChevronRight
                          size={13}
                          className="text-gray-200 group-hover:text-gray-400 shrink-0 transition-colors"
                        />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Project Boards */}
            <div className="card-hover bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden flex-1">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                    <LayoutDashboard size={13} className="text-gray-500" />
                  </div>
                  <h3 className="text-[14px] font-bold text-gray-800">
                    Project Boards
                  </h3>
                </div>
                <Link
                  href="/dashboard/boards"
                  className="text-[11px] font-semibold text-gray-400 hover:text-gray-700 flex items-center gap-0.5 transition-colors"
                >
                  All <ChevronRight size={12} />
                </Link>
              </div>

              <div className="px-6 py-4">
                {!boards || boards.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-[13px] text-gray-400">No boards yet.</p>
                    <Link
                      href="/dashboard/boards"
                      className="text-[12px] font-semibold text-gray-500 hover:text-gray-800 mt-1 inline-flex items-center gap-1 transition-colors"
                    >
                      <Plus size={12} /> Create a board
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {boards.map((board) => (
                      <Link
                        key={board.id}
                        href={`/dashboard/boards/${board.id}`}
                        className="row-hover flex items-center gap-3 py-2.5 px-2 rounded-xl -mx-2 group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <CheckCircle size={12} className="text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] font-semibold text-gray-700 truncate group-hover:text-gray-900 transition-colors">
                            {board.title}
                          </h4>
                          <p className="text-[11px] text-gray-300 mt-0.5">
                            Active project
                          </p>
                        </div>
                        <ChevronRight
                          size={13}
                          className="text-gray-200 group-hover:text-gray-400 shrink-0 transition-colors"
                        />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM: AI CTA ── */}
        <div className="ov-panel bg-gray-900 rounded-2xl p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={13} className="text-gray-400" />
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                AI Assistant
              </span>
            </div>
            <h3 className="text-[20px] font-black text-white leading-snug">
              Ask anything about your notes
            </h3>
            <p className="text-[13px] text-gray-500 mt-1 max-w-sm">
              Your AI study buddy is ready. Upload photos, summarize notes, or
              quiz yourself.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
            <div className="flex gap-3">
              <Link
                href="/dashboard/scanner"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
              >
                <Camera size={14} />
                Scan Photo
              </Link>
              <Link
                href="/dashboard/assistant"
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-gray-100 transition-all shadow-sm"
              >
                <BrainCircuit size={14} />
                Start Chat
                <ArrowRight size={13} />
              </Link>
            </div>
            <p className="text-[10px] text-gray-600 mt-1">
              Powered by Google Gemini
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
