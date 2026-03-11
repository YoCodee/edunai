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
  Target,
} from "lucide-react";
import Link from "next/link";
import { logout } from "../../login/actions";
import clsx from "clsx";
import { useFocusMode } from "@/components/ui/FocusModeContext";
import { useMobileMenu } from "@/components/ui/MobileMenuContext";

export default function DashboardHeader({
  userFullName,
}: {
  userFullName?: string;
}) {
  const displayName = userFullName || "Student";
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isFocused, toggle: toggleFocus } = useFocusMode();
  const { toggle: toggleMobileMenu } = useMobileMenu();

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
    <header className="h-[72px] bg-dash-bg/80 z-0 backdrop-blur-xl border-b border-dash-border flex items-center justify-between px-6 sticky top-0 transition-colors">
      {/* Left side: Search */}
      <div className="flex items-center flex-1">
        <div className="relative w-full max-w-sm hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dash-text-secondary">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search boards, notes, or tasks..."
            className="w-full bg-dash-surface border border-dash-border text-[13px] text-dash-text-primary rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-dash-primary/40 focus:border-dash-primary transition-all placeholder-dash-text-secondary"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-[10px] font-bold text-dash-text-secondary bg-dash-surface border border-dash-border px-1.5 py-0.5 rounded">
              ⌘ K
            </span>
          </div>
        </div>
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden p-2 text-dash-text-secondary hover:text-dash-text-primary transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-4 relative">
        {/* Focus Mode toggle */}
        <button
          onClick={toggleFocus}
          title={isFocused ? "Exit Focus Mode (Esc)" : "Enter Focus Mode"}
          className={clsx(
            "p-2 rounded-full transition-all text-[13px] font-bold border",
            isFocused
              ? "bg-dash-primary text-white border-brand-300 shadow-md"
              : "text-dash-text-secondary border-transparent hover:border-dash-border hover:bg-dash-surface",
          )}
        >
          <Target size={18} />
        </button>

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
                ? "bg-dash-surface border-dash-border shadow-sm"
                : "hover:bg-dash-surface border-transparent hover:border-dash-border",
            )}
          >
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-dash-primary to-brand-300 flex items-center justify-center text-white shadow-sm">
              <User size={16} strokeWidth={2.5} />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[13px] font-bold text-dash-text-primary leading-none">
                {displayName}
              </span>
              <span className="text-[11px] text-dash-text-secondary mt-1 leading-none">
                Free Plan
              </span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-dash-surface rounded-2xl shadow-xl border border-dash-border p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-dash-border mb-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-dash-primary to-brand-300 flex items-center justify-center text-white shadow-sm">
                  <User size={18} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-dash-text-primary">
                    {displayName}
                  </span>
                  <span className="text-[11px] text-dash-primary font-semibold">
                    Pro Student Pilot
                  </span>
                </div>
              </div>

              <Link
                href="/dashboard/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dash-bg text-[13px] font-semibold text-dash-text-secondary transition-colors mt-1 hover:text-dash-primary"
              >
                <Settings size={16} className="opacity-70" /> Settings &
                Privacy
              </Link>

              <div className="my-1 border-t border-dash-border"></div>

              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dash-danger/10 text-[13px] font-semibold text-dash-danger transition-colors"
              >
                <LogOut size={16} className="opacity-80" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
