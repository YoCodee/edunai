"use client";

import { useState, useMemo, createElement } from "react";
import Link from "next/link";
import {
  BookOpenText,
  Plus,
  Sparkles,
  MapPin,
  ArrowRight,
  Trash2,
  MoreVertical,
  BookOpen,
  FileText,
  Target,
  Calendar,
  LayoutDashboard,
  Zap,
  Globe,
  Music,
  Palette,
  Code,
  Beaker,
  LucideIcon,
} from "lucide-react";
import { Roadmap } from "./actions";
import { deleteRoadmap } from "./actions";
import CreateRoadmapModal from "./CreateRoadmapModal";
import clsx from "clsx";

// Icon mapping for dynamic rendering
const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  FileText,
  Target,
  Calendar,
  Code,
  Palette,
  Music,
  Globe,
  LayoutDashboard,
  Zap,
  Beaker,
  Sparkles,
};

function getIconComponent(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || BookOpen;
}

// Helper component to render roadmap icon
function RoadmapIcon({ iconName, size = 28 }: { iconName: string; size?: number }) {
  const IconComponent = useMemo(() => getIconComponent(iconName), [iconName]);
  return createElement(IconComponent, {
    size,
    className: "text-gray-700",
    strokeWidth: 2,
  });
}

interface StudyGuideClientProps {
  initialRoadmaps: Roadmap[];
  userNotes: { id: string; title: string; created_at: string }[];
}

export default function StudyGuideClient({
  initialRoadmaps,
  userNotes,
}: StudyGuideClientProps) {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>(initialRoadmaps);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus roadmap ini? Semua progress akan hilang.")) return;
    
    setDeletingId(id);
    const result = await deleteRoadmap(id);
    if (!result.error) {
      setRoadmaps((prev) => prev.filter((r) => r.id !== id));
    }
    setDeletingId(null);
    setMenuOpenId(null);
  };

  const handleRoadmapCreated = (newRoadmap: Roadmap) => {
    setRoadmaps((prev) => [newRoadmap, ...prev]);
    setIsModalOpen(false);
  };

  const getProgressPercent = (r: Roadmap) => {
    if (r.total_units === 0) return 0;
    return Math.round((r.completed_units / r.total_units) * 100);
  };

  return (
    <div className="min-h-full font-sans  flex flex-col p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 w-full max-w-7xl mx-auto">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1a1c20] text-white rounded-full text-[12px] font-bold tracking-wide uppercase mb-4 shadow-sm">
            <MapPin size={14} /> Learning Roadmap
          </div>
          <h1 className="text-[36px] font-bold text-gray-900 tracking-tight">
            Study Guide
          </h1>
          <p className="text-[15px] text-gray-500 max-w-lg mt-2 leading-relaxed">
            Buat jalur belajar terstruktur dengan AI atau manual. Lacak
            progress dan kuasai materi step-by-step.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-[#1a1c20] hover:bg-[#2a2c30] text-white font-bold text-[14px] shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Buat Roadmap
        </button>
      </div>

      {/* Content */}
      <div className="w-full max-w-7xl mx-auto flex-1">
        {roadmaps.length === 0 ? (
          <EmptyState onCreateClick={() => setIsModalOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {roadmaps.map((roadmap) => (
              <RoadmapCard
                key={roadmap.id}
                roadmap={roadmap}
                progress={getProgressPercent(roadmap)}
                menuOpen={menuOpenId === roadmap.id}
                onMenuToggle={() =>
                  setMenuOpenId(menuOpenId === roadmap.id ? null : roadmap.id)
                }
                onDelete={() => handleDelete(roadmap.id)}
                isDeleting={deletingId === roadmap.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <CreateRoadmapModal
          onClose={() => setIsModalOpen(false)}
          onCreated={handleRoadmapCreated}
          userNotes={userNotes}
        />
      )}
    </div>
  );
}

// ==================== Empty State ====================
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="w-full bg-white rounded-[32px] border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] p-12 lg:p-20 text-center flex flex-col items-center justify-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <BookOpenText size={40} className="text-gray-700" />
      </div>
      <h2 className="text-[24px] font-bold text-gray-800 mb-3">
        Belum Ada Roadmap
      </h2>
      <p className="text-[15px] text-gray-500 max-w-md mb-8 leading-relaxed">
        Buat roadmap pertamamu! AI akan membantu menyusun jalur belajar
        terstruktur berdasarkan topik atau catatan yang kamu punya.
      </p>

      {/* Feature preview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-8">
        {[
          {
            emoji: "🤖",
            title: "AI-Powered",
            desc: "Generate otomatis dari topik",
          },
          {
            emoji: "📝",
            title: "From Notes",
            desc: "Buat dari catatan yang ada",
          },
          {
            emoji: "✏️",
            title: "Manual",
            desc: "Susun sendiri sesuai kebutuhan",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-left"
          >
            <span className="text-[24px] block mb-2">{f.emoji}</span>
            <h4 className="text-[13px] font-bold text-gray-700">{f.title}</h4>
            <p className="text-[12px] text-gray-400 mt-0.5">{f.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onCreateClick}
        className="px-6 py-3.5 rounded-xl bg-[#1a1c20] hover:bg-[#2a2c30] text-white font-bold text-[14px] shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
      >
        <Sparkles size={16} /> Buat Roadmap Pertama
      </button>
    </div>
  );
}

// ==================== Roadmap Card ====================
interface RoadmapCardProps {
  roadmap: Roadmap;
  progress: number;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function RoadmapCard({
  roadmap,
  progress,
  menuOpen,
  onMenuToggle,
  onDelete,
  isDeleting,
}: RoadmapCardProps) {
  const getProgressColor = (p: number) => {
    if (p === 100) return "bg-gray-900";
    if (p >= 50) return "bg-gray-600";
    return "bg-gray-300";
  };

  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all group">
      {/* Menu Button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onMenuToggle();
          }}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm opacity-0 group-hover:opacity-100"
        >
          <MoreVertical size={16} className="text-gray-500" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-10 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[140px] z-30">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
              disabled={isDeleting}
              className="w-full px-4 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Trash2 size={14} />
              {isDeleting ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        )}
      </div>

      <Link href={`/dashboard/study-guide/${roadmap.id}`} className="block p-5 relative z-10">
        {/* Icon & Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
            <RoadmapIcon iconName={roadmap.cover_emoji} />
          </div>
          <span
            className={clsx(
              "px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md",
              roadmap.subject_type === "course"
                ? "bg-gray-100 text-gray-700"
                : "bg-gray-900 text-white"
            )}
          >
            {roadmap.subject_type === "course" ? "Mata Kuliah" : "Topik"}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-[16px] font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-gray-700 transition-colors">
          {roadmap.title}
        </h3>
        <p className="text-[13px] text-gray-500 mb-4 line-clamp-2">
          {roadmap.description || "Tidak ada deskripsi"}
        </p>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[12px] mb-1.5">
            <span className="text-gray-500">Progress</span>
            <span className="font-bold text-gray-700">
              {roadmap.completed_units}/{roadmap.total_units} unit
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={clsx(
                "h-full rounded-full transition-all duration-500",
                getProgressColor(progress)
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <span className="text-[12px] text-gray-400">
            {progress === 100
              ? "🎉 Selesai!"
              : progress > 0
              ? "Lanjutkan belajar"
              : "Mulai belajar"}
          </span>
          <ArrowRight
            size={16}
            className="text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all"
          />
        </div>
      </Link>
    </div>
  );
}
