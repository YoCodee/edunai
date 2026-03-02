"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  GraduationCap,
  Lightbulb,
  Briefcase,
  BookOpen,
  Zap,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle,
} from "lucide-react";

type Goal = "exam" | "hobby" | "career";
type Level = "beginner" | "intermediate" | "advanced";

const GOALS = [
  {
    id: "exam" as Goal,
    icon: GraduationCap,
    title: "Lulus Ujian",
    desc: "Persiapan UTS, UAS, atau sertifikasi",
    color: "#fca03e",
    bg: "#fffbf5",
  },
  {
    id: "hobby" as Goal,
    icon: Lightbulb,
    title: "Hobi & Eksplorasi",
    desc: "Belajar karena penasaran atau passion",
    color: "#38bcfc",
    bg: "#f0fbff",
  },
  {
    id: "career" as Goal,
    icon: Briefcase,
    title: "Karier & Skill",
    desc: "Upgrade skill untuk pekerjaan atau portfolio",
    color: "#a78bfa",
    bg: "#faf5ff",
  },
];

const LEVELS = [
  {
    id: "beginner" as Level,
    icon: BookOpen,
    title: "Pemula",
    desc: "Baru mulai, butuh panduan step-by-step",
    badge: "🌱 Santai",
    color: "#34d399",
    sampleQ: "Apa itu algoritma?",
  },
  {
    id: "intermediate" as Level,
    icon: Zap,
    title: "Menengah",
    desc: "Sudah tahu dasar, ingin lebih dalam",
    badge: "⚡ Progresif",
    color: "#fca03e",
    sampleQ: "Jelaskan Big-O notation.",
  },
  {
    id: "advanced" as Level,
    icon: Trophy,
    title: "Mahir",
    desc: "Siap tantangan, ingin optimasi & masteri",
    badge: "🏆 Expert",
    color: "#fb7185",
    sampleQ: "Bandingkan Dijkstra vs A*.",
  },
];

const RECOMMENDED: Record<
  Goal,
  { tool: string; href: string; reason: string }[]
> = {
  exam: [
    {
      tool: "AI Study Assistant",
      href: "/dashboard/assistant",
      reason: "Generate soal latihan dari materi",
    },
    {
      tool: "Smart Scheduler",
      href: "/dashboard/schedule",
      reason: "Jadwalkan sesi belajar menghadapi ujian",
    },
  ],
  hobby: [
    {
      tool: "Smart Notes",
      href: "/dashboard/notes",
      reason: "Catat apa yang kamu pelajari",
    },
    {
      tool: "AI Board Scanner",
      href: "/dashboard/scanner",
      reason: "Foto buku / papan → langsung digital",
    },
  ],
  career: [
    {
      tool: "Project Boards",
      href: "/dashboard/boards",
      reason: "Kelola project portfolio kamu",
    },
    {
      tool: "AI Study Assistant",
      href: "/dashboard/assistant",
      reason: "Simulasi interview & deep-dive topik",
    },
  ],
};

const STEPS = ["Tujuan Belajar", "Level Kemampuan", "Rekomendasi"];

export default function OnboardingClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [saving, setSaving] = useState(false);

  async function finish() {
    if (!goal || !level) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({
        onboarding_completed: true,
        study_goal: goal,
        skill_level: level,
      })
      .eq("id", userId);
    router.push("/dashboard");
  }

  const canNext =
    (step === 0 && goal !== null) ||
    (step === 1 && level !== null) ||
    step === 2;

  return (
    <div className="min-h-screen bg-[#fbfcff] flex flex-col items-center justify-center p-6">
      {/* Card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100">
          <div
            className="h-full bg-linear-to-r from-[#fca03e] to-orange-400 rounded-full"
            style={{
              width: `${((step + 1) / STEPS.length) * 100}%`,
              transition: "width 0.5s cubic-bezier(0.23,1,0.32,1)",
            }}
          />
        </div>

        <div className="p-8 md:p-10">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black transition-all"
                    style={{
                      background: i <= step ? "#fca03e" : "#f3f4f6",
                      color: i <= step ? "white" : "#9ca3af",
                    }}
                  >
                    {i < step ? <CheckCircle size={12} /> : i + 1}
                  </div>
                  <span
                    className="text-[12px] font-semibold transition-colors hidden sm:block"
                    style={{ color: i === step ? "#1a1c20" : "#9ca3af" }}
                  >
                    {s}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className="w-8 h-px bg-gray-200 mx-1" />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-[#fca03e]" />
              <span className="text-[12px] font-bold text-[#fca03e] uppercase tracking-wider">
                Selamat datang di Edunai
              </span>
            </div>
            <h1 className="text-[26px] font-black text-gray-900">
              {step === 0 && "Kamu belajar untuk apa?"}
              {step === 1 && "Pilih level kemampuanmu"}
              {step === 2 && "Tool yang cocok untukmu 🎯"}
            </h1>
            <p className="text-[14px] text-gray-400 mt-1">
              {step === 0 &&
                "Ini membantu kami menyesuaikan pengalaman belajarmu."}
              {step === 1 &&
                "Pilih berdasarkan contoh pertanyaan di masing-masing level."}
              {step === 2 &&
                "Mulai dengan tool di bawah ini — semuanya sudah siap!"}
            </p>
          </div>

          {/* Step 0: Goal */}
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {GOALS.map((g) => {
                const Icon = g.icon;
                return (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`ob-option text-left p-5 rounded-2xl border-2 ${
                      goal === g.id ? "selected" : "border-gray-100"
                    }`}
                    style={
                      goal === g.id
                        ? { background: g.bg, borderColor: g.color }
                        : {}
                    }
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: g.color + "22", color: g.color }}
                    >
                      <Icon size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-[15px]">
                      {g.title}
                    </h3>
                    <p className="text-[12px] text-gray-400 mt-1">{g.desc}</p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 1: Level */}
          {step === 1 && (
            <div className="space-y-3">
              {LEVELS.map((l) => {
                const Icon = l.icon;
                return (
                  <button
                    key={l.id}
                    onClick={() => setLevel(l.id)}
                    className={`ob-option w-full text-left p-5 rounded-2xl border-2 flex items-center gap-4 ${
                      level === l.id ? "selected" : "border-gray-100"
                    }`}
                    style={level === l.id ? { borderColor: l.color } : {}}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: l.color + "22", color: l.color }}
                    >
                      <Icon size={22} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-[15px]">
                          {l.title}
                        </span>
                        <span className="text-[11px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {l.badge}
                        </span>
                      </div>
                      <p className="text-[12px] text-gray-400 mt-0.5">
                        {l.desc}
                      </p>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-[10px] text-gray-400 mb-1">
                        Contoh soal
                      </p>
                      <span className="text-[12px] font-semibold text-gray-600 bg-gray-50 px-3 py-1 rounded-lg inline-block">
                        &ldquo;{l.sampleQ}&rdquo;
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2: Recommendations */}
          {step === 2 && goal && (
            <div className="space-y-3">
              {RECOMMENDED[goal].map((r) => (
                <a
                  key={r.href}
                  href={r.href}
                  className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-md transition-all group"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-[15px] group-hover:text-[#fca03e] transition-colors">
                      {r.tool}
                    </h3>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      {r.reason}
                    </p>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-gray-300 group-hover:text-[#fca03e] shrink-0 transition-colors"
                  />
                </a>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} /> Kembali
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[#fca03e] hover:bg-orange-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                Lanjut <ChevronRight size={15} />
              </button>
            ) : (
              <button
                onClick={finish}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[#fca03e] hover:bg-orange-500 transition-all disabled:opacity-60 shadow-sm"
              >
                {saving ? "Menyimpan..." : "Masuk ke Dashboard 🚀"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
