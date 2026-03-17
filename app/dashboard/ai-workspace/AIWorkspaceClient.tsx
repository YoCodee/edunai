"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import ReactMarkdown from "react-markdown";
import clsx from "clsx";
import { createClient } from "@/utils/supabase/client";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

import {
  Camera,
  Upload,
  Sparkles,
  X,
  Save,
  CheckCircle2,
  BookOpen,
  Search,
  Trash2,
  Loader2,
  Calendar as CalendarIcon,
  PlayCircle,
  PauseCircle,
  FileText,
  BrainCircuit,
  BookOpenText,
  FileQuestion,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  BarChart,
  FilePlus,
  Layers,
  Plus,
  FolderOpen,
  Folder,
  FolderPlus,
  Pencil,
  Check,
  GripVertical,
  AlertTriangle,
} from "lucide-react";

import {
  processImageWithAI,
  saveGeneratedNote,
  deleteNoteWithResources,
} from "./actions";
import { generateStudyMaterial } from "./assistant-actions";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface NoteFolder {
  id: string;
  name: string;
  created_at: string;
}

interface Note {
  id: string;
  title: string;
  created_at: string;
  content_markdown: string;
  tags?: string[];
  folder_id?: string | null;
}

interface AIWorkspaceClientProps {
  initialNotes: Note[];
  initialFolders: NoteFolder[];
  initialStudySets: any[];
  selectedNoteId?: string;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function AIWorkspaceClient({
  initialNotes,
  initialFolders,
  initialStudySets,
  selectedNoteId,
}: AIWorkspaceClientProps) {
  const supabase = createClient();

  // ── Data State ──
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [folders, setFolders] = useState<NoteFolder[]>(initialFolders);
  const [isNotesLoading, setIsNotesLoading] = useState(false);

  // ── Folder UI State ──
  const [activeFolderId, setActiveFolderId] = useState<
    string | "all" | "uncategorized"
  >("all");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  // ── Delete Modal State ──
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "note" | "folder";
    id: string;
    title: string;
  }>({ isOpen: false, type: "note", id: "", title: "" });
  const newFolderInputRef = useRef<HTMLInputElement>(null);

  // ── Search ──
  const [searchQuery, setSearchQuery] = useState("");

  // ── Main Layout ──
  const [mainMode, setMainMode] = useState<"view" | "scan">("view");
  const [activeNote, setActiveNote] = useState<Note | null>(() => {
    if (selectedNoteId) {
      const note = initialNotes.find((n) => n.id === selectedNoteId);
      if (note) return note;
    }
    return initialNotes[0] || null;
  });

  // ── Scanner State ──
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [scannedMarkdown, setScannedMarkdown] = useState<string | null>(null);
  const [scannedTitle, setScannedTitle] = useState("");
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // ── TTS ──
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, [activeNote, mainMode]);

  // ── AI Tools ──
  const [activeTool, setActiveTool] = useState<
    "idle" | "summary" | "flashcards" | "quiz"
  >("idle");
  const [isWorking, setIsWorking] = useState(false);
  const [toolResult, setToolResult] = useState<any>(null);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<any>({});

  // ── Auto-focus rename & new folder inputs ──
  useEffect(() => {
    if (renamingFolderId && renameInputRef.current)
      renameInputRef.current.focus();
  }, [renamingFolderId]);
  useEffect(() => {
    if (isCreatingFolder && newFolderInputRef.current)
      newFolderInputRef.current.focus();
  }, [isCreatingFolder]);

  // ── Auto-select note from URL param ──
  useEffect(() => {
    if (selectedNoteId) {
      const note = notes.find((n) => n.id === selectedNoteId);
      if (note) {
        setActiveNote(note);
        setMainMode("view");
        setActiveTool("idle");
        // If note is in a folder, expand that folder
        if (note.folder_id) {
          setExpandedFolders((prev) => new Set([...prev, note.folder_id!]));
        }
      }
    }
  }, [selectedNoteId, notes]);

  // ── Auto-load scan image from sessionStorage ──
  useEffect(() => {
    try {
      const pendingImage = sessionStorage.getItem("scan_pending_image");
      if (pendingImage) {
        setSelectedImage(pendingImage);
        setMainMode("scan");
        sessionStorage.removeItem("scan_pending_image");
      }
    } catch (e) {
      console.error("Failed to read pending scan image", e);
    }
  }, []);

  // ─────────────────────────────────────────────
  // Derived: filtered notes based on active folder
  // ─────────────────────────────────────────────
  const getVisibleNotes = () => {
    let filtered = notes;
    if (searchQuery.trim()) {
      filtered = filtered.filter((n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (activeFolderId === "all") return filtered;
    if (activeFolderId === "uncategorized")
      return filtered.filter((n) => !n.folder_id);
    return filtered.filter((n) => n.folder_id === activeFolderId);
  };
  const visibleNotes = getVisibleNotes();

  // ─────────────────────────────────────────────
  // Handlers: Notes
  // ─────────────────────────────────────────────
  const fetchNotes = async () => {
    setIsNotesLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("notes")
        .select("id, title, created_at, content_markdown, tags, folder_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setNotes(data as Note[]);
    }
    setIsNotesLoading(false);
  };

  const handleNoteSelect = (note: Note) => {
    setActiveNote(note);
    setMainMode("view");
    setActiveTool("idle");
  };

  const openDeleteNoteModal = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, type: "note", id: note.id, title: note.title });
  };

  const executeDeleteNote = async (id: string) => {
    const result = await deleteNoteWithResources(id);
    if (result.success) {
      const newNotes = notes.filter((n) => n.id !== id);
      setNotes(newNotes);
      if (activeNote?.id === id) setActiveNote(newNotes[0] || null);
    }
  };

  // ─────────────────────────────────────────────
  // Handlers: Folders
  // ─────────────────────────────────────────────
  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) {
      setIsCreatingFolder(false);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("note_folders")
      .insert([{ user_id: user.id, name }])
      .select()
      .single();

    if (!error && data) {
      setFolders((prev) => [...prev, data as NoteFolder]);
      setExpandedFolders((prev) => new Set(prev).add(data.id));
      setActiveFolderId(data.id);
    }
    setNewFolderName("");
    setIsCreatingFolder(false);
  };

  const handleStartRename = (folder: NoteFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingFolderId(folder.id);
    setRenameValue(folder.name);
  };

  const handleConfirmRename = async (folderId: string) => {
    const name = renameValue.trim();
    if (!name) {
      setRenamingFolderId(null);
      return;
    }
    const { error } = await supabase
      .from("note_folders")
      .update({ name })
      .eq("id", folderId);
    if (!error) {
      setFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, name } : f)),
      );
    }
    setRenamingFolderId(null);
  };

  const openDeleteFolderModal = (folder: NoteFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, type: "folder", id: folder.id, title: folder.name });
  };

  const executeDeleteFolder = async (folderId: string) => {
    const { error } = await supabase
      .from("note_folders")
      .delete()
      .eq("id", folderId);
    if (!error) {
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      setNotes((prev) =>
        prev.map((n) =>
          n.folder_id === folderId ? { ...n, folder_id: null } : n,
        ),
      );
      if (activeFolderId === folderId) setActiveFolderId("all");
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.type === "note") {
      await executeDeleteNote(deleteModal.id);
    } else {
      await executeDeleteFolder(deleteModal.id);
    }
    setDeleteModal({ isOpen: false, type: "note", id: "", title: "" });
  };

  const toggleFolderExpand = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  // ─────────────────────────────────────────────
  // Handlers: Drag and Drop
  // ─────────────────────────────────────────────
  const handleDragEnd = async (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination) return;

    const targetFolderId =
      destination.droppableId === "uncategorized"
        ? null
        : destination.droppableId;
    const draggedNote = notes.find((n) => n.id === draggableId);
    if (!draggedNote || draggedNote.folder_id === targetFolderId) return;

    // Optimistic update
    setNotes((prev) =>
      prev.map((n) =>
        n.id === draggableId ? { ...n, folder_id: targetFolderId } : n,
      ),
    );

    // Persist to DB
    await supabase
      .from("notes")
      .update({ folder_id: targetFolderId })
      .eq("id", draggableId);
  };

  // ─────────────────────────────────────────────
  // Handlers: Scanner
  // ─────────────────────────────────────────────
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setScannedMarkdown(null);
        setIsSaved(false);
        setMainMode("scan");
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
        setScannedTitle(`New Note - ${new Date().toLocaleDateString()}`);
      }
    } catch {
      alert("Scanner failed");
    }
    setIsProcessingImage(false);
  };

  const saveNote = async () => {
    if (!scannedMarkdown || !scannedTitle) return;
    setIsSaving(true);
    const res = await saveGeneratedNote(scannedTitle, scannedMarkdown);
    if (res.success) {
      setIsSaved(true);
      await fetchNotes();
    }
    setIsSaving(false);
  };

  // ─────────────────────────────────────────────
  // Handlers: TTS
  // ─────────────────────────────────────────────
  const toggleTTS = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    if (!activeNote || mainMode !== "view") return;
    const text = activeNote.content_markdown.replace(/[#*`_]/g, "");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  // ─────────────────────────────────────────────
  // Handlers: AI Tools
  // ─────────────────────────────────────────────
  const startTool = async (type: "summary" | "flashcards" | "quiz") => {
    setActiveTool(type);
    setIsWorking(true);
    setToolResult(null);
    setQuizScore(null);
    setUserAnswers({});
    setFlashcardIndex(0);
    setIsFlipped(false);
    const res = await generateStudyMaterial(activeNote!.id, type);
    if (res.success)
      setToolResult(type === "flashcards" ? res.flashcards : res.data);
    else {
      alert("Error generating content");
      setActiveTool("idle");
    }
    setIsWorking(false);
  };

  // ─────────────────────────────────────────────
  // UI: Note count per folder
  // ─────────────────────────────────────────────
  const countForFolder = (fid: string) =>
    notes.filter((n) => n.folder_id === fid).length;
  const countUncategorized = notes.filter((n) => !n.folder_id).length;

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <>
      <style>{`
        .ws-card-hover { transition: box-shadow .25s ease, transform .25s cubic-bezier(.34,1.56,.64,1); }
        .ws-card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,.07); }
        .note-row-hover { transition: background .15s ease; }
        .note-row-hover:hover { background: #f9fafb; }
        .tool-card-hover { transition: box-shadow .2s ease, transform .2s ease; }
        .tool-card-hover:hover { transform: translateY(-2px); }
        @keyframes fade-up { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fade-up .45s ease both; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 99px; }
        .dnd-drop-active { background: #f0f9ff; border-color: #93c5fd !important; }
        .dnd-dragging { opacity: 0.6; }
        .folder-drop-over { background: #eff6ff !important; }
        .drag-handle { cursor: grab; }
        .drag-handle:active { cursor: grabbing; }
        @keyframes modal-in { from { opacity:0; transform:scale(.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes backdrop-in { from { opacity:0; } to { opacity:1; } }
        .modal-animate { animation: modal-in .2s ease both; }
        .backdrop-animate { animation: backdrop-in .15s ease both; }
      `}</style>

      <div className="w-full min-h-full space-y-6 fade-up">
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[13px] font-semibold text-gray-400 mb-1 tracking-wide">
              AI Workspace
            </p>
            <h1 className="text-[28px] font-black text-gray-900 leading-tight">
              Your Smart Notes
            </h1>
            <p className="text-[14px] text-gray-400 mt-1">
              {notes.length === 0
                ? "No notes yet — scan your first board."
                : `${notes.length} note${notes.length > 1 ? "s" : ""} · ${folders.length} folder${folders.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={() => {
              setMainMode("scan");
              setSelectedImage(null);
              setScannedMarkdown(null);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[13px] font-bold hover:bg-gray-700 transition-all shadow-sm"
          >
            <Camera size={14} /> New AI Scan
          </button>
        </div>

        <div className="h-px bg-gray-100" />

        {/* ── 3-COLUMN GRID ── */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 h-[calc(100vh-240px)] min-h-[560px]">
            {/* ─── LEFT SIDEBAR ─── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden">
              {/* Search */}
              <div className="px-4 pt-4 pb-3 border-b border-gray-50">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search notes..."
                    className="w-full bg-gray-50 border border-gray-100 text-[13px] font-medium rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                  />
                </div>
              </div>

              {/* Folder navigation + Note list */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* All Notes */}
                <div className="px-3 pt-3 pb-1">
                  <Droppable droppableId="all" isDropDisabled={false}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={clsx(
                          "rounded-xl transition-colors",
                          snapshot.isDraggingOver && "folder-drop-over",
                        )}
                      >
                        <button
                          onClick={() => setActiveFolderId("all")}
                          className={clsx(
                            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors",
                            activeFolderId === "all"
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-500 hover:bg-gray-50",
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText size={14} />
                            All Notes
                          </div>
                          <span className="text-[11px] font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                            {notes.length}
                          </span>
                        </button>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  {/* Uncategorized */}
                  <Droppable droppableId="uncategorized">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={clsx(
                          "rounded-xl mt-0.5 transition-colors",
                          snapshot.isDraggingOver && "folder-drop-over",
                        )}
                      >
                        <button
                          onClick={() => setActiveFolderId("uncategorized")}
                          className={clsx(
                            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors",
                            activeFolderId === "uncategorized"
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-500 hover:bg-gray-50",
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Folder size={14} />
                            Uncategorized
                          </div>
                          <span className="text-[11px] font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                            {countUncategorized}
                          </span>
                        </button>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>

                {/* Folders section */}
                <div className="px-3 pt-3">
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Folders
                    </span>
                    <button
                      onClick={() => setIsCreatingFolder(true)}
                      className="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                      title="New folder"
                    >
                      <FolderPlus size={13} />
                    </button>
                  </div>

                  {/* New folder input */}
                  {isCreatingFolder && (
                    <div className="mb-1.5 flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-xl border border-gray-200">
                      <Folder size={13} className="text-gray-400 shrink-0" />
                      <input
                        ref={newFolderInputRef}
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreateFolder();
                          if (e.key === "Escape") {
                            setIsCreatingFolder(false);
                            setNewFolderName("");
                          }
                        }}
                        onBlur={handleCreateFolder}
                        placeholder="Folder name..."
                        className="flex-1 bg-transparent text-[13px] font-medium text-gray-800 outline-none"
                        maxLength={40}
                      />
                    </div>
                  )}

                  {folders.length === 0 && !isCreatingFolder ? (
                    <p className="text-[12px] text-gray-300 px-2 py-2 italic">
                      No folders yet
                    </p>
                  ) : (
                    <div className="space-y-0.5 pb-2">
                      {folders.map((folder) => {
                        const isExpanded = expandedFolders.has(folder.id);
                        const isActive = activeFolderId === folder.id;
                        const folderNotes = notes.filter(
                          (n) => n.folder_id === folder.id,
                        );
                        const isRenaming = renamingFolderId === folder.id;

                        return (
                          <Droppable key={folder.id} droppableId={folder.id}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={clsx(
                                  "rounded-xl transition-colors",
                                  snapshot.isDraggingOver && "folder-drop-over",
                                )}
                              >
                                {/* Folder row */}
                                <div
                                  className={clsx(
                                    "group flex items-center gap-1.5 px-2 py-2 rounded-xl cursor-pointer transition-colors",
                                    isActive
                                      ? "bg-gray-100 text-gray-900"
                                      : "text-gray-600 hover:bg-gray-50",
                                  )}
                                  onClick={() => {
                                    setActiveFolderId(folder.id);
                                    toggleFolderExpand(folder.id);
                                  }}
                                >
                                  <button
                                    className="shrink-0 w-4 h-4 flex items-center justify-center text-gray-400"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFolderExpand(folder.id);
                                    }}
                                  >
                                    {isExpanded ? (
                                      <ChevronDown size={12} />
                                    ) : (
                                      <ChevronRight size={12} />
                                    )}
                                  </button>

                                  {isExpanded ? (
                                    <FolderOpen
                                      size={14}
                                      className="shrink-0 text-gray-500"
                                    />
                                  ) : (
                                    <Folder
                                      size={14}
                                      className="shrink-0 text-gray-400"
                                    />
                                  )}

                                  {isRenaming ? (
                                    <input
                                      ref={renameInputRef}
                                      value={renameValue}
                                      onChange={(e) =>
                                        setRenameValue(e.target.value)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                          handleConfirmRename(folder.id);
                                        if (e.key === "Escape")
                                          setRenamingFolderId(null);
                                      }}
                                      onBlur={() =>
                                        handleConfirmRename(folder.id)
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex-1 bg-white border border-gray-200 rounded-lg px-2 py-0.5 text-[13px] font-medium text-gray-800 outline-none ring-1 ring-gray-300"
                                      maxLength={40}
                                    />
                                  ) : (
                                    <span className="flex-1 text-[13px] font-medium truncate">
                                      {folder.name}
                                    </span>
                                  )}

                                  <div className="flex items-center gap-1 ml-auto shrink-0">
                                    <span className="text-[11px] font-bold text-gray-400">
                                      {countForFolder(folder.id)}
                                    </span>
                                    {!isRenaming && (
                                      <div className="hidden group-hover:flex items-center gap-0.5">
                                        <button
                                          onClick={(e) =>
                                            handleStartRename(folder, e)
                                          }
                                          className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                                        >
                                          <Pencil size={11} />
                                        </button>
                                        <button
                                          onClick={(e) =>
                                            openDeleteFolderModal(folder, e)
                                          }
                                          className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Expanded folder notes (mini list, not draggable here) */}
                                {isExpanded && folderNotes.length > 0 && (
                                  <div className="ml-7 mb-1 space-y-0.5">
                                    {folderNotes.map((n) => (
                                      <div
                                        key={n.id}
                                        onClick={() => {
                                          handleNoteSelect(n);
                                          setActiveFolderId(folder.id);
                                        }}
                                        className={clsx(
                                          "flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer text-[12px] font-medium truncate transition-colors",
                                          activeNote?.id === n.id &&
                                            mainMode === "view"
                                            ? "bg-gray-100 text-gray-900"
                                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800",
                                        )}
                                      >
                                        <FileText
                                          size={11}
                                          className="shrink-0 text-gray-300"
                                        />
                                        <span className="truncate">
                                          {n.title}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Droppable placeholder — show drop hint when dragging */}
                                <div className="hidden">
                                  {provided.placeholder}
                                </div>
                              </div>
                            )}
                          </Droppable>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── Main draggable notes list (for selected folder view) ── */}
                <div className="px-3 pb-4 pt-3 border-t border-gray-50 mt-2">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {activeFolderId === "all"
                        ? "All Notes"
                        : activeFolderId === "uncategorized"
                          ? "Uncategorized"
                          : folders.find((f) => f.id === activeFolderId)
                              ?.name || "Notes"}
                    </span>
                    <span className="text-[11px] text-gray-300">
                      {visibleNotes.length}
                    </span>
                  </div>

                  <Droppable
                    droppableId={
                      activeFolderId === "all"
                        ? "all-notes-list"
                        : activeFolderId === "uncategorized"
                          ? "uncategorized"
                          : activeFolderId
                    }
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={clsx(
                          "space-y-1 min-h-[40px] rounded-xl transition-colors p-1",
                          snapshot.isDraggingOver &&
                            "dnd-drop-active border border-dashed border-blue-200",
                        )}
                      >
                        {isNotesLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2
                              size={18}
                              className="animate-spin text-gray-300"
                            />
                          </div>
                        ) : visibleNotes.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <BookOpen
                              size={20}
                              className="text-gray-200 mb-2"
                            />
                            <p className="text-[12px] text-gray-400 font-medium">
                              Drop a note here
                            </p>
                          </div>
                        ) : (
                          visibleNotes.map((n, index) => (
                            <Draggable
                              key={n.id}
                              draggableId={n.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={clsx(
                                    "note-row-hover flex items-start gap-2.5 p-3 rounded-xl cursor-pointer group border transition-all",
                                    mainMode === "view" &&
                                      activeNote?.id === n.id
                                      ? "bg-gray-50 border-gray-200"
                                      : "border-transparent",
                                    snapshot.isDragging &&
                                      "shadow-md bg-white border-gray-200 dnd-dragging",
                                  )}
                                  onClick={() => handleNoteSelect(n)}
                                >
                                  {/* Drag handle */}
                                  <div
                                    {...provided.dragHandleProps}
                                    className="drag-handle mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <GripVertical
                                      size={13}
                                      className="text-gray-300"
                                    />
                                  </div>

                                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                    <FileText
                                      size={13}
                                      className="text-gray-400"
                                    />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-[13px] text-gray-800 truncate pr-4">
                                      {n.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] text-gray-300 font-medium">
                                        {format(
                                          parseISO(n.created_at),
                                          "MMM d, yyyy",
                                        )}
                                      </span>
                                      {activeFolderId === "all" && n.folder_id && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveFolderId(n.folder_id!);
                                            setExpandedFolders((prev) => new Set([...prev, n.folder_id!]));
                                          }}
                                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-full px-2 py-0.5 transition-colors"
                                          title={`Go to folder: ${folders.find(f => f.id === n.folder_id)?.name}`}
                                        >
                                          <Folder size={9} />
                                          {folders.find(f => f.id === n.folder_id)?.name}
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <button
                                    onClick={(e) => openDeleteNoteModal(n, e)}
                                    className="shrink-0 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-50">
                <button
                  onClick={() => {
                    setMainMode("scan");
                    setSelectedImage(null);
                    setScannedMarkdown(null);
                  }}
                  className="w-full py-2.5 text-[13px] font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus size={14} /> New Scan
                </button>
              </div>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={galleryInputRef}
                onChange={onFileSelect}
              />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={cameraInputRef}
                onChange={onFileSelect}
              />
            </div>

            {/* ─── MIDDLE: Content Canvas ─── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden">
              {mainMode === "scan" ? (
                /* SCANNER */
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between px-7 py-5 border-b border-gray-50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Camera size={15} className="text-gray-500" />
                      </div>
                      <h3 className="text-[15px] font-bold text-gray-800">
                        AI Board Scanner
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      {activeNote && (
                        <button
                          onClick={() => setMainMode("view")}
                          className="text-[12px] font-semibold text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
                        >
                          <ArrowLeft size={13} /> Back to note
                        </button>
                      )}
                      {scannedMarkdown && !isSaved && (
                        <button
                          onClick={saveNote}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-[13px] font-bold rounded-xl hover:bg-gray-700 transition-all disabled:opacity-50"
                        >
                          {isSaving ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Save size={13} />
                          )}
                          {isSaving ? "Saving..." : "Save as Note"}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-7 custom-scrollbar">
                    {!selectedImage ? (
                      <div className="h-full flex flex-col items-center justify-center max-w-lg mx-auto">
                        <h3 className="text-[22px] font-black text-gray-800 mb-2 text-center">
                          Submit your material
                        </h3>
                        <p className="text-[13px] text-gray-400 mb-8 text-center">
                          Upload an image or snap a photo to generate smart
                          notes instantly.
                        </p>
                        <div className="grid grid-cols-2 gap-4 w-full">
                          <button
                            onClick={() => galleryInputRef.current?.click()}
                            className="p-8 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-100 transition-all flex flex-col items-center gap-4 group"
                          >
                            <div className="w-14 h-14 bg-white rounded-xl border border-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                              <Upload size={24} className="text-gray-500" />
                            </div>
                            <div className="text-center">
                              <h4 className="font-bold text-[14px] text-gray-700">
                                Upload File
                              </h4>
                              <p className="text-[12px] text-gray-400 mt-0.5">
                                From gallery
                              </p>
                            </div>
                          </button>
                          <button
                            onClick={() => cameraInputRef.current?.click()}
                            className="p-8 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-100 transition-all flex flex-col items-center gap-4 group"
                          >
                            <div className="w-14 h-14 bg-white rounded-xl border border-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                              <Camera size={24} className="text-gray-500" />
                            </div>
                            <div className="text-center">
                              <h4 className="font-bold text-[14px] text-gray-700">
                                Direct Snap
                              </h4>
                              <p className="text-[12px] text-gray-400 mt-0.5">
                                Use camera
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-6 h-full">
                        <div className="flex flex-col gap-4">
                          <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden relative flex items-center justify-center group">
                            <img
                              src={selectedImage}
                              className="max-w-full max-h-full object-contain p-4"
                              alt="Board scan"
                            />
                            {isProcessingImage ? (
                              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                                <Loader2
                                  size={32}
                                  className="animate-spin text-gray-500"
                                />
                                <p className="text-[13px] font-bold text-gray-600">
                                  Scanning Board...
                                </p>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-3 right-3 w-8 h-8 bg-white border border-gray-200 text-gray-500 rounded-lg flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:text-red-500"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                          {!scannedMarkdown && !isProcessingImage && (
                            <button
                              onClick={runScanner}
                              className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-[14px] hover:bg-gray-700 transition-all"
                            >
                              <Sparkles size={16} /> Generate Smart Note
                            </button>
                          )}
                        </div>
                        <div className="flex flex-col bg-gray-50 rounded-2xl border border-gray-100 p-5 overflow-hidden">
                          {scannedMarkdown ? (
                            <div className="flex flex-col h-full">
                              <input
                                value={scannedTitle}
                                onChange={(e) =>
                                  setScannedTitle(e.target.value)
                                }
                                className="bg-white border border-gray-200 text-[16px] font-bold text-gray-800 px-4 py-3 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-gray-200"
                                placeholder="Enter title..."
                              />
                              <div className="flex-1 overflow-y-auto prose prose-sm prose-gray max-w-none prose-headings:font-bold custom-scrollbar pr-1">
                                <ReactMarkdown>{scannedMarkdown}</ReactMarkdown>
                              </div>
                              {isSaved && (
                                <div className="mt-4 p-3 bg-green-50 text-green-700 font-semibold rounded-xl text-center flex items-center justify-center gap-2 text-[13px]">
                                  <CheckCircle2 size={16} /> Added to your
                                  workspace!
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-300">
                              <BarChart
                                size={40}
                                strokeWidth={1.5}
                                className="mb-3"
                              />
                              <p className="text-[13px] font-semibold">
                                Analysis result will appear here
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* VIEWER */
                <div className="h-full flex flex-col">
                  {activeNote ? (
                    <>
                      <div className="px-7 py-5 border-b border-gray-50 bg-white">
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-2">
                          <CalendarIcon size={12} />
                          {format(
                            parseISO(activeNote.created_at),
                            "MMMM do, yyyy",
                          )}
                          {activeNote.folder_id && (
                            <>
                              <span className="text-gray-200">•</span>
                              <div className="flex items-center gap-1 text-gray-400">
                                <Folder size={11} />
                                {
                                  folders.find(
                                    (f) => f.id === activeNote.folder_id,
                                  )?.name
                                }
                              </div>
                            </>
                          )}
                        </div>
                        <h2 className="text-[24px] font-black text-gray-900 leading-tight mb-4">
                          {activeNote.title}
                        </h2>
                        <button
                          onClick={toggleTTS}
                          className={clsx(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all border",
                            isPlaying
                              ? "bg-gray-900 border-gray-900 text-white"
                              : "bg-white border-gray-200 text-gray-600 hover:border-gray-400",
                          )}
                        >
                          {isPlaying ? (
                            <PauseCircle size={15} />
                          ) : (
                            <PlayCircle size={15} />
                          )}
                          {isPlaying ? "Stop AI Reader" : "AI Voice Buddy"}
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                        <div className="max-w-3xl mx-auto prose prose-gray prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed text-[15px]">
                          <ReactMarkdown>
                            {activeNote.content_markdown}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                        <BookOpen size={28} className="text-gray-300" />
                      </div>
                      <h3 className="text-[18px] font-bold text-gray-400 mb-2">
                        Workspace Empty
                      </h3>
                      <p className="text-[13px] text-gray-300 max-w-xs">
                        Select a note or scan a new board to start learning.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DragDropContext>

        {/* ─── BOTTOM: AI Assistant ─── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-gray-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                <BrainCircuit size={15} className="text-gray-500" />
              </div>
              <h3 className="text-[15px] font-bold text-gray-800">
                AI Study Assistant
              </h3>
            </div>
            {activeTool !== "idle" && (
              <button
                onClick={() => setActiveTool("idle")}
                className="w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg flex items-center justify-center transition-all"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-6">
            {!activeNote || mainMode !== "view" ? (
              /* Locked */
              <div className="flex items-center justify-center gap-4 py-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <Layers size={20} className="text-gray-300" />
                  </div>
                  <p className="text-[13px] font-semibold text-gray-400">
                    Select a note to unlock study tools
                  </p>
                </div>
              </div>
            ) : activeTool !== "idle" ? (
              /* Tool active — full width result */
              <div className="min-h-[200px]">
                {isWorking ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 size={28} className="text-gray-400 animate-spin" />
                    <p className="font-semibold text-[13px] text-gray-400">
                      AI thinking...
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Summary — full width prose */}
                    {activeTool === "summary" && (
                      <div className="prose prose-sm prose-gray prose-p:text-gray-600 prose-headings:font-bold max-w-4xl text-[14px]">
                        <ReactMarkdown>{toolResult}</ReactMarkdown>
                      </div>
                    )}

                    {/* Flashcards — centered card */}
                    {activeTool === "flashcards" && toolResult && (
                      <div className="flex flex-col items-center gap-6 max-w-xl mx-auto">
                        <div className="flex gap-1 w-full">
                          {toolResult.map((_: any, i: number) => (
                            <div
                              key={i}
                              className={clsx(
                                "flex-1 h-1 rounded-full transition-all",
                                i === flashcardIndex
                                  ? "bg-gray-800"
                                  : i < flashcardIndex
                                    ? "bg-gray-300"
                                    : "bg-gray-100",
                              )}
                            />
                          ))}
                        </div>
                        <div
                          className="w-full h-[280px] relative cursor-pointer"
                          style={{ perspective: "1200px" }}
                          onClick={() => setIsFlipped(!isFlipped)}
                        >
                          <div
                            className="w-full h-full absolute transition-transform duration-700 rounded-2xl"
                            style={{
                              transformStyle: "preserve-3d",
                              transform: isFlipped
                                ? "rotateY(180deg)"
                                : "rotateY(0deg)",
                            }}
                          >
                            <div
                              className="absolute inset-0 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center"
                              style={{ backfaceVisibility: "hidden" }}
                            >
                              <span className="absolute top-5 left-6 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                Question
                              </span>
                              <h4 className="text-[18px] font-bold text-gray-800 leading-snug">
                                {toolResult[flashcardIndex]?.front_text ||
                                  toolResult[flashcardIndex]?.front}
                              </h4>
                            </div>
                            <div
                              className="absolute inset-0 bg-gray-900 text-white rounded-2xl flex flex-col items-center justify-center p-8 text-center"
                              style={{
                                backfaceVisibility: "hidden",
                                transform: "rotateY(180deg)",
                              }}
                            >
                              <span className="absolute top-5 left-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                Answer
                              </span>
                              <h4 className="text-[18px] font-bold leading-relaxed">
                                {toolResult[flashcardIndex]?.back_text ||
                                  toolResult[flashcardIndex]?.back}
                              </h4>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsFlipped(false);
                              setTimeout(
                                () =>
                                  setFlashcardIndex(
                                    Math.max(0, flashcardIndex - 1),
                                  ),
                                150,
                              );
                            }}
                            disabled={flashcardIndex === 0}
                            className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center disabled:opacity-30 hover:border-gray-400 transition-all shadow-sm"
                          >
                            <ArrowLeft size={16} />
                          </button>
                          <span className="font-semibold text-[13px] text-gray-500">
                            {flashcardIndex + 1} / {toolResult.length}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsFlipped(false);
                              setTimeout(
                                () =>
                                  setFlashcardIndex(
                                    Math.min(
                                      toolResult.length - 1,
                                      flashcardIndex + 1,
                                    ),
                                  ),
                                150,
                              );
                            }}
                            disabled={flashcardIndex === toolResult.length - 1}
                            className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center disabled:opacity-30 hover:bg-gray-700 transition-all"
                          >
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quiz — full width questions */}
                    {activeTool === "quiz" &&
                      toolResult &&
                      (quizScore !== null ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                          <div className="w-20 h-20 bg-gray-900 rounded-full flex flex-col items-center justify-center">
                            <span className="text-[28px] font-black text-white">
                              {quizScore}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 -mt-1">
                              / {toolResult.length}
                            </span>
                          </div>
                          <h3 className="text-[18px] font-bold text-gray-800">
                            Knowledge Check!
                          </h3>
                          <p className="text-[13px] text-gray-400">
                            Great effort, keep going!
                          </p>
                          <button
                            onClick={() => setActiveTool("idle")}
                            className="mt-2 px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl text-[13px] hover:bg-gray-700 transition-all"
                          >
                            Done
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-5 pb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {toolResult.map((q: any, i: number) => (
                              <div
                                key={i}
                                className="bg-gray-50 rounded-2xl p-5 border border-gray-100"
                              >
                                <h4 className="font-bold text-[13px] text-gray-800 mb-4 flex gap-3">
                                  <span className="text-gray-400 shrink-0">
                                    {i + 1}.
                                  </span>
                                  {q.question}
                                </h4>
                                <div className="flex flex-col gap-2">
                                  {q.options.map((opt: string, oi: number) => {
                                    const picked = userAnswers[i] === opt;
                                    return (
                                      <button
                                        key={oi}
                                        onClick={() =>
                                          setUserAnswers((prev: any) => ({
                                            ...prev,
                                            [i]: opt,
                                          }))
                                        }
                                        className={clsx(
                                          "text-left p-3 rounded-xl text-[12px] font-semibold border-2 transition-all",
                                          picked
                                            ? "border-gray-900 bg-gray-900 text-white"
                                            : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-white",
                                        )}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              let s = 0;
                              toolResult.forEach((q: any, i: number) => {
                                if (userAnswers[i] === q.correctAnswer) s++;
                              });
                              setQuizScore(s);
                            }}
                            disabled={
                              Object.keys(userAnswers).length <
                              toolResult.length
                            }
                            className="w-full py-3 bg-gray-900 text-white font-bold text-[14px] rounded-xl disabled:opacity-50 hover:bg-gray-700 transition-all"
                          >
                            Submit Quiz
                          </button>
                        </div>
                      ))}
                  </>
                )}
              </div>
            ) : (
              /* Tool cards — horizontal 3-col grid */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Bullet Summary */}
                <div
                  onClick={() => startTool("summary")}
                  className="ws-card-hover tool-card-hover bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <BookOpenText size={17} className="text-gray-500" />
                    </div>
                    <ChevronRight
                      size={15}
                      className="text-gray-300 group-hover:text-gray-500 mt-1 transition-colors"
                    />
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-800 mb-1">
                    Bullet Summary
                  </h3>
                  <p className="text-[12px] text-gray-400 leading-relaxed">
                    Turn density into clarity — instant bullet points from your
                    note.
                  </p>
                </div>

                {/* Smart Deck */}
                <div
                  onClick={() => startTool("flashcards")}
                  className="tool-card-hover bg-gray-900 rounded-2xl p-6 cursor-pointer group relative overflow-hidden border border-gray-800"
                >
                  <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-white/5 rounded-full blur-2xl" />
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                      <Layers size={17} className="text-gray-300" />
                    </div>
                    <ChevronRight
                      size={15}
                      className="text-gray-600 group-hover:text-gray-400 mt-1 transition-colors"
                    />
                  </div>
                  <h3 className="text-[15px] font-bold text-white mb-1 relative z-10">
                    Smart Deck
                  </h3>
                  <p className="text-[12px] text-gray-500 leading-relaxed relative z-10">
                    Active recall flashcards for spaced repetition.
                  </p>
                </div>

                {/* Practice Quiz */}
                <div
                  onClick={() => startTool("quiz")}
                  className="ws-card-hover tool-card-hover bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <FileQuestion size={17} className="text-gray-500" />
                    </div>
                    <ChevronRight
                      size={15}
                      className="text-gray-300 group-hover:text-gray-500 mt-1 transition-colors"
                    />
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-800 mb-1">
                    Practice Quiz
                  </h3>
                  <p className="text-[12px] text-gray-400 leading-relaxed">
                    Test yourself with AI-generated multiple choice questions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteModal.isOpen && (
        <div 
          className="backdrop-animate fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={() => setDeleteModal({ isOpen: false, type: "note", id: "", title: "" })}
        >
          <div 
            className="modal-animate bg-white rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with warning icon */}
            <div className="flex flex-col items-center pt-8 pb-4 px-6">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="text-[17px] font-bold text-gray-900 text-center">
                Delete {deleteModal.type === "note" ? "Note" : "Folder"}?
              </h3>
              <p className="text-[13px] text-gray-500 text-center mt-2 leading-relaxed max-w-[280px]">
                {deleteModal.type === "note" ? (
                  <>Are you sure you want to delete <span className="font-semibold text-gray-700">&ldquo;{deleteModal.title}&rdquo;</span>? This action cannot be undone.</>
                ) : (
                  <>Are you sure you want to delete the folder <span className="font-semibold text-gray-700">&ldquo;{deleteModal.title}&rdquo;</span>? Notes inside will become uncategorized.</>
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 pb-6 pt-2">
              <button
                onClick={() => setDeleteModal({ isOpen: false, type: "note", id: "", title: "" })}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[13px] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-[13px] rounded-xl transition-colors shadow-sm shadow-red-200 flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
