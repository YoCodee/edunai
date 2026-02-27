"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  CalendarDays,
  Camera,
  LayoutDashboard,
  BookOpenText,
  BrainCircuit,
  LogOut,
  Settings,
} from "lucide-react";
import clsx from "clsx";
import { logout } from "../../login/actions";

export default function Sidebar() {
  const pathname = usePathname();

  const primaryLinks = [
    { name: "Overview", href: "/dashboard", icon: Compass },
    {
      name: "Smart Scheduler",
      href: "/dashboard/schedule",
      icon: CalendarDays,
    },
    { name: "AI Board Scanner", href: "/dashboard/scanner", icon: Camera },
    {
      name: "Project Boards",
      href: "/dashboard/boards",
      icon: LayoutDashboard,
    },
    { name: "Smart Notes", href: "/dashboard/notes", icon: BookOpenText },
    {
      name: "Study Assistant",
      href: "/dashboard/assistant",
      icon: BrainCircuit,
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
          Edunai
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
                <li key={link.name}>
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


        <ul className="space-y-1.5">
          <li>
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
