"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { format, parseISO } from "date-fns";
import {
  BookOpen,
  Search,
  MoreVertical,
  FileText,
  Tag as TagIcon,
  Trash2,
  Edit3,
  Loader2,
  Calendar as CalendarIcon,
  PlayCircle,
  PauseCircle,
  StopCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import clsx from "clsx";

interface NoteData {
  id: string;
  title: string;
  content_markdown: string;
  tags: string[];
  created_at: string;
}

export default function SmartNotesPage() {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Selected note for viewing
  const [selectedNote, setSelectedNote] = useState<NoteData | null>(null);

  // TTS States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const supabase = createClient();

  // Cleanup TTS on unmount or note change
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, [selectedNote]);

  const handlePlayTTS = () => {
    if (!selectedNote) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel(); // Reset

    // Clean markdown specifically for voice reading
    const cleanText = selectedNote.content_markdown
      .replace(/[#*`_]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // extract text from links
      .replace(/!\[[^\]]*\]\([^)]+\)/g, "") // remove images
      .replace(/---/g, " ")
      .replace(/\n\n/g, ". ");

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Prefer Indonesian or default OS voice
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find(
      (v) => v.lang.includes("id-ID") || v.lang.includes("id"),
    );
    if (indonesianVoice) utterance.voice = indonesianVoice;

    utterance.rate = 1.0; // Normal speed

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handleStopTTS = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setNotes(data);
        // Automatically select the first note if exists
        if (data.length > 0 && !selectedNote) {
          setSelectedNote(data[0]);
        }
      }
    }
    setIsLoading(false);
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this note?")) return;

    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (!error) {
      setNotes(notes.filter((note) => note.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    }
  };

  const filterNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.tags &&
        note.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        )),
  );

  return (
    <div className="flex h-full font-sans bg-[#fbfcff] overflow-hidden -mx-6 md:-mx-10 -mt-6 md:-mt-10 mb-[-40px]">
      {/* LEFT PANEL: Note List */}
      <div className="w-full md:w-[350px] lg:w-[400px] bg-white border-r border-gray-100/80 flex flex-col h-screen shrink-0 relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Header Area */}
        <div className="p-6 md:p-8 border-b border-gray-100/60 shrink-0 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="text-[22px] font-bold text-gray-900 leading-tight">
                Smart Notes
              </h1>
              <p className="text-[12px] text-gray-500">
                {notes.length} total documents
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8f9fc] border border-gray-200/60 text-gray-900 text-[13px] rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder-gray-400 font-medium"
              placeholder="Search notes or tags..."
            />
          </div>
        </div>

        {/* Notes List Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3 bg-[#fbfcff]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 size={24} className="animate-spin mb-3 text-blue-400" />
              <p className="text-[13px] font-medium">Loading notes...</p>
            </div>
          ) : filterNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm mb-4">
                <FileText size={24} className="text-gray-300" />
              </div>
              <h3 className="text-[15px] font-bold text-gray-700 mb-1">
                No notes found
              </h3>
              <p className="text-[12px] text-gray-500">
                Scan something using AI Scanner to see it here.
              </p>
            </div>
          ) : (
            filterNotes.map((note) => {
              const isSelected = selectedNote?.id === note.id;

              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={clsx(
                    "p-4 rounded-[20px] cursor-pointer transition-all duration-300 border group block relative overflow-hidden",
                    isSelected
                      ? "bg-white border-blue-200 shadow-[0_8px_30px_-12px_rgba(45,115,255,0.15)] ring-1 ring-blue-100"
                      : "bg-white border-transparent hover:border-gray-200 hover:shadow-sm",
                  )}
                >
                  {/* Selection Indicator Strip */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600"></div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                    <h3
                      className={clsx(
                        "font-bold text-[15px] line-clamp-1 pr-4",
                        isSelected ? "text-blue-900" : "text-gray-900",
                      )}
                    >
                      {note.title}
                    </h3>
                    <button
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="text-[12px] text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                    {note.content_markdown.substring(0, 100)}...
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5 flex-wrap">
                      {note.tags &&
                        note.tags.slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-blue-50/50 text-blue-600 rounded-md text-[10px] font-bold tracking-wider uppercase border border-blue-100/50"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                    <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                      <CalendarIcon size={10} />{" "}
                      {format(parseISO(note.created_at), "MMM d, yy")}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Note Viewer */}
      <div className="flex-1 h-screen overflow-y-auto bg-white relative hidden md:block">
        {!selectedNote ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50/30">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6">
              <FileText size={40} className="text-gray-200" />
            </div>
            <h2 className="text-[24px] font-bold text-gray-800 mb-2 tracking-tight">
              Select a note to read
            </h2>
            <p className="text-[15px] text-gray-500 max-w-sm">
              Choose a document from the sidebar to view its perfectly formatted
              Markdown contents.
            </p>
          </div>
        ) : (
          <div className="max-w-[800px] mx-auto p-12 lg:p-16">
            {/* Note Header Metadata */}
            <div className="mb-10 pb-8 border-b border-gray-100">
              <div className="flex gap-2 mb-4">
                {selectedNote.tags &&
                  selectedNote.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-[11px] font-bold tracking-wider uppercase"
                    >
                      <TagIcon size={10} /> {tag}
                    </span>
                  ))}
              </div>

              <h1 className="text-[36px] font-bold text-gray-900 tracking-tight leading-[1.1] mb-4">
                {selectedNote.title}
              </h1>

              <div className="flex items-center gap-4 text-[13px] font-medium text-gray-500 mb-8">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon size={14} className="text-gray-400" /> Created{" "}
                  {format(parseISO(selectedNote.created_at), "MMMM do, yyyy")}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <button className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 transition-colors">
                  <Edit3 size={14} /> Edit Title
                </button>
              </div>

              {/* TTS Voice Buddy UI */}
              <div className="flex flex-col sm:flex-row bg-[#fbfcff] border border-blue-100/50 rounded-2xl p-4 sm:items-center justify-between mb-8 shadow-[0_4px_20px_-10px_rgba(45,115,255,0.1)] gap-4 transition-all">
                <div className="flex items-center gap-3">
                  <div
                    className={clsx(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm",
                      isPlaying
                        ? "bg-blue-500 text-white animate-pulse"
                        : "bg-white text-blue-500 border border-blue-100",
                    )}
                  >
                    {isPlaying ? (
                      <div className="flex items-end gap-1 h-4">
                        <span
                          className="w-1 h-full bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></span>
                        <span
                          className="w-1 h-2/3 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></span>
                        <span
                          className="w-1 h-full bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></span>
                      </div>
                    ) : (
                      <PlayCircle size={22} />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-[14px] flex items-center gap-2">
                      Voice-First Study Buddy
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-[9px] uppercase tracking-wider">
                        AI Feature
                      </span>
                    </h4>
                    <p className="text-[12px] text-gray-500 font-medium">
                      Listen to your notes while on the go.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePlayTTS}
                    className={clsx(
                      "px-4 py-2.5 font-bold rounded-xl text-[13px] transition-colors flex items-center gap-2 flex-1 justify-center sm:flex-none",
                      isPlaying
                        ? "bg-amber-100 hover:bg-amber-200 text-amber-700"
                        : "bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20",
                    )}
                  >
                    {isPlaying ? (
                      <>
                        <PauseCircle size={16} /> Pause Audio
                      </>
                    ) : (
                      <>
                        <PlayCircle size={16} />{" "}
                        {isPaused ? "Resume Audio" : "Play Audio"}
                      </>
                    )}
                  </button>

                  {(isPlaying || isPaused) && (
                    <button
                      onClick={handleStopTTS}
                      className="p-2.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors shrink-0"
                      title="Stop"
                    >
                      <StopCircle size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Note Body (Markdown) */}
            <div
              className="prose prose-purple max-w-none 
                 prose-headings:font-bold prose-h1:text-[28px] prose-h2:text-[22px] prose-h3:text-[18px] 
                 prose-a:text-blue-500 hover:prose-a:text-blue-600
                 prose-li:text-gray-600 prose-p:text-gray-600 prose-p:leading-relaxed
                 prose-strong:text-gray-900 prose-strong:font-bold
                 prose-blockquote:border-l-4 prose-blockquote:border-purple-200 prose-blockquote:bg-purple-50/50 prose-blockquote:rounded-r-xl prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:text-gray-700
                 text-[16px]"
            >
              <ReactMarkdown>{selectedNote.content_markdown}</ReactMarkdown>
            </div>

            <div className="mt-20 pt-8 border-t border-gray-100 flex justify-center opacity-50">
              <div className="w-12 h-1 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
