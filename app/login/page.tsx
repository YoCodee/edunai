"use client";

import Link from "next/link";
import { ArrowLeft, User, Lock, Mail, Github, Sparkles } from "lucide-react";
import { useState } from "react";
import { login } from "./actions";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await login(formData);
    if (result?.error) {
      setErrorMsg(result.error);
      setLoading(false);
    }
    // if successful, the server action will redirect.
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#fbfcff] font-sans flex items-center justify-center p-4 selection:bg-orange-200">
      {/* Back button */}
      <Link
        href="/"
        className="fixed top-8 left-8 flex items-center gap-2 text-[14px] font-semibold text-gray-500 hover:text-gray-800 transition-colors z-50"
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="w-full max-w-[1000px] h-full sm:h-[650px] bg-white rounded-[32px] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] border border-gray-100 flex overflow-hidden">
        {/* Left Side: Graphic / Branding (Hidden on mobile) */}
        <div className="hidden md:flex flex-col flex-1 bg-gradient-to-br from-[#1a1c20] to-[#2a2c30] p-12 relative overflow-hidden text-white justify-between">
          {/* Abstract background shapes */}
          <div className="absolute -top-[20%] -left-[10%] w-[350px] h-[350px] bg-[#fca03e] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[350px] h-[350px] bg-[#38bcfc] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

          <div className="relative z-10">
            <Link
              href="/"
              className="text-[28px] font-bold tracking-tight inline-block mb-16"
              style={{ fontFamily: "serif" }}
            >
              Edunai
            </Link>
            <h1 className="text-[40px] font-medium leading-[1.1] tracking-tight mb-4">
              Welcome back to <br /> your academic hub.
            </h1>
            <p className="text-[15px] text-gray-400 max-w-sm leading-relaxed">
              Login to access your schedule, smart notes, collaborative boards,
              and AI study assistant.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl w-fit">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 border border-white/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white mb-0.5">
                Gemini 1.5 Pro
              </p>
              <p className="text-[11px] text-gray-400">
                AI engine is running optimally.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 sm:p-12 md:p-16 flex flex-col justify-center relative">
          <div className="max-w-[360px] w-full mx-auto">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-[28px] font-bold text-gray-900 mb-2">
                Sign in to Edunai
              </h2>
              <p className="text-[14px] text-gray-500">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-[#fca03e] hover:text-[#e48a29] transition-colors"
                >
                  Sign up validly
                </Link>
              </p>
            </div>

            {/* Social Logins */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleGoogleLogin}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-[13px] font-semibold text-gray-700 shadow-sm"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path
                      fill="#4285F4"
                      d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                    />
                    <path
                      fill="#34A853"
                      d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                    />
                  </g>
                </svg>
                Google
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-[13px] font-semibold text-gray-700 shadow-sm">
                <Github size={18} />
                Github
              </button>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-[12px] font-medium text-gray-400">
                OR CONTINUE WITH
              </span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-500 text-[13px] px-4 py-3 rounded-xl mb-4 text-center border border-red-100">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-gray-700 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#fca03e]/50 focus:border-[#fca03e] transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[13px] font-bold text-gray-700">
                    Password
                  </label>
                  <Link
                    href="#"
                    className="text-[12px] font-bold text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#f8f9fc] border border-gray-200 text-gray-900 text-[14px] rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#fca03e]/50 focus:border-[#fca03e] transition-all"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#fca03e] hover:bg-[#ffb05c] text-[#1a1c20] font-bold text-[15px] py-3.5 rounded-xl shadow-[0_4px_15px_rgba(252,160,62,0.3)] transition-all flex items-center justify-center mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#1a1c20]/30 border-t-[#1a1c20] rounded-full animate-spin"></div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
