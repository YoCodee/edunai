"use client";

import {
  CheckCircle2,
  FileText,
  Calendar,
  BrainCircuit,
  Users,
  MessageSquare,
} from "lucide-react";

export default function BeforeAfter() {
  return (
    <section className="bg-[#fbfcff] py-24 relative overflow-hidden font-sans border-t border-gray-100 px-6">
      <div className="max-w-[1200px] mx-auto text-center relative z-10">
        {/* Header */}
        <div className="mb-20">
          <div className="inline-flex items-center gap-2 text-[12px] font-bold text-gray-400 tracking-widest uppercase mb-6 bg-white px-4 py-1.5 rounded-full border border-gray-200">
            Before <span className="mx-1">→</span> After
          </div>
          <h2
            className="text-[42px] md:text-[56px] font-medium leading-[1.05] tracking-tight text-[#1a1c20] max-w-3xl mx-auto mb-6"
            style={{ fontFamily: "serif" }} // Giving it that premium serif look from the reference
          >
            From a chaotic semester to a <br className="hidden md:block" />{" "}
            streamlined academic life
          </h2>
          <p className="text-[17px] text-gray-500 max-w-xl mx-auto leading-relaxed">
            Clearer schedules, no missed deadlines, and your study group always
            on the same page — without switching between 5 different apps.
          </p>
        </div>

        {/* Diagram Area */}
        <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full max-w-[1000px] mx-auto min-h-[400px]">
          {/* LEFT SIDE: Scattered Bubbles (Before) */}
          <div className="relative w-full md:w-[350px] h-[300px] flex items-center justify-center">
            {/* SVG Connecting dashed lines (Left) */}
            <svg
              className="absolute inset-0 w-full h-full z-0 opacity-20 pointer-events-none"
              style={{ filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.1))" }}
            >
              {/* Center point approximately at x:100%, y:50% */}
              <path
                d="M 50 80 Q 200 150 350 150"
                fill="none"
                stroke="gray"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d="M 80 160 Q 200 150 350 150"
                fill="none"
                stroke="gray"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d="M 60 220 Q 200 150 350 150"
                fill="none"
                stroke="gray"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d="M 220 50 Q 280 150 350 150"
                fill="none"
                stroke="gray"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d="M 220 250 Q 280 150 350 150"
                fill="none"
                stroke="gray"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>

            {/* Scattered Pills */}
            <div className="absolute top-[15%] left-[10%] bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-500 text-[13px] font-medium px-4 py-2 rounded-full shadow-sm rotate-[-5deg]">
              WhatsApp Groups
            </div>
            <div className="absolute top-[8%] right-[25%] bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-500 text-[13px] font-medium px-4 py-2 rounded-full shadow-sm rotate-[4deg]">
              Loose Papers
            </div>
            <div className="absolute top-[40%] left-[5%] bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-500 text-[13px] font-medium px-4 py-2 rounded-full shadow-sm">
              Google Calendar
            </div>
            <div className="absolute top-[42%] right-[10%] bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-500 text-[13px] font-medium px-4 py-2 rounded-full shadow-sm rotate-[8deg]">
              Trello / Asana
            </div>
            <div className="absolute bottom-[28%] left-[15%] bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-600 text-[14px] font-bold px-5 py-2.5 rounded-full shadow-sm rotate-[-3deg]">
              IMG_4092.JPG
            </div>
            <div className="absolute bottom-[25%] right-[20%] bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-500 text-[13px] font-medium px-4 py-2 rounded-full shadow-sm rotate-[12deg]">
              Notion Links
            </div>
            <div className="absolute bottom-[5%] left-[30%] bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-500 text-[13px] font-medium px-4 py-2 rounded-full shadow-sm">
              Sticky Notes
            </div>
          </div>

          {/* CENTER: The App Hub */}
          <div className="relative z-20 flex-shrink-0 mx-4">
            <div className="w-[140px] h-[140px] bg-gradient-to-br from-[#fca03e] to-[#ffb05c] rounded-[32px] shadow-[0_20px_40px_rgba(252,160,62,0.4)] flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
              {/* Simulated 'Edunai' Logo Text */}
              <span
                className="text-white text-[28px] font-bold"
                style={{ fontFamily: "serif" }}
              >
                Edunai
              </span>
            </div>
            <p className="text-[13px] font-bold text-gray-500 mt-6 tracking-wide">
              Your Academic Hub
            </p>
          </div>

          {/* RIGHT SIDE: Structured List (After) */}
          <div className="relative w-full md:w-[380px] h-[300px] flex items-center">
            {/* SVG Connecting dashed lines (Right) */}
            <svg
              className="absolute inset-0 w-full h-full z-0 opacity-20 pointer-events-none"
              style={{ filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.05))" }}
            >
              {/* Center point approximately at x:0%, y:50% */}
              <path
                d="M 0 150 L 40 150 L 40 40 L 70 40"
                fill="none"
                stroke="gray"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d="M 0 150 L 40 150 L 40 95 L 70 95"
                fill="none"
                stroke="gray"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d="M 0 150 L 70 150"
                fill="none"
                stroke="gray"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d="M 0 150 L 40 150 L 40 205 L 70 205"
                fill="none"
                stroke="gray"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d="M 0 150 L 40 150 L 40 260 L 70 260"
                fill="none"
                stroke="gray"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            </svg>

            {/* Structured Items */}
            <div className="w-full flex flex-col gap-[18px] ml-[70px] relative z-10 text-left">
              <div className="flex items-center gap-3 bg-white pl-1 pr-4 py-1.5 rounded-full border border-gray-100 shadow-sm w-fit hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                  <Calendar size={14} strokeWidth={2.5} />
                </div>
                <span className="text-[14px] font-bold text-gray-800">
                  Smart schedule & tasks sync
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white pl-1 pr-4 py-1.5 rounded-full border border-gray-100 shadow-sm w-fit hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                  <Users size={14} strokeWidth={2.5} />
                </div>
                <span className="text-[14px] font-bold text-gray-800">
                  Unified group project board
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white pl-1 pr-4 py-1.5 rounded-full border border-gray-100 shadow-sm w-fit hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                  <FileText size={14} strokeWidth={2.5} />
                </div>
                <span className="text-[14px] font-bold text-gray-800">
                  Files (structured & OCR searchable)
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white pl-1 pr-4 py-1.5 rounded-full border border-gray-100 shadow-sm w-fit hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                  <MessageSquare size={14} strokeWidth={2.5} />
                </div>
                <span className="text-[14px] font-bold text-gray-800">
                  Real-time team discussions
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white pl-1 pr-4 py-1.5 rounded-full border border-gray-100 shadow-sm w-fit hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                  <BrainCircuit size={14} strokeWidth={2.5} />
                </div>
                <span className="text-[14px] font-bold text-gray-800">
                  Auto-generated Flashcards
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
