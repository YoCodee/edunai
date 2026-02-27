"use client";

import {
  MessageSquare,
  Package,
  LineChart,
  CheckCircle2,
  Zap,
} from "lucide-react";

export default function CTASection() {
  return (
    <section className="bg-white py-24 relative overflow-hidden font-sans border-t border-gray-100">
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="max-w-[1200px] mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
        {/* Left Content */}
        <div className="flex-1 w-full text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/50 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">
              Real-Time Sync
            </span>
          </div>

          <h2 className="text-[42px] md:text-[52px] font-bold text-[#1a1c20] leading-[1.1] tracking-tight mb-4">
            Track your Academic <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
              Progress Real-Time
            </span>
          </h2>

          <p className="text-[16px] text-gray-500 leading-relaxed mb-10 max-w-lg cursor-default">
            See how Edunai manages your schedules, processes your whiteboard
            notes, and syncs collaborative projects right before your eyes.
            Everything centralized in one smart dashboard.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#131b26] flex items-center justify-center shrink-0 shadow-lg shadow-gray-200/50">
                <MessageSquare className="text-blue-400" size={20} />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-gray-900 mb-0.5">
                  Smart Task Analysis
                </h4>
                <p className="text-[14px] text-gray-400">
                  Instantly detects priority assignments from syllabus.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#131b26] flex items-center justify-center shrink-0 shadow-lg shadow-gray-200/50">
                <Package className="text-orange-400" size={20} />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-gray-900 mb-0.5">
                  Timeline Sync
                </h4>
                <p className="text-[14px] text-gray-400">
                  Automatic synchronization across all your devices.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#131b26] flex items-center justify-center shrink-0 shadow-lg shadow-gray-200/50">
                <LineChart className="text-green-400" size={20} />
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-gray-900 mb-0.5">
                  Progress Tracking
                </h4>
                <p className="text-[14px] text-gray-400">
                  Second-by-second analytics on your study sessions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Dashboard Mockup */}
        <div className="flex-[1.2] w-full relative perspective-[1200px] mt-10 lg:mt-0">
          {/* Main Browser Window */}
          <div className="relative bg-white rounded-2xl border border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden w-full max-w-[600px] ml-auto">
            {/* Window Header */}
            <div className="h-10 bg-gray-500 flex items-center px-4 gap-2 rounded-t-2xl">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
              <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
            </div>

            {/* Window Body */}
            <div className="p-6">
              {/* Top Cards Row */}
              <div className="flex gap-4 mb-8">
                <div className="flex-1 bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] rounded-[20px] p-5 shadow-lg shadow-indigo-100">
                  <p className="text-white/80 text-[11px] font-medium mb-1">
                    Tasks Completed
                  </p>
                  <h3 className="text-white text-[32px] font-bold leading-none mb-3">
                    42
                  </h3>
                  <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-white/20 px-2 py-0.5 rounded-full">
                    ↗ +15% from last week
                  </div>
                </div>

                <div className="flex-1 bg-white border border-gray-200 rounded-[20px] p-5">
                  <p className="text-gray-500 text-[11px] font-medium mb-1">
                    Study Hours Logged
                  </p>
                  <h3 className="text-gray-900 text-[32px] font-bold leading-none mb-3">
                    12.5h
                  </h3>
                  <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-500">
                    100% Optimal Focus
                  </div>
                </div>
              </div>

              {/* Activity Log */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Live Activity Log
                </h4>
                <div className="space-y-4">
                  {/* Item 1 */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-gray-900">
                        Calculus Assignment
                      </span>
                      <span className="text-[11px] text-gray-400">
                        Uploaded 5 whiteboard photos
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[11px] font-bold text-green-500">
                        Processed
                      </span>
                      <span className="block text-[10px] text-gray-400">
                        Just now
                      </span>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-gray-900">
                        Group Project Board
                      </span>
                      <span className="text-[11px] text-gray-400">
                        Amanda moved card to 'Done'
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[11px] font-bold text-gray-600">
                        Synced
                      </span>
                      <span className="block text-[10px] text-gray-400">
                        2 mins ago
                      </span>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-gray-900">
                        Biology Quiz
                      </span>
                      <span className="text-[11px] text-gray-400">
                        Generating flashcards...
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[11px] font-bold text-blue-500">
                        In Progress
                      </span>
                      <span className="block text-[10px] text-gray-400">
                        Running
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-[11px] text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  AI is currently analyzing 2 tasks...
                </div>
              </div>
            </div>
          </div>

          {/* Floating Badges */}

          {/* Top Right Status */}
          <div className="absolute top-[-20px] right-[-20px] bg-white rounded-2xl shadow-xl border border-gray-100 p-3 flex items-center gap-3 animate-in fade-in zoom-in duration-700 z-20">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2
                size={16}
                className="text-green-500"
                strokeWidth={2.5}
              />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                Status
              </p>
              <p className="text-[13px] font-bold text-gray-900">
                System Optimal
              </p>
            </div>
          </div>

          {/* Bottom Left Speed */}
          <div className="absolute bottom-[-10px] left-[-30px] lg:left-[-50px] bg-white rounded-2xl shadow-xl border border-gray-100 p-3 flex items-center gap-3 animate-in fade-in zoom-in duration-700 delay-300 z-20">
            <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center">
              <Zap size={16} className="text-yellow-500" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                Speed
              </p>
              <p className="text-[13px] font-bold text-gray-900">
                0.8s Response
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
