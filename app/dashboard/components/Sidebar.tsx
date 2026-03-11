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
  X,
} from "lucide-react";
import clsx from "clsx";
import { logout } from "../../login/actions";
import { useTutorial } from "@/components/ui/TutorialContext";
import { useMobileMenu } from "@/components/ui/MobileMenuContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { startTutorial, isActive } = useTutorial();
  const { isOpen, setIsOpen } = useMobileMenu();

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
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={clsx(
        "bg-dash-sidebar border-r border-dash-border flex-col justify-between h-screen transition-all duration-300 z-50 flex",
        "fixed inset-y-0 left-0 w-64", 
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:sticky md:top-0 md:translate-x-0"
      )}>
        {/* Top Section */}
        <div className="p-6">
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="text-[26px] font-bold tracking-tight text-dash-text-primary mb-0 inline-block"
              style={{ fontFamily: "serif" }}
            >
              <Image src={logo} alt="Logo" width={100} height={100} />
            </Link>
            <button 
              className="md:hidden text-dash-text-secondary hover:text-dash-text-primary p-1"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
        <nav className="space-y-1 mt-6">
          <h4 className="text-[10px] font-bold text-dash-text-secondary uppercase tracking-widest mb-4 px-3">
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
                        ? "bg-dash-surface text-dash-primary shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-dash-border font-bold"
                        : "text-dash-text-secondary hover:text-dash-text-primary hover:bg-dash-surface",
                    )}
                  >
                    <Icon
                      size={18}
                      className={clsx(
                        "transition-colors",
                        isActive
                          ? "text-dash-primary"
                          : "text-dash-text-secondary group-hover:text-dash-text-primary",
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
      <div className="p-6 border-t border-dash-border">
        {/* Tutorial Button */}
        <button
          onClick={startTutorial}
          className={clsx(
            "w-full mb-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all border group",
            isActive
              ? "bg-dash-primary/10 border-dash-primary/30 text-dash-primary"
              : "bg-linear-to-r from-dash-primary/5 to-dash-primary/10 border-dash-primary/20 text-dash-primary hover:from-dash-primary/10 hover:to-dash-primary/20 hover:border-dash-primary/30 hover:text-dash-primary",
          )}
        >
          <div className="w-6 h-6 rounded-lg bg-dash-primary/20 flex items-center justify-center shrink-0 group-hover:bg-dash-primary/30 transition-colors">
            <HelpCircle size={14} className="opacity-80" />
          </div>
          <span>Panduan Fitur</span>
          <span className="ml-auto text-[10px] font-bold text-dash-primary bg-dash-primary/20 px-1.5 py-0.5 rounded-full">
            ?
          </span>
        </button>

        <ul className="space-y-1.5">
          <li id="sidebar-settings">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-[14px] font-medium text-dash-text-secondary hover:text-dash-text-primary hover:bg-dash-surface transition-all"
            >
              <Settings size={18} className="opacity-70" /> Settings
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
    </>
  );
}
