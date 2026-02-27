import React from "react";
import {
  ListChecks,
  UserPlus,
  Sparkles,
  Plus,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  Check,
  Play,
  Square,
  MoreHorizontal,
} from "lucide-react";

const Solutions = () => {
  return (
    <section className="bg-[#fbfcff] py-24 relative overflow-hidden font-sans">
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="px-5 py-2 bg-white rounded-full border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-sm font-medium text-gray-600 mb-8 inline-flex items-center">
            Solutions
          </div>
          <h2 className="text-[40px] md:text-[52px] font-medium leading-[1.1] tracking-tight text-[#1a1c20] max-w-2xl">
            Solve your team&apos;s biggest challenges
          </h2>
        </div>

        {/* Features Row with Connecting Line */}
        <div className="relative mb-20 max-w-5xl mx-auto">
          {/* Continuous Line */}
          <div className="absolute top-[12px] left-[10%] right-[10%] h-[1px] bg-gray-200/80 -z-10"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left relative">
              <div className="w-[25px] h-[25px] bg-[#fbfcff] rounded-full flex items-center justify-center border-[4px] border-[#fbfcff] outline outline-1 outline-gray-200/80 mb-6 mx-auto md:mx-0">
                {/* This just acts as the node dot on the line */}
              </div>
              <div className="text-[#fca03e] mb-4 flex justify-center w-full md:justify-start pl-[2px]">
                <Sparkles size={24} strokeWidth={1.5} />
              </div>
              <p className="text-[15px] text-gray-500 leading-relaxed max-w-[280px] mx-auto md:mx-0">
                Ensure your team is always on the same page with task-sharing
                and transparent updates.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left relative">
              <div className="w-[25px] h-[25px] bg-[#fbfcff] rounded-full flex items-center justify-center border-[4px] border-[#fbfcff] outline outline-1 outline-gray-200/80 mb-6 mx-auto"></div>
              <div className="text-[#fca03e] mb-4 flex justify-center w-full">
                <ListChecks size={24} strokeWidth={1.5} />
              </div>
              <p className="text-[15px] text-gray-500 leading-relaxed max-w-[280px] mx-auto">
                Prioritize and manage tasks effectively so your team can focus
                on what matters most.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left relative">
              <div className="w-[25px] h-[25px] bg-[#fbfcff] rounded-full flex items-center justify-center border-[4px] border-[#fbfcff] outline outline-1 outline-gray-200/80 mb-6 mx-auto md:mx-0 md:ml-auto md:mr-0"></div>
              <div className="text-[#fca03e] mb-4 flex justify-center w-full md:justify-end pr-[2px]">
                <UserPlus size={24} strokeWidth={1.5} />
              </div>
              <p className="text-[15px] text-gray-500 leading-relaxed max-w-[280px] mx-auto md:mx-0 md:ml-auto md:mr-0 md:text-right">
                Hold everyone accountable without the need for constant
                check-ins.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Mockup Section */}
        <div className="relative pt-12 pb-0 px-8 mx-auto max-w-[1000px] bg-gradient-to-b from-[#38bcfc] to-[#25a5f8] rounded-t-[40px] ">
          {/* Dashboard Container */}
          <div className="bg-[#f6f8fb] rounded-t-[24px]  overflow-hidden border border-white/20 h-[600px] relative flex">
            {/* Sidebar */}
            <div className="w-[240px] bg-white border-r border-gray-100 flex flex-col pt-6 shrink-0">
              <div className="px-6 flex items-center font-bold text-lg mb-8 text-gray-800 gap-2">
                <div className="grid grid-cols-2 gap-1 w-5 h-5">
                  <div className="bg-blue-500 rounded-sm"></div>
                  <div className="bg-indigo-500 rounded-sm"></div>
                  <div className="bg-sky-400 rounded-sm"></div>
                  <div className="bg-purple-500 rounded-sm"></div>
                </div>
                ChronoTask
              </div>
              <div className="px-6 mb-8">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all">
                  <Plus size={16} /> Create
                </button>
              </div>

              <div className="px-4 mb-6">
                <div className="text-[11px] font-bold text-gray-400 tracking-wider mb-3 px-2">
                  GENERAL
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-2 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-800">
                    <span className="w-4 h-4 rounded-sm border-2 border-gray-400"></span>{" "}
                    Home
                  </div>
                  <div className="flex items-center justify-between px-2 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <ListChecks size={16} /> My Tasks
                    </div>
                    <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                      22
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Bell size={16} /> Inbox
                    </div>
                    <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                      15
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-4">
                <div className="text-[11px] font-bold text-gray-400 tracking-wider mb-3 px-2 flex justify-between items-center">
                  MY WORKSPACE
                  <button className="text-gray-400 hover:text-gray-600">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-2 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>{" "}
                    Branding and Identity...
                  </div>
                  <div className="flex items-center gap-3 px-2 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>{" "}
                    Marketing Team
                  </div>
                  <div className="flex items-center gap-3 px-2 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>{" "}
                    Product launch
                  </div>
                  <div className="flex items-center gap-3 px-2 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>{" "}
                    Team brainstorm
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-hidden flex flex-col">
              {/* Top Bar */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                  <ChevronLeft size={16} className="text-gray-300" />
                  Monday, September 30
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
                <div className="flex items-center gap-4">
                  <Search size={18} className="text-gray-400 cursor-pointer" />
                  <Bell size={18} className="text-gray-400 cursor-pointer" />
                  <div className="flex items-center gap-2 bg-white rounded-full py-1 pl-1 pr-3 shadow-sm border border-gray-100 cursor-pointer">
                    <div className="w-7 h-7 bg-orange-200 rounded-full bg-[url('https://i.pravatar.cc/150?u=a042581f4e29026704d')] bg-cover"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Amanda P.
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-gray-400 rotate-90"
                    />
                  </div>
                </div>
              </div>

              {/* Greeting */}
              <div className="flex items-end justify-between mb-6">
                <h1 className="text-3xl font-medium text-gray-800">
                  Good morning, <span className="font-semibold">Amanda</span>
                </h1>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50">
                  Customize <Sparkles size={14} />
                </button>
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-2 gap-6 flex-1 h-full min-h-0">
                {/* To do list (left) */}
                <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col row-span-2">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-xl">✏️</div>
                    <h3 className="text-lg font-bold text-gray-800 border-b-2 border-black pb-1">
                      To do list
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-4 cursor-pointer hover:text-gray-600">
                    <Plus size={16} /> Create new
                  </div>

                  <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded border border-gray-300 mt-0.5 flex-shrink-0 cursor-pointer"></div>
                      <span className="text-sm text-gray-600 leading-snug">
                        Finish the sales presentation 🔥 for the client meeting
                        at 2:00 PM
                      </span>
                    </div>
                    <div className="flex items-start gap-3 opacity-60">
                      <div className="w-5 h-5 rounded bg-blue-500 text-white flex items-center justify-center flex-shrink-0 cursor-pointer">
                        <Check size={14} />
                      </div>
                      <span className="text-sm text-gray-500 leading-snug line-through">
                        Send follow-up emails to potential leads
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded border border-gray-300 mt-0.5 flex-shrink-0 cursor-pointer"></div>
                      <span className="text-sm text-gray-600 leading-snug">
                        Review and approve the marketing budget 📊
                      </span>
                    </div>
                    <div className="flex items-start gap-3 opacity-60">
                      <div className="w-5 h-5 rounded bg-blue-500 text-white flex items-center justify-center flex-shrink-0 cursor-pointer">
                        <Check size={14} />
                      </div>
                      <span className="text-sm text-gray-500 leading-snug line-through">
                        Take 10 minutes for meditation or deep breathing
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Cards (Right side stack) */}
                <div className="grid grid-cols-2 gap-6 relative">
                  {/* Tracker */}
                  <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-between text-center">
                    <div className="w-full flex justify-between items-center mb-4 text-sm font-semibold text-gray-700">
                      Time tracker
                      <MoreHorizontal size={16} className="text-gray-400" />
                    </div>
                    <div className="text-[32px] font-medium text-gray-800 tracking-tight my-4">
                      04:21:58
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition">
                        <Play
                          size={16}
                          fill="currentColor"
                          className="ml-0.5"
                        />
                      </button>
                      <button className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition">
                        <Square size={14} fill="currentColor" />
                      </button>
                    </div>
                  </div>

                  {/* Activity */}
                  <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 flex flex-col relative w-[300px] z-10 absolute right-0">
                    {" "}
                    {/* Making it slightly wider to fit chart */}
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-sm font-semibold text-gray-700">
                        Activity
                      </span>
                      <div className="text-[11px] font-medium text-gray-400 flex gap-2">
                        <span className="text-blue-500 cursor-pointer">
                          weekly
                        </span>
                        <span className="cursor-pointer hover:text-gray-600">
                          daily
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                            <span className="w-1 h-3 rounded-full bg-yellow-400"></span>{" "}
                            Working hours
                          </div>
                          <div className="text-lg font-medium text-gray-700 ml-3 mt-1">
                            29/40
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                            <span className="w-1 h-3 rounded-full bg-green-400"></span>{" "}
                            Tasks completed
                          </div>
                          <div className="text-lg font-medium text-gray-700 ml-3 mt-1">
                            8/12
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                            <span className="w-1 h-3 rounded-full bg-blue-500"></span>{" "}
                            Projects completed
                          </div>
                          <div className="text-lg font-medium text-gray-700 ml-3 mt-1">
                            4/7
                          </div>
                        </div>
                      </div>

                      {/* CSS Donut Charts overlapping */}
                      <div className="relative w-28 h-28 mr-2">
                        <div className="absolute inset-0 rounded-full border-[6px] border-blue-500 rotate-[45deg] border-l-transparent"></div>
                        <div className="absolute inset-2 rounded-full border-[6px] border-green-400 rotate-[120deg] border-t-transparent border-r-transparent"></div>
                        <div className="absolute inset-4 rounded-full border-[6px] border-yellow-400 rotate-[-45deg] border-b-transparent"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-cards */}
                <div className="col-span-1 bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col relative mt-2">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-semibold text-gray-700">
                      Tasks I&apos;ve assigned
                    </span>
                    <button className="text-gray-400 hover:text-gray-600 bg-gray-50 rounded p-1">
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex gap-4 text-[12px] font-medium text-gray-400 border-b border-gray-100 pb-2 mb-4">
                    <span className="text-blue-500 border-b-2 border-blue-500 pb-2 -mb-[9px] z-10">
                      Upcoming
                    </span>
                    <span className="hover:text-gray-600 cursor-pointer">
                      Overdue
                    </span>
                    <span className="hover:text-gray-600 cursor-pointer">
                      Completed
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3 font-medium text-gray-700">
                        <span className="w-6 h-6 rounded bg-orange-100 text-orange-500 flex items-center justify-center text-[10px] font-bold">
                          8
                        </span>
                        New Ideas for campaign
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-[60%]"></div>
                        </div>
                        <span className="text-[11px] text-gray-400 w-8">
                          60%
                        </span>
                        <div className="flex -space-x-1">
                          <div className="w-5 h-5 rounded-full bg-gray-200 border border-white z-10 bg-[url('https://i.pravatar.cc/100?u=1')] bg-cover"></div>
                          <div className="w-5 h-5 rounded-full bg-gray-300 border border-white z-0 bg-[url('https://i.pravatar.cc/100?u=2')] bg-cover"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3 font-medium text-gray-700">
                        <span className="w-6 h-6 rounded bg-yellow-100 text-yellow-600 flex items-center justify-center text-[10px] font-bold">
                          2
                        </span>
                        Change button
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-[27%]"></div>
                        </div>
                        <span className="text-[11px] text-gray-400 w-8">
                          27%
                        </span>
                        <div className="flex -space-x-1">
                          <div className="w-5 h-5 rounded-full bg-gray-200 border border-white z-10 bg-[url('https://i.pravatar.cc/100?u=3')] bg-cover"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating 3D Block (Left) - "20" */}
          <div className="absolute top-[35%] left-[-40px] md:left-2 lg:left-[-60px] bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-24 h-24 flex items-center justify-center transform -rotate-12 transition-transform hover:rotate-0 hover:scale-110 duration-500 border-b-8 border-r-4 border-gray-100 z-20">
            <span className="text-[40px] font-black text-gray-800 leading-none">
              20
            </span>
          </div>

          {/* Floating 3D Block (Right) - "Checkmark" */}
          <div className="absolute top-[25%] right-[-20px] md:right-8 lg:right-[-40px] bg-white rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] w-[72px] h-[72px] flex items-center justify-center transform rotate-[15deg] transition-transform hover:rotate-0 hover:scale-110 duration-500 border-b-8 border-l-4 border-gray-100 border-b-gray-200 z-20">
            <div className="w-10 h-10 bg-[#1ec69b] rounded-xl flex items-center justify-center shadow-inner">
              <Check size={24} strokeWidth={4} className="text-white" />
            </div>
          </div>

          {/* Bottom Gradient Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#fbfcff] via-[#fbfcff]/80 to-transparent z-30 pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
};

export default Solutions;
