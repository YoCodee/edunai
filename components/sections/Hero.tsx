"use client";

import React, { useRef } from "react";
import { Check, Clock, LayoutDashboard } from "lucide-react";
import Logoedu from "@/public/images/logoedunai.svg";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const Hero = ({ isLoggedIn = false }: { isLoggedIn?: boolean }) => {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // 1. Enter Animation for center UI
      gsap.to(".hero-main-element", {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2,
      });

      // 2. Floating Cards enter animation
      gsap.to(".hero-floating-card", {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1,
        stagger: 0.2,
        ease: "back.out(1.2)",
        delay: 0.6,
      });

      // 3. Scanner Animation Loop
      const scannerTl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
      scannerTl
        .fromTo(
          ".hero-scanner-line",
          { top: "-10%", opacity: 0 },
          { top: "110%", opacity: 1, duration: 1.5, ease: "linear" },
        )
        .to(".hero-scanner-line", { opacity: 0, duration: 0.2 });

      // 4. Flashcard Flip Animation Loop
      const cardTl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
      cardTl
        .to(".hero-flashcard-inner", {
          rotateY: 180,
          duration: 0.8,
          ease: "power3.inOut",
        })
        .to(
          ".hero-flashcard-sparkle",
          {
            scale: 1.3,
            rotation: 45,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(2)",
          },
          "-=0.2",
        )
        .to(".hero-flashcard-sparkle", {
          scale: 1,
          rotation: 0,
          opacity: 0.8,
          duration: 0.2,
        })
        .to({}, { duration: 1.2 }) // Read answers
        .to(".hero-flashcard-inner", {
          rotateY: 0,
          duration: 0.8,
          ease: "power3.inOut",
        })
        .to(
          ".hero-flashcard-sparkle",
          { opacity: 0, scale: 0.5, duration: 0.3 },
          "<",
        );

      // 5. Kanban Drag & Drop Simulation
      const kanbanTl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      kanbanTl
        // Cursor moves in
        .fromTo(
          ".hero-kanban-cursor",
          { x: 20, y: 30, opacity: 0 },
          {
            x: -30,
            y: -50,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
          },
        )
        // Click and grab card
        .to(".hero-kanban-cursor", { scale: 0.8, duration: 0.1 })
        .to(
          ".hero-kanban-card",
          {
            scale: 1.05,
            rotate: 3,
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
            duration: 0.2,
          },
          "<",
        )
        // Drag down
        .to(".hero-kanban-cursor", {
          y: -10,
          duration: 0.8,
          ease: "power2.inOut",
        })
        .to(
          ".hero-kanban-card",
          { y: 40, duration: 0.8, ease: "power2.inOut" },
          "<",
        )
        // Release
        .to(".hero-kanban-cursor", { scale: 1, duration: 0.1 })
        .to(
          ".hero-kanban-card",
          {
            scale: 1,
            rotate: 0,
            boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
            duration: 0.2,
          },
          "<",
        )
        // Cursor moves away
        .to(".hero-kanban-cursor", {
          x: 20,
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: "power2.in",
        })
        // Reset card secretly
        .set(".hero-kanban-card", { y: 0, rotate: 1 }, "+=0.5");

      // 6. Scheduler AI Suggestion Pop
      const schedulerTl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
      schedulerTl
        .fromTo(
          ".hero-ai-suggestion",
          {
            opacity: 0,
            scale: 0.9,
            height: 0,
            paddingBottom: 0,
            paddingTop: 0,
            marginTop: 0,
          },
          {
            opacity: 1,
            scale: 1,
            height: "auto",
            paddingBottom: "8px",
            paddingTop: "8px",
            marginTop: "8px",
            duration: 0.6,
            ease: "back.out(1.5)",
          },
        )
        .to({}, { duration: 2.5 })
        .to(".hero-ai-suggestion", {
          opacity: 0,
          scale: 0.9,
          height: 0,
          paddingBottom: 0,
          paddingTop: 0,
          marginTop: 0,
          duration: 0.4,
          ease: "power2.in",
        });
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="relative pt-[70px] pb-32 overflow-hidden px-4 md:px-6"
    >
      <div className="max-w-[1400px] mx-auto min-h-[700px] rounded-[40px] dot-pattern relative flex flex-col items-center justify-center py-40 px-4 shadow-[0_0_0_1px_rgba(0,0,0,0.05)] bg-[#fbfbfb]">
        {/* CENTER FLOATING LOGO BOX */}
        <div className="hero-main-element opacity-0 translate-y-10 w-[88px] h-[88px] bg-white rounded-[24px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.15)] flex items-center justify-center mb-12 relative z-10 border border-black/[0.03]">
          <div>
            <Image src={Logoedu} alt="Edunai Logo" width={56} height={56} />
          </div>
        </div>

        {/* MAIN TEXT */}
        <h1 className="hero-main-element opacity-0 translate-y-10 text-[52px] md:text-[80px] font-medium leading-[1.05] text-center tracking-[-0.03em] text-foreground max-w-[800px] z-10">
          The brilliant AI brain <br className="hidden md:block" />
          <span className="text-[#a1a1aa]">for your studies</span>
        </h1>

        <p className="hero-main-element opacity-0 translate-y-10 mt-8 text-[18px] text-foreground/60 text-center font-medium z-10 max-w-2xl px-4">
          Turn scattered photos into smart notes, generate flashcards instantly,
          and collaborate on projects with AI task breakdowns.
        </p>

        <div className="hero-main-element opacity-0 translate-y-10 relative z-10">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="mt-10 px-8 py-4 bg-[#1a1c20] text-white rounded-[16px] text-[15px] font-semibold hover:bg-gray-800 transition-all shadow-md flex items-center gap-2"
            >
              Dashboard <LayoutDashboard size={18} />
            </Link>
          ) : (
            <Link
              href="/register"
              className="mt-10 px-8 py-4 bg-[#38bcfc] text-white rounded-[16px] text-[15px] font-semibold hover:opacity-95 transition-all shadow-[0_8px_20px_-6px_rgba(56,188,252,0.4)] inline-block"
            >
              Get free demo
            </Link>
          )}
        </div>

        {/* 1. TOP LEFT: AI Board Scanner */}
        <div className="hero-floating-card opacity-0 translate-y-12 scale-90 absolute top-[12%] left-[4%] lg:left-[8%] hidden lg:block z-0">
          {/* Back shadow element */}
          <div className="absolute w-[220px] h-[240px] bg-white rounded-2xl shadow-xl rotate-[-8deg] top-0 left-0 border border-black/5 opacity-50"></div>
          {/* Main Card */}
          <div className="w-[220px] bg-white rounded-2xl shadow-2xl relative transform rotate-[-4deg] border border-gray-100 p-4">
            {/* Scanner viewfinder UI */}
            <div className="w-full h-[120px] bg-gray-50 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden border border-gray-100">
              <div className="absolute inset-0 bg-[#38bcfc]/10 opacity-30"></div>

              <div className="hero-scanner-line absolute top-0 w-full h-[2px] bg-[#38bcfc] shadow-[0_0_8px_2px_rgba(56,188,252,0.6)] z-10"></div>

              <div className="text-[10px] font-bold text-gray-400 absolute top-2 left-2 z-0">
                Whiteboard
              </div>
              <div className="font-[Caveat] text-[#222] text-[18px] transform -rotate-12 opacity-60 z-0">
                E = mc² + ...
              </div>
            </div>

            <div className="flex gap-2 mb-2 items-center">
              <div className="w-6 h-6 rounded-full bg-blue-50 text-[#38bcfc] flex items-center justify-center">
                <Check size={12} strokeWidth={3} />
              </div>
              <span className="text-[12px] font-bold text-gray-900">
                Extracted & Saved!
              </span>
            </div>
            <p className="text-[10px] text-gray-500 leading-snug">
              AI converted your photo into formatted Markdown notes.
            </p>
          </div>
        </div>

        {/* 2. TOP RIGHT: AI Flashcards & Study */}
        <div className="hero-floating-card opacity-0 translate-y-12 scale-90 absolute top-[10%] right-[6%] lg:right-[10%] hidden xl:block z-0 perspective-[1000px]">
          <div className="w-[240px] bg-white p-5 rounded-2xl shadow-xl shadow-purple-500/10 rotate-[6deg] relative text-black">
            <div className="hero-flashcard-sparkle opacity-0 absolute -top-3 -right-3 w-8 h-8 bg-[#fca03e] rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(252,160,62,0.4)] transform rotate-12 z-20 text-white font-black text-[12px]">
              +1
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <span className="font-bold text-[14px] text-[#38bcfc]">Q</span>
              </div>
              <span className="text-[13px] font-bold tracking-wide">
                Interactive Flashcards
              </span>
            </div>

            {/* FLIPPING AREA */}
            <div className="w-full h-[80px] perspective-[1000px] mb-3">
              <div className="hero-flashcard-inner w-full h-full transform-3d relative">
                {/* Front Side */}
                <div className="absolute inset-0 bg-gray-50 shadow-inner text-gray-900 rounded-xl p-4 backface-hidden transform -rotate-2 flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-gray-400 mb-1">
                    FRONT
                  </p>
                  <h4 className="font-bold text-[12px] leading-snug">
                    What is the capital of France?
                  </h4>
                </div>
                {/* Back Side */}
                <div className="absolute inset-0 bg-[#1a1c20] shadow-inner text-white rounded-xl p-4 backface-hidden transform-[rotateY(180deg)] flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-gray-400 mb-1">
                    BACK
                  </p>
                  <h4 className="font-bold text-[12px] leading-snug text-[#38bcfc]">
                    Paris
                  </h4>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded font-semibold">
                Flip Over
              </span>
              <span className="text-[10px] font-medium text-gray-400">
                12 / 20 Left
              </span>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM LEFT: Collaborative Kanban Boards */}
        <div className="hero-floating-card opacity-0 translate-y-12 scale-90 absolute bottom-[5%] left-[4%] lg:left-[8%] hidden lg:block z-0">
          <div className="w-[340px] bg-[#f8f9fa] rounded-3xl shadow-xl border border-black/5 rotate-[-2deg] relative p-6 pt-5">
            {/* Fake cursor arrow interaction */}
            <div className="hero-kanban-cursor absolute bottom-4 right-10 w-6 h-6 z-30 opacity-0 drop-shadow-md">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.5 3.21V20.81L10.74 15.5H19.29L5.5 3.21Z"
                  fill="#111"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-[16px] text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#fca03e]"></span>{" "}
                Proyek Akhir
              </h3>
              <div className="flex -space-x-1.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-blue-600">
                  A
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-emerald-600">
                  B
                </div>
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              {/* Task 1 Animating Drag Card */}
              <div className="hero-kanban-card bg-white rounded-xl p-3 shadow-sm border border-gray-100 transform rotate-1 relative z-20">
                <div className="flex items-start justify-between">
                  <span className="text-[12px] font-bold text-gray-800 leading-snug pr-4">
                    Riset Jurnal Literatur
                  </span>
                  <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[9px] font-bold rounded">
                    High
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-[8px] font-bold flex items-center justify-center">
                    A
                  </div>
                  <span className="text-[9px] text-gray-400 font-medium font-mono">
                    Assigned
                  </span>
                </div>
              </div>

              {/* Task 2 */}
              <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 transform -rotate-1 opacity-60">
                <div className="flex items-start justify-between">
                  <span className="text-[12px] font-bold leading-snug line-through text-gray-400">
                    Draft Proposal Bab 1
                  </span>
                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-bold rounded line-through">
                    Done
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. BOTTOM RIGHT: Smart AI Planner */}
        <div className="hero-floating-card opacity-0 translate-y-12 scale-90 absolute bottom-[8%] right-[5%] lg:right-[10%] hidden lg:block z-0">
          <div className="w-[300px] bg-white rounded-3xl shadow-xl border border-black/5 rotate-[4deg] relative p-5">
            <h3 className="font-bold text-[14px] mb-4 text-foreground flex items-center gap-2">
              <Clock size={16} className="text-[#38bcfc]" /> AI Smart Planner
            </h3>

            <div className="relative pl-5 before:absolute before:inset-0 before:left-2.5 before:w-px before:bg-gray-100 mb-2">
              <div className="absolute left-[7px] top-1 w-2.5 h-2.5 rounded-full bg-[#fca03e] outline outline-4 outline-white"></div>
              <h4 className="text-[12px] font-bold text-gray-900 leading-tight">
                Calculus Study Session
              </h4>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                10:00 AM - 12:00 PM
              </p>

              {/* AI Suggestion Box Animating */}
              <div className="hero-ai-suggestion overflow-hidden origin-top bg-orange-50/50 border border-orange-100 rounded-lg flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-orange-100 text-[#fca03e] rounded text-[9px] font-bold uppercase shrink-0">
                  AI Suggestion
                </span>
                <p className="text-[9px] font-medium text-orange-700/80 leading-tight flex-1">
                  Focus on Chapter 4 derivatives first.
                </p>
              </div>
            </div>

            <div className="relative pl-5 before:absolute before:inset-0 before:left-2.5 before:w-px before:bg-gray-100">
              <div className="absolute left-[7px] top-1 w-2.5 h-2.5 rounded-full bg-gray-300 outline outline-4 outline-white"></div>
              <h4 className="text-[12px] font-bold text-gray-500 leading-tight">
                Lunch Break
              </h4>
              <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
                12:00 PM - 01:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
