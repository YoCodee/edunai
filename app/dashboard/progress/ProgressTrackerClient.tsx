"use client";

import { useMemo } from "react";
import {
  BookOpenText,
  LayoutDashboard,
  BrainCircuit,
  CalendarDays,
  Camera,
  TrendingUp,
  Lock,
} from "lucide-react";
import Link from "next/link";

interface SkillNode {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  color: string;
  description: string;
  requires?: string[];
}

const NODES: SkillNode[] = [
  {
    id: "schedule",
    label: "Smart Scheduler",
    icon: CalendarDays,
    href: "/dashboard/schedule",
    color: "#34d399",
    description: "Organisasi jadwal kuliah & belajar",
  },
  {
    id: "notes",
    label: "Smart Notes",
    icon: BookOpenText,
    href: "/dashboard/notes",
    color: "var(--dash-primary)",
    description: "Catatan pintar berbasis AI",
    requires: ["schedule"],
  },
  {
    id: "scanner",
    label: "Board Scanner",
    icon: Camera,
    href: "/dashboard/scanner",
    color: "#fb7185",
    description: "Foto papan tulis → teks digital",
    requires: ["notes"],
  },
  {
    id: "boards",
    label: "Project Boards",
    icon: LayoutDashboard,
    href: "/dashboard/boards",
    color: "#38bcfc",
    description: "Kelola project tim secara kolaboratif",
    requires: ["notes"],
  },
  {
    id: "assistant",
    label: "AI Assistant",
    icon: BrainCircuit,
    href: "/dashboard/assistant",
    color: "#a78bfa",
    description: "Diskusi, ringkasan, & kuis AI",
    requires: ["scanner", "boards"],
  },
];

// Activity data type
export interface DayActivity {
  date: string; // YYYY-MM-DD
  count: number;
}

interface ProgressTrackerClientProps {
  unlockedTools: string[];
  activityData: DayActivity[];
  totalActiveDays: number;
  currentStreak: number;
}

// Build 52-week grid (364 days)
function buildWeekGrid(data: DayActivity[]): (DayActivity | null)[][] {
  const map = new Map(data.map((d) => [d.date, d.count]));
  const today = new Date();
  const weeks: (DayActivity | null)[][] = [];

  // Start from 363 days ago aligned to Sunday
  const start = new Date(today);
  start.setDate(today.getDate() - 363);
  const dayOfWeek = start.getDay();
  start.setDate(start.getDate() - dayOfWeek);

  const cur = new Date(start);
  while (cur <= today) {
    const week: (DayActivity | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = cur.toISOString().split("T")[0];
      const isFuture = cur > today;
      week.push(
        isFuture ? null : { date: dateStr, count: map.get(dateStr) ?? 0 },
      );
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function heatColor(count: number) {
  if (count === 0) return "#f3f4f6";
  if (count === 1) return "#fed7aa";
  if (count <= 3) return "#fdba74";
  if (count <= 6) return "#fb923c";
  return "#ea580c";
}

export default function ProgressTrackerClient({
  unlockedTools,
  activityData,
  totalActiveDays,
  currentStreak,
}: ProgressTrackerClientProps) {
  const weeks = useMemo(() => buildWeekGrid(activityData), [activityData]);

  function isUnlocked(node: SkillNode) {
    if (!node.requires) return true;
    return node.requires.every((r) => unlockedTools.includes(r));
  }

  const unlockedCount = NODES.filter((n) =>
    unlockedTools.includes(n.id),
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={18} className="text-(--dash-primary)" />
          <span className="text-[12px] font-bold text-(--dash-primary) uppercase tracking-wider">
            Progress Tracker
          </span>
        </div>
        <h1 className="text-[28px] font-black text-gray-900">
          Perjalanan Belajarmu
        </h1>
        <p className="text-[14px] text-gray-400 mt-1">
          Unlock semua fitur dan pantau konsistensi harianmu.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Fitur Unlocked",
            value: `${unlockedCount}/${NODES.length}`,
            color: "var(--dash-primary)",
          },
          { label: "Hari Aktif", value: totalActiveDays, color: "#34d399" },
          {
            label: "Streak Saat Ini",
            value: `${currentStreak} hari 🔥`,
            color: "#fb7185",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center"
          >
            <div className="text-[26px] font-black" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-[12px] text-gray-400 mt-0.5 font-medium">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── SKILL TREE ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
        <h2 className="text-[16px] font-bold text-gray-900 mb-1">Skill Tree</h2>
        <p className="text-[13px] text-gray-400 mb-6">
          Gunakan setiap fitur untuk menyalakannya. Node yang gemerlap sudah
          kamu pakai!
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          {NODES.map((node) => {
            const Icon = node.icon;
            const unlocked = unlockedTools.includes(node.id);
            const available = isUnlocked(node);

            return (
              <Link
                key={node.id}
                href={available ? node.href : "#"}
                className={`relative flex flex-col items-center text-center p-5 rounded-2xl border-2 w-36 transition-all group ${
                  unlocked
                    ? "node-unlocked cursor-pointer"
                    : available
                      ? "border-gray-100 hover:border-gray-300 cursor-pointer"
                      : "border-dashed border-gray-200 opacity-50 cursor-not-allowed"
                }`}
                style={
                  unlocked
                    ? { borderColor: node.color, background: node.color + "10" }
                    : {}
                }
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all"
                  style={
                    unlocked
                      ? { background: node.color + "25", color: node.color }
                      : { background: "#f3f4f6", color: "#9ca3af" }
                  }
                >
                  {!available ? <Lock size={20} /> : <Icon size={20} />}
                </div>
                <span
                  className="text-[12px] font-bold leading-tight"
                  style={{ color: unlocked ? node.color : "#6b7280" }}
                >
                  {node.label}
                </span>
                <span className="text-[10px] text-gray-400 mt-1 leading-tight">
                  {node.description}
                </span>
                {unlocked && (
                  <span
                    className="absolute -top-2 -right-2 text-[10px] font-black bg-white border-2 rounded-full w-5 h-5 flex items-center justify-center"
                    style={{ borderColor: node.color, color: node.color }}
                  >
                    ✓
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── ACTIVITY HEATMAP ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
        <h2 className="text-[16px] font-bold text-gray-900 mb-1">
          Aktivitas Harian
        </h2>
        <p className="text-[13px] text-gray-400 mb-5">
          Setiap kotak = 1 hari. Warna lebih gelap = lebih aktif.
        </p>

        <div className="overflow-x-auto custom-scrollbar">
          <div className="flex gap-1 min-w-max" aria-label="activity heatmap">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className="heat-cell w-3 h-3 rounded-[3px] cursor-pointer"
                    style={{
                      background: day ? heatColor(day.count) : "transparent",
                    }}
                    title={day ? `${day.date}: ${day.count} aktivitas` : ""}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-[11px] text-gray-400">Kurang</span>
          {[0, 1, 3, 5, 7].map((v) => (
            <div
              key={v}
              className="w-3 h-3 rounded-[3px]"
              style={{ background: heatColor(v) }}
            />
          ))}
          <span className="text-[11px] text-gray-400">Banyak</span>
        </div>
      </div>
    </div>
  );
}
