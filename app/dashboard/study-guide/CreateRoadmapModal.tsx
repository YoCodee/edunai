"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  FileText,
  Edit3,
  Loader2,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import {
  createRoadmapFromTopic,
  createRoadmapFromNotes,
  createRoadmapManual,
  Roadmap,
} from "./actions";
import clsx from "clsx";

type TabType = "ai-topic" | "ai-notes" | "manual";

interface CreateRoadmapModalProps {
  onClose: () => void;
  onCreated: (roadmap: Roadmap) => void;
  userNotes: { id: string; title: string; created_at: string }[];
}

const EMOJI_OPTIONS = [
  "📚",
  "📖",
  "🧮",
  "🔬",
  "💻",
  "🎨",
  "🎵",
  "🌍",
  "📊",
  "⚡",
  "🧪",
  "🏛️",
];

export default function CreateRoadmapModal({
  onClose,
  onCreated,
  userNotes,
}: CreateRoadmapModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("ai-topic");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Common fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectType, setSubjectType] = useState<"course" | "topic">("topic");
  const [emoji, setEmoji] = useState("📚");

  // AI from Notes
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);

  // Manual - layers with multiple units per layer
  type ManualUnit = { title: string; summary: string };
  type ManualLayer = { units: ManualUnit[] };
  const [manualLayers, setManualLayers] = useState<ManualLayer[]>([
    { units: [{ title: "", summary: "" }] },
  ]);

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "ai-topic", label: "AI dari Topik", icon: Sparkles },
    { id: "ai-notes", label: "AI dari Notes", icon: FileText },
    { id: "manual", label: "Manual", icon: Edit3 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let result: { data?: Roadmap; error?: string };

      if (activeTab === "ai-topic") {
        if (!title.trim()) {
          setError("Judul topik harus diisi");
          setIsLoading(false);
          return;
        }
        result = await createRoadmapFromTopic(
          title,
          description,
          subjectType,
          emoji
        );
      } else if (activeTab === "ai-notes") {
        if (selectedNoteIds.length === 0) {
          setError("Pilih minimal 1 catatan");
          setIsLoading(false);
          return;
        }
        if (!title.trim()) {
          setError("Judul roadmap harus diisi");
          setIsLoading(false);
          return;
        }
        result = await createRoadmapFromNotes(
          selectedNoteIds,
          title,
          subjectType,
          emoji
        );
      } else {
        // Manual - flatten layers to units with position info
        if (!title.trim()) {
          setError("Judul roadmap harus diisi");
          setIsLoading(false);
          return;
        }
        const unitsWithPositions: { title: string; summary: string; positionY: number; positionX: number }[] = [];
        manualLayers.forEach((layer, layerIdx) => {
          layer.units.forEach((unit, unitIdx) => {
            if (unit.title.trim()) {
              unitsWithPositions.push({
                title: unit.title.trim(),
                summary: unit.summary.trim(),
                positionY: layerIdx,
                positionX: unitIdx,
              });
            }
          });
        });
        if (unitsWithPositions.length === 0) {
          setError("Tambahkan minimal 1 unit");
          setIsLoading(false);
          return;
        }
        result = await createRoadmapManual(
          title,
          description,
          subjectType,
          emoji,
          unitsWithPositions
        );
      }

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        onCreated(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNoteSelection = (noteId: string) => {
    setSelectedNoteIds((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  const addManualLayer = () => {
    setManualLayers((prev) => [...prev, { units: [{ title: "", summary: "" }] }]);
  };

  const addUnitToLayer = (layerIndex: number) => {
    setManualLayers((prev) =>
      prev.map((layer, idx) =>
        idx === layerIndex
          ? { ...layer, units: [...layer.units, { title: "", summary: "" }] }
          : layer
      )
    );
  };

  const removeLayer = (layerIndex: number) => {
    setManualLayers((prev) => prev.filter((_, idx) => idx !== layerIndex));
  };

  const removeUnitFromLayer = (layerIndex: number, unitIndex: number) => {
    setManualLayers((prev) =>
      prev.map((layer, idx) =>
        idx === layerIndex
          ? { ...layer, units: layer.units.filter((_, ui) => ui !== unitIndex) }
          : layer
      )
    );
  };

  const updateManualUnit = (
    layerIndex: number,
    unitIndex: number,
    field: "title" | "summary",
    value: string
  ) => {
    setManualLayers((prev) =>
      prev.map((layer, li) =>
        li === layerIndex
          ? {
              ...layer,
              units: layer.units.map((u, ui) =>
                ui === unitIndex ? { ...u, [field]: value } : u
              ),
            }
          : layer
      )
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[18px] font-bold text-gray-900">
            Buat Roadmap Baru
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex-1 py-3 px-4 text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors",
                activeTab === tab.id
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Common Fields */}
          <div className="space-y-4 mb-6">
            {/* Title */}
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                {activeTab === "ai-topic" ? "Topik / Mata Kuliah" : "Judul Roadmap"}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  activeTab === "ai-topic"
                    ? "Contoh: Belajar Python untuk Pemula"
                    : "Contoh: Persiapan UAS Kalkulus"
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>

            {/* Description (optional for AI from Notes) */}
            {activeTab !== "ai-notes" && (
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Deskripsi{" "}
                  <span className="font-normal text-gray-400">(opsional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi singkat tentang roadmap ini..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                />
              </div>
            )}

            {/* Subject Type & Emoji */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Tipe
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSubjectType("topic")}
                    className={clsx(
                      "flex-1 py-2 px-3 rounded-lg text-[13px] font-medium border transition-all",
                      subjectType === "topic"
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    Topik Umum
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubjectType("course")}
                    className={clsx(
                      "flex-1 py-2 px-3 rounded-lg text-[13px] font-medium border transition-all",
                      subjectType === "course"
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    Mata Kuliah
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Emoji
                </label>
                <div className="flex gap-1 flex-wrap">
                  {EMOJI_OPTIONS.slice(0, 6).map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={clsx(
                        "w-9 h-9 rounded-lg text-[18px] transition-all",
                        emoji === e
                          ? "bg-indigo-100 ring-2 ring-indigo-400"
                          : "hover:bg-gray-100"
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tab-specific Content */}
          {activeTab === "ai-topic" && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Sparkles size={18} className="text-indigo-500" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-gray-800 mb-1">
                    AI akan membuatkan struktur roadmap
                  </h4>
                  <p className="text-[13px] text-gray-600 leading-relaxed">
                    Masukkan topik yang ingin dipelajari, AI akan menganalisis
                    dan membuat 6-12 unit pembelajaran dengan urutan dan
                    dependensi yang logis.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai-notes" && (
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                Pilih Catatan Sumber
              </label>
              {userNotes.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-[13px] text-gray-500">
                    Belum ada catatan. Buat catatan dulu di AI Workspace.
                  </p>
                </div>
              ) : (
                <div className="max-h-[200px] overflow-y-auto space-y-2 border border-gray-200 rounded-xl p-2">
                  {userNotes.map((note) => (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => toggleNoteSelection(note.id)}
                      className={clsx(
                        "w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all",
                        selectedNoteIds.includes(note.id)
                          ? "bg-indigo-50 border border-indigo-200"
                          : "hover:bg-gray-50 border border-transparent"
                      )}
                    >
                      <div
                        className={clsx(
                          "w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all",
                          selectedNoteIds.includes(note.id)
                            ? "bg-indigo-500 border-indigo-500"
                            : "border-gray-300"
                        )}
                      >
                        {selectedNoteIds.includes(note.id) && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                      <span className="text-[13px] text-gray-700 truncate flex-1">
                        {note.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {selectedNoteIds.length > 0 && (
                <p className="text-[12px] text-indigo-600 mt-2">
                  {selectedNoteIds.length} catatan dipilih
                </p>
              )}
            </div>
          )}

          {activeTab === "manual" && (
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                Unit Pembelajaran (per Level)
              </label>
              <p className="text-[12px] text-gray-400 mb-3">
                Setiap level bisa memiliki beberapa unit paralel. Unit di level berikutnya akan terkunci sampai semua unit di level sebelumnya selesai.
              </p>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {manualLayers.map((layer, layerIndex) => (
                  <div
                    key={layerIndex}
                    className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                  >
                    {/* Layer Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 bg-indigo-100 rounded-lg text-[12px] font-bold text-indigo-600 flex items-center justify-center">
                          L{layerIndex + 1}
                        </span>
                        <span className="text-[13px] font-semibold text-gray-700">
                          Level {layerIndex + 1}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          ({layer.units.length} unit)
                        </span>
                      </div>
                      {manualLayers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLayer(layerIndex)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Hapus level"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {/* Units in this layer */}
                    <div className="space-y-2">
                      {layer.units.map((unit, unitIndex) => (
                        <div
                          key={unitIndex}
                          className="bg-white rounded-lg p-2.5 border border-gray-200"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-5 h-5 bg-gray-100 rounded text-[10px] font-bold text-gray-500 flex items-center justify-center">
                              {unitIndex + 1}
                            </span>
                            <input
                              type="text"
                              value={unit.title}
                              onChange={(e) =>
                                updateManualUnit(layerIndex, unitIndex, "title", e.target.value)
                              }
                              placeholder="Judul unit"
                              className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[13px] focus:border-indigo-400 outline-none"
                            />
                            {layer.units.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeUnitFromLayer(layerIndex, unitIndex)}
                                className="p-1 rounded text-red-400 hover:bg-red-50 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                          <textarea
                            value={unit.summary}
                            onChange={(e) =>
                              updateManualUnit(layerIndex, unitIndex, "summary", e.target.value)
                            }
                            placeholder="Ringkasan materi (opsional)"
                            rows={1}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-[12px] focus:border-indigo-400 outline-none resize-none"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Add unit to this layer */}
                    <button
                      type="button"
                      onClick={() => addUnitToLayer(layerIndex)}
                      className="mt-2 w-full py-1.5 rounded-lg border border-dashed border-gray-300 text-[12px] text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus size={12} /> Tambah Unit di Level Ini
                    </button>
                  </div>
                ))}
              </div>

              {/* Add new layer */}
              <button
                type="button"
                onClick={addManualLayer}
                className="mt-3 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-[13px] text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Tambah Level Berikutnya
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-600">
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {activeTab === "manual" ? "Membuat..." : "AI sedang bekerja..."}
              </>
            ) : (
              <>
                {activeTab === "manual" ? (
                  "Buat Roadmap"
                ) : (
                  <>
                    <Sparkles size={14} /> Generate dengan AI
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
