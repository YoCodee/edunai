"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ReactMarkdown from "react-markdown";
import {
  BrainCircuit,
  BookOpenText,
  FileQuestion,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  RefreshCw,
  X,
} from "lucide-react";
import clsx from "clsx";
import { generateStudyMaterial } from "./actions";

interface AssistantClientProps {
  notes: any[];
  initialStudySets: any[];
}

export default function AssistantClient({
  notes,
  initialStudySets,
}: AssistantClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedNote, setSelectedNote] = useState<any>(null);

  // 'idle' | 'summarizing' | 'flashcards' | 'quiz'
  const [activeTask, setActiveTask] = useState<string>("idle");
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  // Flashcard specific state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz specific state
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: string;
  }>({});

  useGSAP(
    () => {
      gsap.from(".anim-header", {
        y: -30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });

      gsap.from(".anim-card", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.2)",
        delay: 0.2,
      });
    },
    { scope: containerRef },
  );

  const handleAction = async (type: "summary" | "flashcards" | "quiz") => {
    if (!selectedNote) return;

    setActiveTask(type);
    setIsProcessing(true);
    setResultData(null);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSelectedAnswers({});
    setQuizScore(null);

    const result = await generateStudyMaterial(selectedNote.id, type);

    if (result.success) {
      if (type === "summary") {
        setResultData(result.data); // markdown string
      } else if (type === "flashcards") {
        setResultData(result.flashcards); // array of { front_text, back_text }
      } else if (type === "quiz") {
        setResultData(result.data); // array of quiz questions
      }
    } else {
      alert("Error: " + result.error);
      setActiveTask("idle");
    }

    setIsProcessing(false);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const renderFlashcards = () => {
    if (!resultData || activeTask !== "flashcards") return null;
    const currentCard = resultData[currentCardIndex];

    return (
      <div className="flex flex-col items-center justify-center py-10 anim-fade-in w-full max-w-2xl mx-auto">
        {/* Progress */}
        <div className="flex justify-between items-center w-full mb-6 text-gray-500 font-bold text-[14px]">
          <span>
            Flashcard {currentCardIndex + 1} of {resultData.length}
          </span>
          <div className="flex gap-2">
            {resultData.map((_: any, i: number) => (
              <div
                key={i}
                className={clsx(
                  "w-8 h-2 rounded-full transition-colors",
                  i === currentCardIndex
                    ? "bg-[#38bcfc]"
                    : i < currentCardIndex
                      ? "bg-[#38bcfc]/30"
                      : "bg-gray-200",
                )}
              ></div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div
          className="relative w-full h-80 rounded-[32px] cursor-pointer"
          style={{ perspective: "1000px" }}
        >
          <div
            onClick={handleFlip}
            className={clsx(
              "w-full h-full absolute transition-all duration-700",
            )}
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front */}
            <div
              className="absolute w-full h-full bg-gradient-to-br from-white to-blue-50/50 rounded-[32px] shadow-xl border border-blue-100 flex flex-col items-center justify-center p-10 backface-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              <span className="absolute top-6 left-8 text-[12px] font-bold text-blue-400 uppercase tracking-widest">
                Question
              </span>
              <Sparkles
                className="absolute top-6 right-8 text-blue-300 opacity-50"
                size={24}
              />

              <h3 className="text-2xl font-bold text-gray-800 text-center leading-relaxed">
                {currentCard?.front_text || currentCard?.front}
              </h3>

              <div className="absolute bottom-6 flex items-center gap-2 text-gray-400 text-[13px] font-semibold">
                <RefreshCw size={14} className="animate-spin-slow" /> Tap to
                reveal answer
              </div>
            </div>

            {/* Back */}
            <div
              className="absolute w-full h-full bg-gradient-to-br from-[#1a1c20] to-[#2d3036] rounded-[32px] shadow-2xl border border-gray-800 flex flex-col items-center justify-center p-10 backface-hidden"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <span className="absolute top-6 left-8 text-[12px] font-bold text-[#fca03e] uppercase tracking-widest">
                Answer
              </span>
              <CheckCircle2
                className="absolute top-6 right-8 text-green-400"
                size={24}
              />

              <div className="text-xl font-medium text-white text-center leading-relaxed">
                {currentCard?.back_text || currentCard?.back}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mt-10">
          <button
            onClick={() => {
              setIsFlipped(false);
              setTimeout(
                () => setCurrentCardIndex(Math.max(0, currentCardIndex - 1)),
                150,
              );
            }}
            disabled={currentCardIndex === 0}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 text-gray-500 hover:text-[#38bcfc] hover:border-[#38bcfc] transition-all disabled:opacity-30"
          >
            <ArrowLeft size={24} />
          </button>

          <button
            onClick={() => {
              setIsFlipped(false);
              setTimeout(
                () =>
                  setCurrentCardIndex(
                    Math.min(resultData.length - 1, currentCardIndex + 1),
                  ),
                150,
              );
            }}
            disabled={currentCardIndex === resultData.length - 1}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 text-gray-500 hover:text-[#38bcfc] hover:border-[#38bcfc] transition-all disabled:opacity-30"
          >
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    if (!resultData || activeTask !== "quiz") return null;

    if (quizScore !== null) {
      return (
        <div className="flex flex-col items-center justify-center py-10 anim-fade-in w-full max-w-2xl mx-auto">
          <div className="w-40 h-40 bg-gradient-to-br from-green-400 to-[#38bcfc] rounded-full flex items-center justify-center shadow-2xl shadow-green-400/30 mb-8">
            <span className="text-5xl font-black text-white">
              {quizScore}/{resultData.length}
            </span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">
            Quiz Completed!
          </h2>
          <p className="text-gray-500 font-medium mb-10">
            You've successfully finished analyzing your knowledge on this topic.
          </p>

          <button
            onClick={() => setActiveTask("idle")}
            className="px-8 py-3 bg-[#1a1c20] text-white font-bold rounded-xl hover:bg-black transition-colors"
          >
            Back to Assistant
          </button>
        </div>
      );
    }

    return (
      <div className="w-full max-w-3xl mx-auto anim-fade-in pb-10">
        <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
            <div>
              <span className="text-[13px] font-bold text-[#fca03e] uppercase tracking-wider block mb-2">
                Practice Quiz
              </span>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedNote.title}
              </h2>
            </div>
            <div className="text-gray-400 font-bold text-[14px] bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              {Object.keys(selectedAnswers).length} / {resultData.length}{" "}
              Answered
            </div>
          </div>

          <div className="space-y-10">
            {resultData.map((q: any, i: number) => (
              <div key={i} className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  {q.question}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-11">
                  {q.options.map((opt: string, optIdx: number) => {
                    const isSelected = selectedAnswers[i] === opt;
                    return (
                      <button
                        key={optIdx}
                        onClick={() =>
                          setSelectedAnswers((prev) => ({ ...prev, [i]: opt }))
                        }
                        className={clsx(
                          "text-left p-4 rounded-2xl border-2 transition-all font-medium",
                          isSelected
                            ? "border-[#38bcfc] bg-blue-50/50 text-gray-900"
                            : "border-gray-100 hover:border-blue-200 text-gray-600 hover:bg-gray-50/50",
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

          <div className="mt-12 pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => {
                let score = 0;
                resultData.forEach((q: any, i: number) => {
                  if (selectedAnswers[i] === q.correctAnswer) score++;
                });
                setQuizScore(score);
              }}
              disabled={Object.keys(selectedAnswers).length < resultData.length}
              className="px-8 py-3.5 bg-gradient-to-r from-[#fca03e] to-[#ffb05c] hover:shadow-lg hover:shadow-orange-400/20 text-[#1a1c20] font-black rounded-xl transition-all disabled:opacity-50 disabled:hover:shadow-none flex items-center gap-2"
            >
              Submit Answers <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    if (!resultData || activeTask !== "summary") return null;
    return (
      <div className="w-full max-w-3xl mx-auto anim-fade-in">
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#fca03e] flex items-center justify-center">
                <BookOpenText size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  AI Summary
                </h2>
                <p className="text-gray-500 text-[13px] font-medium">
                  {selectedNote.title}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTask("idle")}
              className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="prose prose-gray max-w-none md:prose-lg font-medium prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-800 marker:text-gray-300">
            <ReactMarkdown>{resultData}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full pb-20" ref={containerRef}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-600 font-extrabold text-[11px] uppercase tracking-wider mb-3 anim-header">
            <BrainCircuit size={14} /> AI Powered
          </div>
          <h1 className="text-4xl font-black text-[#1a1c20] tracking-tight anim-header">
            Study Assistant
          </h1>
          <p className="text-gray-500 font-medium mt-2 max-w-xl text-[15px] anim-header">
            Transform your notes into active learning materials. AI generates
            summaries, practice quizzes, and interactive flashcards instantly.
          </p>
        </div>
      </div>

      {isProcessing && (
        <div className="flex flex-col items-center justify-center py-32 anim-fade-in">
          <div className="w-24 h-24 relative mb-6">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#38bcfc] border-t-transparent rounded-full animate-spin"></div>
            <BrainCircuit
              className="absolute inset-0 m-auto text-[#38bcfc] animate-pulse"
              size={32}
            />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Analyzing your notes...
          </h3>
          <p className="text-gray-500 font-medium">
            Gemini AI is crafting your study materials.
          </p>
        </div>
      )}

      {!isProcessing && activeTask === "idle" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 anim-fade-in">
          {/* Note Selector */}
          <div className="col-span-1 lg:col-span-4 bg-white border border-gray-200/50 rounded-[32px] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] anim-card">
            <h3 className="text-[14px] font-bold text-gray-400 uppercase tracking-widest mb-6">
              Select a Note Source
            </h3>

            {notes.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 font-medium text-[14px]">
                  You don't have any notes yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {notes.map((note) => {
                  const isSelected = selectedNote?.id === note.id;
                  return (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      className={clsx(
                        "p-4 rounded-2xl border-2 transition-all cursor-pointer group",
                        isSelected
                          ? "border-[#fca03e] bg-orange-50/50"
                          : "border-gray-100 hover:border-gray-300 bg-white hover:shadow-md",
                      )}
                    >
                      <h4
                        className={clsx(
                          "font-bold text-[15px] mb-1 leading-snug transition-colors",
                          isSelected
                            ? "text-gray-900"
                            : "text-gray-700 group-hover:text-gray-900",
                        )}
                      >
                        {note.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[12px] font-semibold text-gray-400">
                        <span>
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Cards */}
          <div className="col-span-1 lg:col-span-8">
            {!selectedNote ? (
              <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[32px] anim-card">
                <Layers
                  size={48}
                  className="text-gray-300 mb-6"
                  strokeWidth={1.5}
                />
                <h3 className="text-xl font-bold text-gray-500">
                  Pick a note to get started
                </h3>
                <p className="text-gray-400 font-medium mt-2">
                  The AI assistant is waiting to process your materials.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                {/* Generate Flashcards */}
                <div
                  onClick={() => handleAction("flashcards")}
                  className="bg-gradient-to-br from-[#1a1c20] to-[#2d3036] rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group cursor-pointer anim-card hover:scale-[1.02] transition-transform"
                >
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>

                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-blue-300 mb-8 border border-white/10 shadow-inner">
                    <Layers size={24} strokeWidth={2.5} />
                  </div>

                  <h3 className="text-2xl font-bold mb-3">
                    Interactive Flashcards
                  </h3>
                  <p className="text-gray-400 font-medium leading-relaxed mb-8">
                    Let AI extract the key concepts and terms from your note and
                    turn them into a flip-card deck for spaced repetition study.
                  </p>

                  <div className="flex items-center gap-3 text-[#38bcfc] font-bold mt-auto pt-4 group-hover:translate-x-2 transition-transform">
                    Generate Deck <ArrowRight size={18} />
                  </div>
                </div>

                <div className="grid grid-rows-2 gap-6">
                  {/* Summarize */}
                  <div
                    onClick={() => handleAction("summary")}
                    className="bg-white border border-gray-200/50 rounded-[32px] p-6 md:p-8 flex items-center justify-between shadow-[0_4px_20px_rgb(0,0,0,0.02)] group cursor-pointer hover:border-gray-300 hover:shadow-lg transition-all anim-card"
                  >
                    <div>
                      <div className="w-10 h-10 bg-orange-50 text-[#fca03e] rounded-xl flex items-center justify-center mb-4">
                        <BookOpenText size={20} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Quick Summary
                      </h3>
                      <p className="text-gray-500 text-[13px] font-medium hidden md:block">
                        Condense long notes into bullet points.
                      </p>
                    </div>
                    <ChevronRight
                      className="text-gray-300 group-hover:text-[#fca03e] group-hover:translate-x-1 transition-all"
                      size={24}
                    />
                  </div>

                  {/* Quiz */}
                  <div
                    onClick={() => handleAction("quiz")}
                    className="bg-white border border-gray-200/50 rounded-[32px] p-6 md:p-8 flex items-center justify-between shadow-[0_4px_20px_rgb(0,0,0,0.02)] group cursor-pointer hover:border-gray-300 hover:shadow-lg transition-all anim-card"
                  >
                    <div>
                      <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center mb-4">
                        <FileQuestion size={20} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Practice Quiz
                      </h3>
                      <p className="text-gray-500 text-[13px] font-medium hidden md:block">
                        Test your knowledge with multiple choice.
                      </p>
                    </div>
                    <ChevronRight
                      className="text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all"
                      size={24}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Render Results */}
      {!isProcessing && activeTask !== "idle" && (
        <div className="w-full mt-4 anim-fade-in">
          {renderFlashcards()}
          {renderSummary()}
          {renderQuiz()}
        </div>
      )}
    </div>
  );
}
