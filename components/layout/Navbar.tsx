"use client";

import Logoedu from "../../public/images/logoedunai.svg";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // 1. Initial fetch
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        // Optionally try to get the profile name
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", session.user.id)
          .single();
        setUser({ ...session.user, ...profile });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUser();

    // 2. Listen to state changes (Login / Logout events)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
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
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5 max-w-[1400px] mx-auto w-full bg-[#fbfbfb]/80 backdrop-blur-md border-b border-gray-100/50">
      <Link href="/" className="flex items-center gap-3">
        <div className="logo cursor-pointer hover:opacity-90 transition-opacity">
          <Image src={Logoedu} alt="EduNai Logo" width={110} height={110} />
        </div>
      </Link>

      <div className="hidden lg:flex items-center gap-10 text-[14px] font-medium text-foreground/80">
        <Link
          href="#features"
          className="hover:text-foreground transition-colors"
        >
          Features
        </Link>
        <Link
          href="#solutions"
          className="hover:text-foreground transition-colors"
        >
          Solutions
        </Link>
        <Link
          href="#pricing"
          className="hover:text-foreground transition-colors"
        >
          Pricing
        </Link>
      </div>

      <div className="flex items-center gap-6 text-[14px] font-medium">
        {loading ? (
          <div className="w-20 flex justify-end text-gray-400">
            <Loader2 size={18} className="animate-spin" />
          </div>
        ) : user ? (
          // Logged In View
          <>
            <div className="hidden md:flex items-center gap-3 mr-2 bg-blue-50/50 py-1.5 px-3 rounded-full border border-blue-100/50">
              <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-[10px] shadow-sm overflow-hidden">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (
                    user.full_name?.charAt(0) ||
                    user.email?.charAt(0) ||
                    "U"
                  ).toUpperCase()
                )}
              </div>
              <span className="text-[13px] font-semibold text-blue-900 pr-1">
                {user.full_name?.split(" ")[0] || "Student"}
              </span>
            </div>
            <Link href="/dashboard" passHref>
              <button className="px-6 py-2.5 rounded-xl border border-transparent hover:border-blue-500/20 text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] font-bold tracking-wide">
                Dashboard
              </button>
            </Link>
          </>
        ) : (
          // Logged Out View
          <>
            <Link
              href="/login"
              className="hidden xl:block text-foreground/80 hover:text-foreground font-semibold transition-colors"
            >
              Sign in
            </Link>
            <Link href="/register" passHref>
              <button className="px-5 py-2.5 rounded-xl border border-zinc-200 text-foreground hover:bg-zinc-50 transition-colors bg-white shadow-sm font-semibold hover:-translate-y-0.5 transform">
                Get Started Free
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
