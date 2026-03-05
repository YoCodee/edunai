"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Circle,
  ExternalLink,
  FileText,
  Pencil,
  Plus,
  Upload,
  X,
  Trash2,
  Youtube,
  Globe,
  BookOpen,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  Roadmap,
  RoadmapUnit,
  updateUnitStatus,
  updateUnit,
  getUnitResources,
  addResourceLink,
  attachNoteToUnit,
  removeResource,
  UnitResource,
  generateUnitReferences,
  GeneratedReference,
  createScannedNoteAndAttachToUnit,
} from "../actions";
import { processImageWithAI } from "../../ai-workspace/actions";
import clsx from "clsx";

interface Dependency {
  unit_id: string;
  required_unit_id: string;
}

interface RoadmapDetailClientProps {
  roadmap: Roadmap;
  units: RoadmapUnit[];
  dependencies: Dependency[];
  userNotes: { id: string; title: string; created_at: string }[];
}

export default function RoadmapDetailClient({
  roadmap,
  units: initialUnits,
  dependencies,
  userNotes,
}: RoadmapDetailClientProps) {
  const [units, setUnits] = useState<RoadmapUnit[]>(initialUnits);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const selectedUnit = useMemo(
    () => units.find((u) => u.id === selectedUnitId) || null,
    [units, selectedUnitId]
  );

  // Build dependency map for quick lookup
  const dependencyMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    dependencies.forEach((d) => {
      if (!map[d.unit_id]) map[d.unit_id] = [];
      map[d.unit_id].push(d.required_unit_id);
    });
    return map;
  }, [dependencies]);

  // Group units by Y level
  const levelGroups = useMemo(() => {
    const groups: Record<number, RoadmapUnit[]> = {};
    units.forEach((u) => {
      if (!groups[u.position_y]) groups[u.position_y] = [];
      groups[u.position_y].push(u);
    });
    // Sort units within each level by position_x
    Object.keys(groups).forEach((level) => {
      groups[Number(level)].sort((a, b) => a.position_x - b.position_x);
    });
    return groups;
  }, [units]);

  const levels = Object.keys(levelGroups)
    .map(Number)
    .sort((a, b) => a - b);

  const handleStatusUpdate = async (
    unitId: string,
    newStatus: "available" | "completed" | "mastered"
  ) => {
    const result = await updateUnitStatus(unitId, newStatus);
    if (!result.error) {
      // Update local state
      setUnits((prev) =>
        prev.map((u) => {
          if (u.id === unitId) {
            return { ...u, status: newStatus };
          }
          // Check if this unit should be unlocked
          if (
            u.status === "locked" &&
            newStatus !== "available" &&
            dependencyMap[u.id]
          ) {
            const allDepsCompleted = dependencyMap[u.id].every((depId) => {
              const dep = prev.find((pu) => pu.id === depId);
              if (dep?.id === unitId) {
                return ["completed", "mastered"].includes(newStatus);
              }
              return dep && ["completed", "mastered"].includes(dep.status);
            });
            if (allDepsCompleted) {
              return { ...u, status: "available" };
            }
          }
          return u;
        })
      );
    }
  };

  const getProgress = () => {
    const completed = units.filter((u) =>
      ["completed", "mastered"].includes(u.status)
    ).length;
    return units.length > 0 ? Math.round((completed / units.length) * 100) : 0;
  };

  const handleUnitUpdate = (updatedUnit: RoadmapUnit) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === updatedUnit.id ? updatedUnit : u))
    );
  };

  return (
    <div className="min-h-full font-sans bg-[#fbfcff] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/study-guide"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-[32px]">{roadmap.cover_emoji}</span>
              <div>
                <h1 className="text-[20px] font-bold text-gray-900">
                  {roadmap.title}
                </h1>
                <p className="text-[13px] text-gray-500">
                  {roadmap.description || "Tidak ada deskripsi"}
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[12px] text-gray-500 mb-1">Progress</p>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      "h-full rounded-full transition-all duration-500",
                      getProgress() === 100 ? "bg-green-500" : "bg-indigo-500"
                    )}
                    style={{ width: `${getProgress()}%` }}
                  />
                </div>
                <span className="text-[13px] font-bold text-gray-700">
                  {getProgress()}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Tree View */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mb-8">
              {[
                { status: "available", icon: Circle, label: "Tersedia", color: "text-indigo-500" },
                { status: "completed", icon: CheckCircle2, label: "Selesai", color: "text-green-500" },
              ].map((item) => (
                <div key={item.status} className="flex items-center gap-2">
                  <item.icon size={16} className={item.color} />
                  <span className="text-[12px] text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Tree Levels */}
            <div className="relative">
              {levels.map((level, levelIndex) => (
                <div key={level} className="relative">
                  {/* Level label */}
                  <div className="absolute -left-12 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    L{level + 1}
                  </div>

                  {/* Units in this level */}
                  <div className="flex items-center justify-center gap-6 py-6">
                    {levelGroups[level].map((unit) => (
                      <UnitNode
                        key={unit.id}
                        unit={unit}
                        isSelected={selectedUnitId === unit.id}
                        onClick={() => setSelectedUnitId(unit.id)}
                        dependencies={dependencyMap[unit.id] || []}
                        allUnits={units}
                      />
                    ))}
                  </div>

                  {/* Connector lines to next level */}
                  {levelIndex < levels.length - 1 && (
                    <div className="flex justify-center py-2">
                      <svg
                        width="200"
                        height="24"
                        className="text-gray-200"
                      >
                        <line
                          x1="100"
                          y1="0"
                          x2="100"
                          y2="24"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedUnit && (
          <UnitDetailPanel
            unit={selectedUnit}
            dependencies={dependencyMap[selectedUnit.id] || []}
            allUnits={units}
            userNotes={userNotes}
            onStatusChange={handleStatusUpdate}
            onClose={() => setSelectedUnitId(null)}
            roadmapTitle={roadmap.title}
            onUnitUpdate={handleUnitUpdate}
          />
        )}
      </div>
    </div>
  );
}

// ==================== Unit Node ====================
interface UnitNodeProps {
  unit: RoadmapUnit;
  isSelected: boolean;
  onClick: () => void;
  dependencies: string[];
  allUnits: RoadmapUnit[];
}

function UnitNode({ unit, isSelected, onClick, dependencies }: UnitNodeProps) {
  const statusConfig = {
    available: {
      bg: "bg-white",
      border: "border-indigo-300",
      icon: Circle,
      iconColor: "text-indigo-500",
      textColor: "text-gray-700",
    },
    completed: {
      bg: "bg-green-50",
      border: "border-green-300",
      icon: CheckCircle2,
      iconColor: "text-green-500",
      textColor: "text-gray-700",
    },
  };

  const config = statusConfig[unit.status as keyof typeof statusConfig] || statusConfig.available;
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={clsx(
        "relative group w-44 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer",
        config.bg,
        config.border,
        isSelected && "ring-2 ring-indigo-500 ring-offset-2",
        "hover:shadow-lg hover:-translate-y-1"
      )}
    >
      {/* Status Icon */}
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100">
        <Icon size={14} className={config.iconColor} />
      </div>

      {/* Content */}
      <h4
        className={clsx(
          "text-[13px] font-bold mb-1 line-clamp-2 text-left",
          config.textColor
        )}
      >
        {unit.title}
      </h4>
      {unit.summary && (
        <p className="text-[11px] text-gray-400 line-clamp-2 text-left">
          {unit.summary}
        </p>
      )}
    </button>
  );
}

// ==================== Unit Detail Panel ====================
interface UnitDetailPanelProps {
  unit: RoadmapUnit;
  dependencies: string[];
  allUnits: RoadmapUnit[];
  userNotes: { id: string; title: string }[];
  onStatusChange: (unitId: string, status: "available" | "completed") => void;
  onUnitUpdate: (updatedUnit: RoadmapUnit) => void;
  onClose: () => void;
  roadmapTitle: string;
}

function UnitDetailPanel({
  unit,
  dependencies,
  allUnits,
  userNotes,
  onStatusChange,
  onUnitUpdate,
  onClose,
  roadmapTitle,
}: UnitDetailPanelProps) {
  const [resources, setResources] = useState<UnitResource[]>([]);
  const [showAddResource, setShowAddResource] = useState(false);
  const [addResourceTab, setAddResourceTab] = useState<"link" | "note">("link");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [references, setReferences] = useState<GeneratedReference[]>([]);
  const [isGeneratingRefs, setIsGeneratingRefs] = useState(false);
  const [hasGeneratedRefs, setHasGeneratedRefs] = useState(false);
  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(unit.title);
  const [editSummary, setEditSummary] = useState(unit.summary || "");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  // Scan states
  const [showScanMode, setShowScanMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [scannedMarkdown, setScannedMarkdown] = useState<string | null>(null);
  const [scannedTitle, setScannedTitle] = useState("");
  const [isSavingScan, setIsSavingScan] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load resources when unit changes
  useEffect(() => {
    const loadResources = async () => {
      const result = await getUnitResources(unit.id);
      if (result.data) {
        setResources(result.data);
      }
    };
    loadResources();
  }, [unit.id]);

  const handleAddLink = async () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    setIsAdding(true);
    const result = await addResourceLink(unit.id, newLinkTitle, newLinkUrl);
    if (result.data) {
      setResources((prev) => [...prev, result.data as UnitResource]);
      setNewLinkTitle("");
      setNewLinkUrl("");
      setShowAddResource(false);
    }
    setIsAdding(false);
  };

  const handleAttachNote = async (noteId: string) => {
    setIsAdding(true);
    const result = await attachNoteToUnit(unit.id, noteId);
    if (result.data) {
      setResources((prev) => [...prev, result.data as UnitResource]);
      setShowAddResource(false);
    }
    setIsAdding(false);
  };

  // Edit handlers
  const handleStartEdit = () => {
    setEditTitle(unit.title);
    setEditSummary(unit.summary || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditTitle(unit.title);
    setEditSummary(unit.summary || "");
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    setIsSavingEdit(true);
    const result = await updateUnit(unit.id, {
      title: editTitle.trim(),
      summary: editSummary.trim() || undefined,
    });
    if (result.data) {
      onUnitUpdate(result.data as RoadmapUnit);
      setIsEditing(false);
    }
    setIsSavingEdit(false);
  };

  // Scan handlers
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setScannedMarkdown(null);
        setShowScanMode(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const runScanner = async () => {
    if (!selectedImage) return;
    setIsProcessingImage(true);
    try {
      const res = await processImageWithAI(selectedImage);
      if (res.success) {
        setScannedMarkdown(res.content!);
        setScannedTitle(`${unit.title} - ${new Date().toLocaleDateString()}`);
      }
    } catch {
      alert("Scanner gagal");
    }
    setIsProcessingImage(false);
  };

  const handleSaveScan = async () => {
    if (!scannedMarkdown || !scannedTitle) return;
    setIsSavingScan(true);
    const result = await createScannedNoteAndAttachToUnit(unit.id, scannedTitle, scannedMarkdown, roadmapTitle);
    if (result.data) {
      setResources((prev) => [...prev, result.data.resource as UnitResource]);
      setSelectedImage(null);
      setScannedMarkdown(null);
      setScannedTitle("");
      setShowScanMode(false);
      setShowAddResource(false);
    }
    setIsSavingScan(false);
  };

  const handleRemoveResource = async (resourceId: string) => {
    const result = await removeResource(resourceId);
    if (result.success) {
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
    }
  };

  const depUnits = dependencies
    .map((id) => allUnits.find((u) => u.id === id))
    .filter(Boolean) as RoadmapUnit[];

  const handleGenerateReferences = async () => {
    setIsGeneratingRefs(true);
    try {
      const result = await generateUnitReferences(
        unit.id,
        unit.title,
        unit.summary || "",
        roadmapTitle
      );
      if (result.data) {
        setReferences(result.data);
        setHasGeneratedRefs(true);
      }
    } catch (error) {
      console.error("Failed to generate references:", error);
    }
    setIsGeneratingRefs(false);
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "youtube":
        return <Youtube size={14} className="text-red-500" />;
      case "article":
        return <Globe size={14} className="text-blue-500" />;
      case "documentation":
        return <BookOpen size={14} className="text-green-500" />;
      default:
        return <ExternalLink size={14} className="text-gray-500" />;
    }
  };

  const getSourceLabel = (sourceType: string) => {
    switch (sourceType) {
      case "youtube":
        return "YouTube";
      case "article":
        return "Artikel";
      case "documentation":
        return "Dokumentasi";
      default:
        return "Lainnya";
    }
  };

  const handleRemoveReference = (index: number) => {
    setReferences((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-96 bg-white border-l border-gray-100 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-gray-900">Detail Unit</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Title & Status */}
        <div className="mb-4">
          {!isEditing ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-[18px] font-bold text-gray-900 mb-2 flex-1">
                  {unit.title}
                </h4>
                <button
                  onClick={handleStartEdit}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                  title="Edit unit"
                >
                  <Pencil size={14} className="text-gray-400" />
                </button>
              </div>
              <StatusBadge status={unit.status} />
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Judul Unit
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[14px] font-medium"
                  placeholder="Judul unit"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Ringkasan Materi
                </label>
                <textarea
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[13px] resize-none"
                  placeholder="Ringkasan singkat materi..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  disabled={isSavingEdit}
                  className="flex-1 py-2 bg-gray-100 text-gray-600 text-[12px] font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit || !editTitle.trim()}
                  className="flex-1 py-2 bg-indigo-600 text-white text-[12px] font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary (only show when not editing) */}
        {!isEditing && unit.summary && (
          <div className="mb-6">
            <h5 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Ringkasan Materi
            </h5>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[13px] text-gray-700 leading-relaxed">
                {unit.summary}
              </p>
            </div>
          </div>
        )}

        {/* Prerequisites */}
        {depUnits.length > 0 && (
          <div className="mb-6">
            <h5 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Prasyarat
            </h5>
            <div className="space-y-2">
              {depUnits.map((dep) => (
                <div
                  key={dep.id}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
                >
                  {["completed", "mastered"].includes(dep.status) ? (
                    <CheckCircle2 size={14} className="text-green-500" />
                  ) : (
                    <Circle size={14} className="text-gray-400" />
                  )}
                  <span className="text-[13px] text-gray-700">{dep.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
              Resources
            </h5>
            <button
              onClick={() => setShowAddResource(!showAddResource)}
              className="text-[12px] text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
            >
              <Plus size={12} /> Tambah
            </button>
          </div>

          {/* Add Resource Form */}
          {showAddResource && (
            <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex gap-1 mb-3">
                {[
                  { id: "link" as const, label: "Link" },
                  { id: "note" as const, label: "Note" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAddResourceTab(tab.id)}
                    className={clsx(
                      "flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-colors",
                      addResourceTab === tab.id
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {addResourceTab === "link" && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    placeholder="Judul"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[12px]"
                  />
                  <input
                    type="url"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[12px]"
                  />
                  <button
                    onClick={handleAddLink}
                    disabled={isAdding}
                    className="w-full py-2 bg-indigo-600 text-white text-[12px] font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isAdding ? "Menambahkan..." : "Tambah Link"}
                  </button>
                </div>
              )}

              {addResourceTab === "note" && (
                <div className="space-y-2">
                  {/* Hidden file inputs */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={galleryInputRef}
                    onChange={onFileSelect}
                    className="hidden"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={cameraInputRef}
                    onChange={onFileSelect}
                    className="hidden"
                  />

                  {!showScanMode ? (
                    <>
                      {/* Existing notes list */}
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {userNotes.length === 0 ? (
                          <p className="text-[12px] text-gray-500 text-center py-2">
                            Belum ada catatan
                          </p>
                        ) : (
                          userNotes.map((note) => (
                            <button
                              key={note.id}
                              onClick={() => handleAttachNote(note.id)}
                              disabled={isAdding}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white text-[12px] text-gray-700 flex items-center gap-2"
                            >
                              <FileText size={12} className="text-gray-400" />
                              <span className="truncate">{note.title}</span>
                            </button>
                          ))
                        )}
                      </div>
                      {/* Scan buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => cameraInputRef.current?.click()}
                          className="flex-1 py-2 bg-gray-900 text-white text-[12px] font-semibold rounded-lg hover:bg-gray-700 flex items-center justify-center gap-1"
                        >
                          <Camera size={12} /> Scan
                        </button>
                        <button
                          onClick={() => galleryInputRef.current?.click()}
                          className="flex-1 py-2 bg-indigo-100 text-indigo-600 text-[12px] font-semibold rounded-lg hover:bg-indigo-200 flex items-center justify-center gap-1"
                        >
                          <Upload size={12} /> Upload
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      {/* Preview image */}
                      {selectedImage && (
                        <div className="relative">
                          <img
                            src={selectedImage}
                            alt="preview"
                            className="w-full rounded-lg border border-gray-200 max-h-40 object-contain"
                          />
                          {!scannedMarkdown && (
                            <button
                              onClick={runScanner}
                              disabled={isProcessingImage}
                              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg text-white"
                            >
                              {isProcessingImage ? (
                                <Loader2 size={24} className="animate-spin" />
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <Sparkles size={20} />
                                  <span className="text-[11px] font-semibold">Proses dengan AI</span>
                                </div>
                              )}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Scanned result */}
                      {scannedMarkdown && (
                        <>
                          <input
                            type="text"
                            value={scannedTitle}
                            onChange={(e) => setScannedTitle(e.target.value)}
                            placeholder="Judul Catatan"
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[12px]"
                          />
                          <div className="max-h-24 overflow-y-auto p-2 bg-gray-50 rounded-lg text-[11px] text-gray-600">
                            {scannedMarkdown.slice(0, 200)}...
                          </div>
                        </>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowScanMode(false);
                            setSelectedImage(null);
                            setScannedMarkdown(null);
                            setScannedTitle("");
                          }}
                          className="flex-1 py-2 bg-gray-100 text-gray-600 text-[12px] font-semibold rounded-lg hover:bg-gray-200"
                        >
                          Batal
                        </button>
                        {scannedMarkdown && (
                          <button
                            onClick={handleSaveScan}
                            disabled={isSavingScan}
                            className="flex-1 py-2 bg-indigo-600 text-white text-[12px] font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {isSavingScan ? "Menyimpan..." : "Simpan"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Resource List */}
          {resources.length === 0 ? (
            <p className="text-[12px] text-gray-400 text-center py-4">
              Belum ada resource
            </p>
          ) : (
            <div className="space-y-2">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg group"
                >
                  {resource.resource_type === "link" && (
                    <ExternalLink size={14} className="text-blue-500" />
                  )}
                  {resource.resource_type === "note" && (
                    <FileText size={14} className="text-indigo-500" />
                  )}
                  {resource.resource_type === "note" && resource.linked_note_id ? (
                    <Link
                      href={`/dashboard/ai-workspace?note=${resource.linked_note_id}`}
                      className="flex-1 text-[12px] text-indigo-600 hover:text-indigo-700 truncate hover:underline"
                    >
                      {resource.title}
                    </Link>
                  ) : (
                    <span className="flex-1 text-[12px] text-gray-700 truncate">
                      {resource.title}
                    </span>
                  )}
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <ExternalLink size={12} className="text-gray-400" />
                    </a>
                  )}
                  <button
                    onClick={() => handleRemoveResource(resource.id)}
                    className="p-1 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* References Section */}
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                References
              </h5>
              {!hasGeneratedRefs && (
                <button
                  onClick={handleGenerateReferences}
                  disabled={isGeneratingRefs}
                  className="text-[12px] text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1 disabled:opacity-50"
                >
                  {isGeneratingRefs ? (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} /> Generate AI
                    </>
                  )}
                </button>
              )}
            </div>

            {hasGeneratedRefs && references.length > 0 ? (
              <div className="space-y-2">
                {references.map((ref, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-start gap-2">
                      {getSourceIcon(ref.source_type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] text-gray-700 font-medium truncate">
                            {ref.title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                            {getSourceLabel(ref.source_type)}
                          </span>
                        </div>
                        {ref.description && (
                          <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                            {ref.description}
                          </p>
                        )}
                      </div>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-gray-200 rounded flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={12} className="text-gray-400 hover:text-indigo-500" />
                      </a>
                      <button
                        onClick={() => handleRemoveReference(index)}
                        className="p-1 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <Trash2 size={12} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : hasGeneratedRefs && references.length === 0 ? (
              <p className="text-[12px] text-gray-400 text-center py-4">
                Tidak dapat menemukan referensi
              </p>
            ) : (
              <div className="text-center py-4 bg-gray-50 rounded-xl">
                <Sparkles size={20} className="text-gray-300 mx-auto mb-2" />
                <p className="text-[12px] text-gray-400">
                  Klik &quot;Generate AI&quot; untuk mendapatkan<br />rekomendasi sumber belajar
                </p>
              </div>
            )}
          </div>
        </div>

      {/* Footer - Status Actions */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        {unit.status === "available" && (
          <button
            onClick={() => onStatusChange(unit.id, "completed")}
            className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCircle2 size={16} /> Tandai Selesai
          </button>
        )}
        {unit.status === "completed" && (
          <button
            onClick={() => onStatusChange(unit.id, "available")}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[13px] font-medium rounded-xl transition-colors"
          >
            Tandai Belum Selesai
          </button>
        )}
      </div>
    </div>
  );
}

// ==================== Status Badge ====================
function StatusBadge({ status }: { status: string }) {
  const config = {
    available: { bg: "bg-indigo-100", text: "text-indigo-700", label: "Tersedia" },
    completed: { bg: "bg-green-100", text: "text-green-700", label: "Selesai" },
  };

  const c = config[status as keyof typeof config] || config.available;

  return (
    <span
      className={clsx(
        "inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider",
        c.bg,
        c.text
      )}
    >
      {c.label}
    </span>
  );
}
