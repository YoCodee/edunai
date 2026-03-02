"use client";

import Link from "next/link";
import {
  BookOpenText,
  LayoutDashboard,
  BrainCircuit,
  CalendarDays,
  Camera,
  ArrowRight,
  Clock,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TOOL_META: Record<
  string,
  {
    icon: React.ElementType;
    href: string;
    label: string;
    color: string;
    bg: string;
  }
> = {
  notes: {
    icon: BookOpenText,
    href: "/dashboard/notes",
    label: "Smart Notes",
    color: "#fca03e",
    bg: "#fffbf5",
  },
  boards: {
    icon: LayoutDashboard,
    href: "/dashboard/boards",
    label: "Project Boards",
    color: "#38bcfc",
    bg: "#f0fbff",
  },
  assistant: {
    icon: BrainCircuit,
    href: "/dashboard/assistant",
    label: "AI Assistant",
    color: "#a78bfa",
    bg: "#faf5ff",
  },
  schedule: {
    icon: CalendarDays,
    href: "/dashboard/schedule",
    label: "Smart Scheduler",
    color: "#34d399",
    bg: "#f0fdf4",
  },
  scanner: {
    icon: Camera,
    href: "/dashboard/scanner",
    label: "AI Board Scanner",
    color: "#fb7185",
    bg: "#fff1f2",
  },
};

interface ResumeCardProps {
  lastTool: string | null;
  lastResourceTitle: string | null;
  progressValue: number;
  lastVisitedAt: string | null;
}

export default function ResumeCard({
  lastTool,
  lastResourceTitle,
  progressValue,
  lastVisitedAt,
}: ResumeCardProps) {
  if (!lastTool) return null;

  const meta = TOOL_META[lastTool] ?? TOOL_META["notes"];
  const Icon = meta.icon;

  const daysSince = lastVisitedAt
    ? Math.floor(
        (Date.now() - new Date(lastVisitedAt).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  const timeAgo = lastVisitedAt
    ? formatDistanceToNow(new Date(lastVisitedAt), { addSuffix: true })
    : "";

  const estimateMin = Math.max(
    1,
    Math.round(((100 - progressValue) / 100) * 15),
  );

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-5 mb-2"
      style={{
        borderColor: meta.color + "33",
        background: `linear-gradient(135deg, ${meta.bg} 0%, #ffffff 100%)`,
      }}
    >
      {/* Subtle decorative circle */}
      <div
        className="absolute -right-8 -top-8 w-36 h-36 rounded-full opacity-10 pointer-events-none"
        style={{ background: meta.color }}
      />

      <div className="flex items-start gap-4 relative">
        {/* Tool icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
          style={{ background: meta.color + "22", color: meta.color }}
        >
          <Icon size={22} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Label row */}
          <div className="flex items-center gap-2 mb-0.5">
            {daysSince >= 3 ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <RefreshCw size={9} />
                {daysSince} hari lalu — mau review dulu?
              </span>
            ) : (
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: meta.color }}
              >
                Lanjutkan dari sini
              </span>
            )}
          </div>

          <h3 className="text-[15px] font-bold text-gray-900 truncate">
            {lastResourceTitle ?? meta.label}
          </h3>

          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[12px] text-gray-400">{meta.label}</p>
            <span className="text-gray-200">·</span>
            <span className="text-[12px] text-gray-400 flex items-center gap-1">
              <Clock size={10} /> {timeAgo}
            </span>
          </div>

          {/* Progress bar */}
          {progressValue > 0 && (
            <div className="mt-3">
              <div className="flex justify-between mb-1">
                <span className="text-[11px] text-gray-400 font-medium">
                  Progress
                </span>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: meta.color }}
                >
                  {progressValue}% — ~{estimateMin} mnt lagi
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progressValue}%`,
                    background: meta.color,
                    transition: "width 1s cubic-bezier(0.23,1,0.32,1)",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link
          href={meta.href}
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
          style={{ background: meta.color }}
        >
          Lanjut <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
