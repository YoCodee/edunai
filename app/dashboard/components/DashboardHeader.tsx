"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Search,
  User,
  Menu,
  Settings,
  LogOut,
  Code,
  Sparkles,
  Calendar as CalendarIcon,
} from "lucide-react";
import Link from "next/link";
import { logout } from "../../login/actions";
import clsx from "clsx";

export default function DashboardHeader({
  userFullName,
}: {
  userFullName?: string;
}) {
  const displayName = userFullName || "Student";
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-[72px] bg-white/60 z-0 backdrop-blur-xl border-b border-gray-200/50 flex items-center justify-between px-6 sticky top-0 ">
      {/* Left side: Search */}
      <div className="flex items-center flex-1">
        <div className="relative w-full max-w-sm hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search boards, notes, or tasks..."
            className="w-full bg-gray-100/50 border border-gray-200 text-[13px] text-gray-900 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#fca03e]/40 focus:border-[#fca03e] transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded">
              ⌘ K
            </span>
          </div>
        </div>
        <button className="md:hidden p-2 text-gray-500 hover:text-gray-900 transition-colors">
          <Menu size={20} />
        </button>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-4 relative">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className={clsx(
              "relative p-2 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100",
              isNotificationsOpen
                ? "text-[#fca03e] bg-orange-50"
                : "text-gray-500",
            )}
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
                <span className="text-[14px] font-bold text-gray-900">
                  Notifications
                </span>
                <span className="text-[10px] font-bold text-[#fca03e] bg-orange-50 px-2 py-0.5 rounded-full">
                  3 New
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                <div className="px-4 py-3 hover:bg-gray-50 flex gap-3 transition-colors cursor-pointer group">
                  <div className="w-8 h-8 rounded-full bg-orange-50 text-[#fca03e] flex items-center justify-center shrink-0">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 group-hover:text-[#fca03e] transition-colors">
                      AI Breakdown Completed
                    </h4>
                    <p className="text-[12px] text-gray-500 leading-snug mt-0.5">
                      Your project "Computer Architecture" has been successfully
                      broken down into 12 tasks.
                    </p>
                    <span className="text-[10px] font-semibold text-gray-400 mt-1 block">
                      Just now
                    </span>
                  </div>
                </div>

                <div className="px-4 py-3 hover:bg-gray-50 flex gap-3 transition-colors cursor-pointer group">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#38bcfc] flex items-center justify-center shrink-0">
                    <CalendarIcon size={14} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 group-hover:text-[#38bcfc] transition-colors">
                      Upcoming Meeting
                    </h4>
                    <p className="text-[12px] text-gray-500 leading-snug mt-0.5">
                      Group Project Meeting starts in 30 minutes in the Library.
                    </p>
                    <span className="text-[10px] font-semibold text-gray-400 mt-1 block">
                      30m ago
                    </span>
                  </div>
                </div>

                <div className="px-4 py-3 hover:bg-gray-50 flex gap-3 transition-colors cursor-pointer group opacity-60">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                    <Code size={14} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900">
                      System Update
                    </h4>
                    <p className="text-[12px] text-gray-500 leading-snug mt-0.5">
                      Edunai v2.1 has been deployed successfully.
                    </p>
                    <span className="text-[10px] font-semibold text-gray-400 mt-1 block">
                      2 hours ago
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-4 pt-2 pb-1 border-t border-gray-50 text-center">
                <button className="text-[12px] font-bold text-gray-400 hover:text-gray-900 transition-colors w-full py-1">
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            className={clsx(
              "flex items-center gap-3 p-1.5 pr-3 rounded-full transition-colors border",
              isProfileOpen
                ? "bg-white border-gray-200 shadow-sm"
                : "hover:bg-white/50 border-transparent hover:border-gray-200",
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#fca03e] to-orange-300 flex items-center justify-center text-white shadow-sm border border-white">
              <User size={16} strokeWidth={2.5} />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[13px] font-bold text-gray-900 leading-none">
                {displayName}
              </span>
              <span className="text-[11px] text-gray-500 mt-1 leading-none">
                Free Plan
              </span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-gray-50 mb-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#fca03e] to-orange-300 flex items-center justify-center text-white shadow-sm">
                  <User size={18} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-gray-900">
                    {displayName}
                  </span>
                  <span className="text-[11px] text-[#fca03e] font-semibold">
                    Pro Student Pilot
                  </span>
                </div>
              </div>

              <Link
                href="/dashboard/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-[13px] font-semibold text-gray-700 transition-colors mt-1 hover:text-[#38bcfc]"
              >
                <Settings size={16} className="text-gray-400" /> Settings &
                Privacy
              </Link>

              <div className="my-1 border-t border-gray-50"></div>

              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-[13px] font-semibold text-red-600 transition-colors"
              >
                <LogOut size={16} className="text-red-400" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
