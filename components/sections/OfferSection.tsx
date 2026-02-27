"use client";

import React from "react";
import {
  Play,
  Square,
  Pause,
  MoreHorizontal,
  ArrowRight,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Search,
  BrainCircuit,
} from "lucide-react";

export default function OfferSection() {
  return (
    <section className="bg-[#fbfcff] py-24 relative font-sans">
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        {/* Header matching Solutions section style */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="px-5 py-2 bg-white rounded-full border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-sm font-medium text-gray-600 mb-8 inline-flex items-center">
            Features
          </div>
          <h2 className="text-[40px] md:text-[50px] font-medium leading-[1.1] tracking-tight text-[#1a1c20] max-w-2xl mb-4">
            Everything in one workspace
          </h2>
          <p className="text-[17px] text-gray-500 max-w-lg mx-auto">
            Forget switching between scattered apps. Edunai integrates your
            entire academic life seamlessly.
          </p>
        </div>

        {/* CSS Grid for the layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-[1100px] mx-auto">
          {/* Top Left: Collaboration (Col-span 5 or 6) */}
          <div className="md:col-span-5 bg-white rounded-[32px] border border-gray-100 p-8 pt-12 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col items-center text-center hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] transition-all">
            {/* Visual Mockup Container */}
            <div className="relative w-full h-[220px] mb-8 flex justify-center perspective-[1000px]">
              {/* Back Card */}
              <div className="absolute top-4 -right-2 w-48 h-56 bg-white border border-gray-100 rounded-2xl shadow-sm rotate-[4deg] p-4 flex flex-col gap-3">
                <div className="w-1/2 h-2 bg-gray-100 rounded-full mb-2"></div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-purple-100"></div>
                  <div className="w-32 h-2 rounded bg-gray-100"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100"></div>
                  <div className="w-24 h-2 rounded bg-gray-100"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-100"></div>
                  <div className="w-28 h-2 rounded bg-gray-100"></div>
                </div>
              </div>

              {/* Front Card */}
              <div className="absolute top-10 left-4 w-52 h-48 bg-white border border-gray-100 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] -rotate-[2deg] p-4 z-10 flex flex-col">
                <div className="text-[10px] font-bold text-gray-400 mb-3 uppercase flex justify-between">
                  Board Members <Search size={10} className="text-gray-300" />
                </div>
                <div className="flex -space-x-2 mb-4">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 relative z-30"></div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-green-100 relative z-20"></div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-100 relative z-10"></div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] text-gray-500 absolute z-0 left-16">
                    +2
                  </div>
                </div>
                <button className="w-full py-2 bg-gray-50 rounded-lg text-[11px] font-medium text-gray-600 border border-gray-200 mt-auto flex justify-center items-center gap-1 hover:bg-gray-100">
                  + Invite classmates
                </button>
              </div>
            </div>

            {/* Content */}
            <h3 className="text-[22px] font-bold text-gray-900 mb-3">
              Trello-style Collab
            </h3>
            <p className="text-[15px] text-gray-500 leading-relaxed max-w-[280px]">
              Work together with your group effortlessly. Share tasks, and
              update progress in real-time.
            </p>
          </div>

          {/* Top Right: Planning (Col-span 7 or 6) */}
          <div className="md:col-span-7 bg-white rounded-[32px] border border-gray-100 py-8 px-10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col items-center text-center hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] transition-all">
            <div className="relative w-full h-[220px] mb-8 flex items-center justify-center gap-6">
              {/* Visual Fake Dashboard Elements */}
              <div className="w-[140px] h-[180px] bg-white border border-gray-100 rounded-2xl shadow-sm p-3 flex flex-col">
                <div className="text-[9px] text-gray-400 font-bold mb-4 flex justify-between">
                  <span>WEEKLY</span>{" "}
                  <span className="text-blue-500">DAILY</span>
                </div>
                <div className="flex items-end justify-between flex-1 px-1 gap-2 pb-2">
                  <div
                    className="w-full bg-blue-400 rounded-t-sm"
                    style={{ height: "60%" }}
                  ></div>
                  <div
                    className="w-full bg-blue-400 rounded-t-sm"
                    style={{ height: "85%" }}
                  ></div>
                  <div
                    className="w-full bg-blue-400 rounded-t-sm opacity-40"
                    style={{ height: "40%" }}
                  ></div>
                </div>
                <div className="flex justify-between text-[8px] text-gray-400 mt-1 px-2">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                </div>
              </div>

              <div className="w-[220px] h-[200px] bg-white border border-gray-100 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] p-4 flex flex-col z-10 relative">
                <div className="w-full h-2 bg-gray-100 rounded-full mb-4 w-1/3"></div>

                <div className="flex gap-3 items-center mb-3">
                  <div className="w-8 h-8 rounded bg-orange-50 flex flex-col items-center justify-center text-[#fca03e]">
                    <span className="text-[8px] font-bold">Mon</span>
                    <span className="text-[12px] font-black leading-none">
                      12
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="w-24 h-2 bg-gray-200 rounded-full"></div>
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full"></div>
                  </div>
                </div>

                <div className="flex gap-3 items-center mb-3">
                  <div className="w-8 h-8 rounded bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                    <span className="text-[8px] font-bold">Tue</span>
                    <span className="text-[12px] font-black leading-none">
                      13
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="w-20 h-2 bg-gray-200 rounded-full"></div>
                    <div className="w-12 h-1.5 bg-gray-100 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-[22px] font-bold text-gray-900 mb-3">
              Planning Kegiatan
            </h3>
            <p className="text-[15px] text-gray-500 leading-relaxed max-w-[320px]">
              Optimize your academic time with integrated tools like schedules,
              assignment trackers, and reminders.
            </p>
          </div>

          {/* Bottom Left: AI Blackboard (Col-span 8) */}
          <div className="md:col-span-8 bg-white rounded-[32px] border border-gray-100 py-10 px-12 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden relative group hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] transition-all">
            {/* Left Text */}
            <div className="absolute top-12 left-12 w-[240px] z-20">
              <div className="w-10 h-10 bg-orange-50 rounded-xl mb-6 flex items-center justify-center border border-orange-100 shadow-sm text-orange-500">
                <ImageIcon size={20} />
              </div>
              <h3 className="text-[22px] font-bold text-gray-900 mb-3 leading-tight">
                AI Blackboard <br />
                to Notes
              </h3>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                Snap a photo of the whiteboard. Let AI instantly convert it into
                editable text and organized cards.
              </p>
            </div>

            {/* Right Graphic area */}
            <div className="ml-[220px] h-[300px] relative w-[130%]">
              {/* Pseudo App Background */}
              <div className="absolute top-0 left-10 w-full h-[320px] bg-gray-50 rounded-tl-3xl border-t border-l border-gray-200 overflow-hidden p-6 pl-10">
                {/* Top toolbar */}
                <div className="flex gap-4 mb-6">
                  <div className="w-32 h-3 bg-gray-200 rounded-full"></div>
                  <div className="w-48 h-3 bg-gray-200 rounded-full"></div>
                </div>

                {/* Layout */}
                <div className="flex gap-6 relative">
                  {/* Photo column */}
                  <div className="w-[180px] h-[140px] bg-blue-100/50 rounded-xl border border-blue-200 p-2 relative shadow-inner">
                    <div className="w-full h-full bg-blue-300/30 rounded-lg flex items-center justify-center border-dashed border-2 border-blue-400/50">
                      <FileText className="text-blue-500/50" />
                    </div>
                    {/* Scanning line effect */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 rounded-t blur-[2px] animate-pulse" />
                  </div>

                  {/* Arrow converting */}
                  <div className="w-12 h-[140px] flex items-center justify-center">
                    <ArrowRight className="text-blue-400" />
                  </div>

                  {/* Resulting text column */}
                  <div className="w-[200px] h-[190px] bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <div className="w-20 h-2 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="w-full h-1.5 bg-gray-100 rounded-full"></div>
                      <div className="w-5/6 h-1.5 bg-gray-100 rounded-full"></div>
                      <div className="w-4/6 h-1.5 bg-gray-100 rounded-full"></div>
                    </div>
                    <div className="w-full p-2 bg-blue-50 rounded text-[9px] text-blue-600 font-medium">
                      Saved to your 'Physics' board
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Right: AI Study Assistant (Col-span 4) */}
          <div className="md:col-span-4 bg-white rounded-[32px] border border-gray-100 p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border-dashed border-2 flex flex-col items-center hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] transition-all">
            {/* Abstract widget visuals */}
            <div className="relative w-full h-[180px] mb-8 mt-4 flex items-center justify-center perspective-[1000px]">
              {/* Back card gray grid */}
              <div className="absolute -left-2 top-0 w-28 h-28 bg-white border border-gray-100 rounded-2xl p-2 rotate-[-6deg] shadow-sm z-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiAvPgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2YwZjBmMCIgc3Ryb2tlLXdpZHRoPSIwLjUiIC8+Cjwvc3ZnPg==')] opacity-50"></div>
                <div className="text-[10px] font-medium text-gray-500 relative z-10 bg-white inline-block px-1">
                  Flashcards
                </div>
              </div>

              {/* Back card gray lines */}
              <div className="absolute right-0 bottom-4 w-28 h-[100px] bg-white border border-gray-100 rounded-2xl rotate-[8deg] shadow-sm z-0 p-3 pt-6">
                <div className="text-[9px] font-bold text-gray-400 absolute top-2 right-3">
                  Quiz Mode
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full mb-2 mt-2"></div>
                <div className="w-3/4 h-1.5 bg-gray-100 rounded-full mb-4"></div>
                <div className="flex gap-1 justify-end">
                  <div className="w-3 h-3 rounded bg-green-200"></div>
                </div>
              </div>

              {/* Center Yellow Widget */}
              <div className="absolute w-[100px] h-[100px] bg-[#ffdb58] rounded-[24px] shadow-[0_20px_40px_-5px_rgba(255,219,88,0.4)] z-20 flex flex-col items-center justify-center rotate-3 border-2 border-white">
                <div className="bg-white/90 px-3 py-1 rounded-full text-[14px] font-black tracking-tight text-gray-800 mb-2">
                  + 12 pts
                </div>
                <div className="flex gap-2 text-gray-800 bg-white/50 px-2 py-0.5 rounded-full">
                  <BrainCircuit size={12} strokeWidth={2.5} />
                  <CheckCircle2
                    size={12}
                    strokeWidth={2.5}
                    className="text-[#1da144]"
                  />
                </div>
              </div>
            </div>

            <div className="text-center mt-auto">
              <h3 className="text-[20px] font-bold text-gray-900 mb-2">
                AI Study Assistant
              </h3>
              <p className="text-[14px] text-gray-500 leading-relaxed max-w-[200px] mx-auto">
                Generate quizzes & flashcards instantly to supercharge your
                prep.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
