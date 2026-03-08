"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "@/public/images/logoedunai.svg";
import { usePathname } from "next/navigation";
import {
  Compass,
  CalendarDays,
  LayoutDashboard,
  BrainCircuit,
  LogOut,
  Settings,
  BookOpenText,
  Users,
  HelpCircle,
} from "lucide-react";
import clsx from "clsx";
import { logout } from "../../login/actions";
import { useTutorial } from "@/components/ui/TutorialContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { startTutorial, isActive } = useTutorial();

  const primaryLinks = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: Compass,
      id: "sidebar-overview",
    },
    {
      name: "Smart Scheduler",
      href: "/dashboard/schedule",
      icon: CalendarDays,
      id: "sidebar-scheduler",
    },
    {
      name: "AI Workspace",
      href: "/dashboard/ai-workspace",
      icon: BrainCircuit,
      id: "sidebar-ai-workspace",
    },
    {
      name: "Project Boards",
      href: "/dashboard/boards",
      icon: LayoutDashboard,
      id: "sidebar-boards",
    },
    {
      name: "Study Guide",
      href: "/dashboard/study-guide",
      icon: BookOpenText,
      id: "sidebar-study-guide",
    },
    {
      name: "Study Group",
      href: "/dashboard/study-group",
      icon: Users,
      id: "sidebar-study-group",
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200/50 flex-col justify-between h-screen sticky top-0 hidden md:flex">
      {/* Top Section */}
      <div className="p-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-[26px] font-bold tracking-tight text-[#1a1c20] mb-8 inline-block"
          style={{ fontFamily: "serif" }}
        >
          <Image src={logo} alt="Logo" width={100} height={100} />
        </Link>

        {/* Navigation */}
        <nav className="space-y-1 mt-6">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-3">
            Main Menu
          </h4>

          <ul className="space-y-1.5">
            {primaryLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <li key={link.name} id={link.id}>
                  <Link
                    href={link.href}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all group",
                      isActive
                        ? "bg-[#fbfcff] text-[#1a1c20] shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-gray-100 font-bold"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                    )}
                  >
                    <Icon
                      size={18}
                      className={clsx(
                        "transition-colors",
                        isActive
                          ? "text-[#fca03e]"
                          : "text-gray-400 group-hover:text-gray-600",
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-6 border-t border-gray-100/50">
        {/* Tutorial Button */}
        <button
          onClick={startTutorial}
          className={clsx(
            "w-full mb-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all border group",
            isActive
              ? "bg-orange-50 border-orange-200 text-orange-600"
              : "bg-linear-to-r from-orange-50 to-amber-50 border-orange-100 text-orange-500 hover:from-orange-100 hover:to-amber-100 hover:border-orange-200 hover:text-orange-600",
          )}
        >
          <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 group-hover:bg-orange-200 transition-colors">
            <HelpCircle size={14} className="text-orange-500" />
          </div>
          <span>Panduan Fitur</span>
          <span className="ml-auto text-[10px] font-bold text-orange-300 bg-orange-100 px-1.5 py-0.5 rounded-full">
            ?
          </span>
        </button>

        <ul className="space-y-1.5">
          <li id="sidebar-settings">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[14px] font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
            >
              <Settings size={18} className="text-gray-400" /> Settings
            </Link>
          </li>
          <li>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[14px] font-medium text-red-500 hover:bg-red-50 transition-all text-left"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
