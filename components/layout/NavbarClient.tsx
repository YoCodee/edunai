"use client";

import Image from "next/image";
import Logoedu from "../../public/images/logoedunai.svg";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Menu, X, LayoutDashboard, LogIn } from "lucide-react";

export default function NavbarClient({ initialUser }: { initialUser: any }) {
  const [user, setUser] = useState<any>(initialUser);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  // Hanya perbarui status otentikasi jika ada perubahan sesi setelah render
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", session.user.id)
          .single();
        setUser({ ...session.user, ...profile });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Scroll shadow effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Solutions", href: "#solutions" },
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
  ];

  /** Smooth-scroll to section, closing mobile menu if open */
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileOpen(false);
  };

  const displayName =
    user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Student";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#fbfbfb]/90 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-[68px] flex items-center justify-between">
        {/* ─── LEFT: Logo ─── */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-9 h-9 rounded-[10px] bg-white shadow-sm border border-black/6 flex items-center justify-center transition-transform group-hover:scale-105">
            <Image src={Logoedu} alt="EduNai Logo" width={24} height={24} />
          </div>
          <span
            className="text-[20px] font-bold tracking-tight text-[#1a1c20] hidden sm:block"
            style={{ fontFamily: "serif" }}
          >
            Senai
          </span>
        </Link>

        {/* ─── CENTER: Nav Links (desktop) ─── */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="px-4 py-2 rounded-xl text-[14px] font-medium text-foreground/60 hover:text-foreground hover:bg-black/4 transition-all cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* ─── RIGHT: Auth CTAs ─── */}
        <div className="flex items-center gap-3">
          {user ? (
            /* ── Logged In ── */
            <>
              {/* Avatar chip */}
              <div className="hidden md:flex items-center gap-2.5 bg-white border border-black/6 rounded-full pl-1 pr-3 py-1 shadow-sm">
                <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-[11px] shadow-sm overflow-hidden shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <span className="text-[13px] font-semibold text-[#1a1c20]">
                  {displayName}
                </span>
              </div>

              {/* Dashboard button */}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold text-white bg-[#1a1c20] hover:bg-[#2a2c30] transition-all shadow-sm"
              >
                <LayoutDashboard size={14} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </>
          ) : (
            /* ── Logged Out ── */
            <>
              <Link
                href="/login"
                className="hidden xl:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[14px] font-medium text-foreground/70 hover:text-foreground hover:bg-black/4 transition-all"
              >
                <LogIn size={14} />
                Sign in
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold text-white bg-[#1aaeed] hover:bg-[#1594cb] transition-all shadow-[0_4px_14px_rgba(26,174,237,0.35)] hover:shadow-[0_6px_20px_rgba(26,174,237,0.25)]"
              >
                Get Started Free
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden p-2 rounded-xl text-foreground/70 hover:text-foreground hover:bg-black/4 transition-colors ml-1"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ─── MOBILE MENU ─── */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[#fbfbfb]/95 backdrop-blur-xl border-t border-black/6 px-6 py-5 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="block px-4 py-3 rounded-xl text-[15px] font-medium text-foreground/70 hover:text-foreground hover:bg-black/4 transition-all cursor-pointer"
            >
              {link.label}
            </a>
          ))}

          <div className="pt-3 border-t border-black/6 flex flex-col gap-2">
            {!user && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-[15px] font-semibold text-foreground/70 hover:text-foreground hover:bg-black/4 transition-all flex items-center gap-2"
              >
                <LogIn size={16} /> Sign in
              </Link>
            )}
            <Link
              href={user ? "/dashboard" : "/register"}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-xl text-[15px] font-bold text-white text-center transition-all"
              style={{
                background: user ? "#1a1c20" : "#1aaeed",
              }}
            >
              {user ? "Go to Dashboard" : "Get Started Free"}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
