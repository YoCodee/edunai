"use client";

import { Check, Clock } from "lucide-react";
import Logoedu from "@/public/images/logoedunai.svg";
import Image from "next/image";
const Hero = () => {
  return (
    <section className="relative pt-[50px] pb-32 overflow-hidden px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto min-h-[700px] rounded-[40px] dot-pattern relative flex flex-col items-center justify-center py-40 px-4 shadow-[0_0_0_1px_rgba(0,0,0,0.05)] bg-[#fbfbfb]">
        {/* CENTER FLOATING LOGO BOX */}
        <div className="w-[88px] h-[88px] bg-white rounded-[24px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.15)] flex items-center justify-center mb-12 relative z-10 border border-black/[0.03]">
          <div>
            <Image src={Logoedu} alt="Edunai Logo" width={56} height={56} />
          </div>
        </div>

        {/* MAIN TEXT */}
        <h1 className="text-[52px] md:text-[80px] font-medium leading-[1.05] text-center tracking-[-0.03em] text-foreground max-w-[800px] z-10">
          The brilliant AI brain <br className="hidden md:block" />
          <span className="text-[#a1a1aa]">for your studies</span>
        </h1>

        <p className="mt-8 text-[18px] text-foreground/60 text-center font-medium z-10 max-w-2xl px-4">
          Turn scattered photos into smart notes, generate flashcards instantly,
          and collaborate on projects with AI task breakdowns.
        </p>

        <button className="mt-10 px-8 py-4 bg-primary text-white rounded-[16px] text-[15px] font-semibold hover:opacity-95 transition-all shadow-[0_8px_20px_-6px_rgba(45,115,255,0.4)] z-10">
          Get free demo
        </button>

        {/* 1. TOP LEFT: AI Board Scanner */}
        <div className="absolute top-[12%] left-[4%] lg:left-[8%] hidden lg:block z-0">
          {/* Back shadow element */}
          <div className="absolute w-[220px] h-[240px] bg-white rounded-2xl shadow-xl rotate-[-8deg] top-0 left-0 border border-black/5 opacity-50"></div>
          {/* Main Card */}
          <div className="w-[220px] bg-white rounded-2xl shadow-2xl relative transform rotate-[-4deg] border border-gray-100 p-4">
            {/* Scanner viewfinder UI */}
            <div className="w-full h-[120px] bg-gray-50 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden border border-gray-100">
              <div className="absolute inset-0 bg-blue-500/10 opacity-30 animate-pulse"></div>
              <div className="absolute top-0 w-full h-[2px] bg-blue-500 shadow-[0_0_8px_2px_rgba(59,130,246,0.6)] animate-[scan_2s_ease-in-out_infinite]"></div>
              <div className="text-[10px] font-bold text-gray-400 absolute top-2 left-2">
                Whiteboard
              </div>
              <div className="font-[Caveat] text-[#222] text-[18px] transform -rotate-12 opacity-60">
                E = mc² + ...
              </div>
            </div>

            <div className="flex gap-2 mb-2 items-center">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 12 5 5L20 7" />
                </svg>
              </div>
              <span className="text-[12px] font-bold text-gray-900">
                Extracted & Saved!
              </span>
            </div>
            <p className="text-[10px] text-gray-500 leading-snug">
              AI converted your photo into formatted Markdown notes.
            </p>
          </div>
        </div>

        {/* 2. TOP RIGHT: AI Flashcards & Study */}
        <div className="absolute top-[10%] right-[6%] lg:right-[10%] hidden xl:block z-0">
          <div className="w-[240px]  bg-white p-5 rounded-2xl shadow-xl shadow-purple-500/20 rotate-[6deg] relative text-black">
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg transform rotate-12">
              ✨
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="font-bold text-[14px]">Q</span>
              </div>
              <span className="text-[13px] font-bold tracking-wide">
                Interactive Flashcards
              </span>
            </div>

            <div className="bg-gray-50 shadow-2xl text-gray-900 rounded-xl p-4 shadow-inner mb-3 transform rotate-[-2deg]">
              <p className="text-[11px] font-bold text-gray-400 mb-1">FRONT</p>
              <h4 className="font-bold text-[13px] leading-snug mb-2">
                What is the capital of France?
              </h4>
              <div className="flex items-center gap-1.5 opacity-40">
                <div className="h-1 flex-1 bg-gray-200 rounded-full"></div>
                <div className="h-1 w-1/4 bg-gray-200 rounded-full"></div>
              </div>
            </div>

            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] bg-white/20 px-2 py-1 rounded font-semibold backdrop-blur-sm">
                Flip Card
              </span>
              <span className="text-[10px] font-medium opacity-80">
                12 / 20 Remaining
              </span>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM LEFT: Collaborative Kanban Boards */}
        <div className="absolute bottom-[5%] left-[4%] lg:left-[8%] hidden lg:block z-0">
          <div className="w-[340px] bg-[#f8f9fa] rounded-3xl shadow-xl border border-black/5 rotate-[-2deg] relative p-6 pt-5">
            {/* Fake cursor arrow interaction */}
            <div className="absolute bottom-6 right-8 w-6 h-6 z-20 opacity-70">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.5 3.21V20.81L10.74 15.5H19.29L5.5 3.21Z"
                  fill="#111"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-[16px] text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>{" "}
                Proyek Akhir
              </h3>
              <div className="flex -space-x-1.5 cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-blue-600">
                  A
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-emerald-600">
                  B
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Task 1 */}
              <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-move transform rotate-1 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <span className="text-[12px] font-bold text-gray-800 leading-snug pr-4">
                    Riset Jurnal Literatur
                  </span>
                  <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[9px] font-bold rounded">
                    High
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-[8px] font-bold flex flex-center items-center justify-center">
                    A
                  </div>
                  <span className="text-[9px] text-gray-400 font-medium font-mono">
                    Assigned
                  </span>
                </div>
              </div>

              {/* Task 2 */}
              <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 transform -rotate-1 opacity-60 grayscale hover:grayscale-0 transition-all">
                <div className="flex items-start justify-between">
                  <span className="text-[12px] font-bold text-gray-800 leading-snug line-through text-gray-400">
                    Draft Proposal Bab 1
                  </span>
                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-bold rounded line-through">
                    Done
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. BOTTOM RIGHT: Smart AI Planner */}
        <div className="absolute bottom-[8%] right-[5%] lg:right-[10%] hidden lg:block z-0">
          <div className="w-[300px] bg-white rounded-3xl shadow-xl border border-black/5 rotate-[4deg] relative p-5">
            <h3 className="font-bold text-[14px] mb-4 text-foreground flex items-center gap-2">
              <Clock size={16} className="text-[#38bcfc]" /> AI Smart Planner
            </h3>

            <div className="relative pl-5 before:absolute before:inset-0 before:left-2.5 before:w-px before:bg-gray-100 mb-2">
              <div className="absolute left-[7px] top-1 w-2.5 h-2.5 rounded-full bg-[#fca03e] outline outline-4 outline-white"></div>
              <h4 className="text-[12px] font-bold text-gray-900 leading-tight">
                Calculus Study Session
              </h4>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                10:00 AM - 12:00 PM
              </p>
              <div className="mt-2 bg-orange-50/50 border border-orange-100 rounded-lg p-2 flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded text-[9px] font-bold uppercase">
                  AI Suggestion
                </span>
                <p className="text-[9px] font-medium text-orange-700/80 leading-tight">
                  Focus on Chapter 4 derivatives first.
                </p>
              </div>
            </div>

            <div className="relative pl-5 before:absolute before:inset-0 before:left-2.5 before:w-px before:bg-gray-100">
              <div className="absolute left-[7px] top-1 w-2.5 h-2.5 rounded-full bg-gray-300 outline outline-4 outline-white"></div>
              <h4 className="text-[12px] font-bold text-gray-500 leading-tight">
                Lunch Break
              </h4>
              <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
                12:00 PM - 01:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
