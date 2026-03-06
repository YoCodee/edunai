"use client";

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FileText,
  Calendar,
  BrainCircuit,
  Users,
  MessageSquare,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// ─── SVG coordinate system: viewBox="0 0 1000 360" ───────────────────────────
// Hub center: (500, 180) | hub left-edge: ~438 | hub right-edge: ~562

/** 7 left paths — each pill position → hub left edge */
const LEFT_PATHS = [
  "M 28 78  C 160 78  300 180 438 180", // WhatsApp Groups  (top-left)
  "M 228 28 C 310 28  380 120 438 180", // Loose Papers     (top-mid)
  "M 18 158 C 180 158 320 178 438 180", // Google Calendar  (mid-left)
  "M 235 150 C 310 150 380 168 438 180", // Trello / Asana   (mid)
  "M 82 240 C 220 220 350 198 438 180", // IMG_4092.JPG     (lower-left)
  "M 262 232 C 340 210 400 195 438 180", // Notion Links     (lower-mid)
  "M 158 298 C 280 270 380 220 438 180", // Sticky Notes     (bottom)
];

/** 5 right paths — hub right edge → each after-pill */
const RIGHT_PATHS = [
  "M 562 180 C 620 180 650 50  720 50", // Smart schedule   (top)
  "M 562 180 C 615 180 640 104 720 104", // Unified group    (upper-mid)
  "M 562 180 C 625 196 682 190 720 180", // Files            (center — slight curve)
  "M 562 180 C 615 180 640 256 720 256", // Real-time        (lower-mid)
  "M 562 180 C 620 180 650 312 720 312", // Flashcards       (bottom)
];

/** Before pill labels + their approximate SVG positions */
const BEFORE_PILLS = [
  {
    label: "WhatsApp Groups",
    style: { top: "18%", left: "0%", rotate: "-5deg" },
  },
  { label: "Loose Papers", style: { top: "4%", left: "20%", rotate: "4deg" } },
  {
    label: "Google Calendar",
    style: { top: "40%", left: "0%", rotate: "0deg" },
  },
  {
    label: "Trello / Asana",
    style: { top: "38%", left: "20%", rotate: "8deg" },
  },
  { label: "IMG_4092.JPG", style: { top: "62%", left: "5%", rotate: "-3deg" } },
  {
    label: "Notion Links",
    style: { top: "60%", left: "23%", rotate: "12deg" },
  },
  { label: "Sticky Notes", style: { top: "80%", left: "13%", rotate: "0deg" } },
];

const AFTER_ITEMS = [
  {
    icon: Calendar,
    color: "bg-blue-50   text-blue-500",
    label: "Smart schedule & tasks sync",
  },
  {
    icon: Users,
    color: "bg-purple-50 text-purple-500",
    label: "Unified group project board",
  },
  {
    icon: FileText,
    color: "bg-green-50  text-green-500",
    label: "Files (structured & OCR searchable)",
  },
  {
    icon: MessageSquare,
    color: "bg-orange-50 text-orange-500",
    label: "Real-time team discussions",
  },
  {
    icon: BrainCircuit,
    color: "bg-indigo-50 text-indigo-500",
    label: "Auto-generated Flashcards",
  },
];

export default function BeforeAfter() {
  const sectionRef = useRef<HTMLElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Dynamic arrays of SVG element refs
  const leftPathRefs = useRef<(SVGPathElement | null)[]>([]);
  const rightPathRefs = useRef<(SVGPathElement | null)[]>([]);
  const leftCoreRefs = useRef<(SVGCircleElement | null)[]>([]);
  const leftGlowRefs = useRef<(SVGCircleElement | null)[]>([]);
  const rightCoreRefs = useRef<(SVGCircleElement | null)[]>([]);
  const rightGlowRefs = useRef<(SVGCircleElement | null)[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // ── 0. Header fade-up (before pin triggers) ──────────────────
      gsap.from(headerRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      });

      // ── Prep: hide all paths & orbs initially ─────────────────────
      [...leftPathRefs.current, ...rightPathRefs.current].forEach((p) => {
        if (!p) return;
        const len = p.getTotalLength();
        gsap.set(p, {
          strokeDasharray: len,
          strokeDashoffset: len,
          opacity: 1,
        });
      });

      // Position orbs at the START of their respective paths (invisible)
      leftPathRefs.current.forEach((path, i) => {
        if (!path) return;
        const pt = path.getPointAtLength(0);
        gsap.set(leftGlowRefs.current[i], {
          opacity: 0,
          attr: { cx: pt.x, cy: pt.y },
        });
        gsap.set(leftCoreRefs.current[i], {
          opacity: 0,
          attr: { cx: pt.x, cy: pt.y },
        });
      });
      // Right orbs start at hub right-edge
      gsap.set([...rightGlowRefs.current, ...rightCoreRefs.current], {
        opacity: 0,
        attr: { cx: 562, cy: 180 },
      });

      // ── Main pinned timeline ──────────────────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=180%",
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
        },
      });

      // PHASE 0 — Before pills appear first, hub comes in slightly after
      tl.from(".before-pill", {
        opacity: 0,
        scale: 0.7,
        duration: 0.12,
        stagger: 0.025,
        ease: "back.out(1.6)",
      });
      tl.from(
        hubRef.current,
        {
          opacity: 0,
          scale: 0.4,
          rotation: -12,
          duration: 0.12,
          ease: "back.out(1.9)",
        },
        ">0.04", // hub appears AFTER all pills are visible
      );

      // Small pause so the user can see before state clearly
      tl.to({}, { duration: 0.08 });

      // PHASE 1 — Reveal left paths (all at once, streamed)
      tl.to(
        leftPathRefs.current,
        {
          strokeDashoffset: 0,
          duration: 0.28,
          stagger: 0.02,
          ease: "none",
        },
        "+=0.05",
      );

      // PHASE 2a — Fade IN left orbs at path-start (reversible tl tween)
      const leftOrbEls = [
        ...leftGlowRefs.current.filter(Boolean),
        ...leftCoreRefs.current.filter(Boolean),
      ];
      tl.to(
        leftOrbEls,
        { opacity: 1, duration: 0.04, stagger: 0.008 },
        ">-0.05",
      );

      // PHASE 2b — Orbs travel LEFT → HUB
      const leftProxy = { p: 0 };
      tl.to(
        leftProxy,
        {
          p: 1,
          duration: 0.3,
          ease: "power2.in",
          onUpdate() {
            leftPathRefs.current.forEach((path, i) => {
              if (!path) return;
              const len = path.getTotalLength();
              const pt = path.getPointAtLength(leftProxy.p * len);
              gsap.set(leftCoreRefs.current[i], {
                attr: { cx: pt.x, cy: pt.y },
              });
              gsap.set(leftGlowRefs.current[i], {
                attr: { cx: pt.x, cy: pt.y },
              });
            });
          },
        },
        ">-0.02",
      );

      // Fade OUT left orbs when they reach hub (reversible)
      tl.to(leftOrbEls, { opacity: 0, duration: 0.04 }, ">-0.01");

      // PHASE 3 — Hub burst when orbs arrive
      tl.to(
        hubRef.current,
        {
          boxShadow:
            "0 0 0 32px rgba(252,160,62,0), 0 20px 60px rgba(252,160,62,0.6)",
          scale: 1.08,
          duration: 0.06,
          yoyo: true,
          repeat: 1,
          ease: "power2.out",
        },
        "<0.8",
      );

      // PHASE 4 — Reveal right paths (fan out from hub)
      tl.to(
        rightPathRefs.current,
        {
          strokeDashoffset: 0,
          duration: 0.22,
          stagger: 0.025,
          ease: "none",
        },
        ">-0.02",
      );

      // PHASE 5a — Fade IN right orbs at hub origin (reversible)
      const rightOrbEls = [
        ...rightGlowRefs.current.filter(Boolean),
        ...rightCoreRefs.current.filter(Boolean),
      ];
      tl.to(
        rightOrbEls,
        { opacity: 1, duration: 0.04, stagger: 0.008 },
        ">-0.05",
      );

      // PHASE 5b — Orbs travel HUB → AFTER PILLS
      const rightProxy = { p: 0 };
      tl.to(
        rightProxy,
        {
          p: 1,
          duration: 0.28,
          ease: "power2.out",
          onUpdate() {
            rightPathRefs.current.forEach((path, i) => {
              if (!path) return;
              const len = path.getTotalLength();
              const pt = path.getPointAtLength(rightProxy.p * len);
              gsap.set(rightCoreRefs.current[i], {
                attr: { cx: pt.x, cy: pt.y },
              });
              gsap.set(rightGlowRefs.current[i], {
                attr: { cx: pt.x, cy: pt.y },
              });
            });
          },
        },
        ">-0.02",
      );

      // PHASE 6 — After pills cascade in as orbs arrive
      tl.from(
        ".after-pill",
        {
          opacity: 0,
          x: -24,
          duration: 0.07,
          stagger: 0.04,
          ease: "power3.out",
        },
        "<0.65",
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-[#fbfcff] py-24 relative overflow-hidden font-sans border-t border-gray-100 px-6"
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 75%, rgba(252,160,62,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-[1200px] mx-auto text-center relative z-10">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div ref={headerRef} className="mb-20">
          <div className="inline-flex items-center gap-2 text-[12px] font-bold text-gray-400 tracking-widest uppercase mb-6 bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
            Before <span className="mx-1">→</span> After
          </div>
          <h2
            className="text-[42px] md:text-[56px] font-medium leading-[1.05] tracking-tight text-[#1a1c20] max-w-3xl mx-auto mb-6"
            style={{ fontFamily: "serif" }}
          >
            From a chaotic semester to a <br className="hidden md:block" />
            streamlined academic life
          </h2>
          <p className="text-[17px] text-gray-500 max-w-xl mx-auto leading-relaxed">
            Clearer schedules, no missed deadlines, and your study group always
            on the same page — without switching between 5 different apps.
          </p>
        </div>

        {/* ── Diagram canvas ──────────────────────────────────────── */}
        <div
          className="relative w-full max-w-[1000px] mx-auto"
          style={{ height: 360 }}
        >
          {/* ════ SVG layer ════════════════════════════════════════ */}
          <svg
            viewBox="0 0 1000 360"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ overflow: "visible" }}
          >
            <defs>
              {/* Left-path gradient: gray → orange */}
              <linearGradient id="leftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e5e7eb" />
                <stop offset="100%" stopColor="#fca03e" />
              </linearGradient>
              {/* Right-path gradient: orange → orange-light */}
              <linearGradient id="rightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fca03e" />
                <stop offset="100%" stopColor="#ffcc88" />
              </linearGradient>
              {/* Orb radial glow */}
              <radialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fca03e" stopOpacity="0.85" />
                <stop offset="45%" stopColor="#fca03e" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#fca03e" stopOpacity="0" />
              </radialGradient>
              {/* Blur glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glowStrong">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ── LEFT animated paths (7) ── */}
            {LEFT_PATHS.map((d, i) => (
              <path
                key={`lp-${i}`}
                ref={(el) => {
                  leftPathRefs.current[i] = el;
                }}
                d={d}
                fill="none"
                stroke="url(#leftGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0"
                filter="url(#glow)"
              />
            ))}

            {/* ── RIGHT animated paths (5) ── */}
            {RIGHT_PATHS.map((d, i) => (
              <path
                key={`rp-${i}`}
                ref={(el) => {
                  rightPathRefs.current[i] = el;
                }}
                d={d}
                fill="none"
                stroke="url(#rightGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0"
                filter="url(#glow)"
              />
            ))}

            {/* ── LEFT orbs (7): glow halo + core ── */}
            {LEFT_PATHS.map((_, i) => (
              <g key={`lo-${i}`}>
                <circle
                  ref={(el) => {
                    leftGlowRefs.current[i] = el;
                  }}
                  cx={-200}
                  cy={180}
                  r={10}
                  fill="url(#orbGlow)"
                  opacity={0}
                />
                <circle
                  ref={(el) => {
                    leftCoreRefs.current[i] = el;
                  }}
                  cx={-200}
                  cy={180}
                  r={5}
                  fill="#fca03e"
                  opacity={0}
                  filter="url(#glow)"
                />
              </g>
            ))}

            {/* ── RIGHT orbs (5): glow halo + core ── */}
            {RIGHT_PATHS.map((_, i) => (
              <g key={`ro-${i}`}>
                <circle
                  ref={(el) => {
                    rightGlowRefs.current[i] = el;
                  }}
                  cx={-200}
                  cy={180}
                  r={10}
                  fill="url(#orbGlow)"
                  opacity={0}
                />
                <circle
                  ref={(el) => {
                    rightCoreRefs.current[i] = el;
                  }}
                  cx={-200}
                  cy={180}
                  r={5}
                  fill="#ffb05c"
                  opacity={0}
                  filter="url(#glow)"
                />
              </g>
            ))}
          </svg>

          {/* ════ Before Pills overlay ═════════════════════════════ */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {BEFORE_PILLS.map(({ label, style }) => (
              <div
                key={label}
                className="before-pill absolute bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-500 text-[13px] font-medium px-4 py-2 rounded-full shadow-sm whitespace-nowrap"
                style={{
                  top: style.top,
                  left: style.left,
                  transform: `rotate(${style.rotate})`,
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* ════ Center Edunai Hub ════════════════════════════════ */}
          <div
            className="absolute z-20 flex flex-col items-center"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              ref={hubRef}
              className="w-[165px] h-[165px] rounded-[36px] flex items-center justify-center transition-transform duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #fca03e 0%, #ffb05c 100%)",
                boxShadow: "0 24px 48px rgba(252,160,62,0.38)",
              }}
            >
              <span
                className="text-white text-[32px] font-bold"
                style={{ fontFamily: "serif" }}
              >
                Edunai
              </span>
            </div>
            <p className="text-[12px] font-bold text-gray-400 mt-4 tracking-wide uppercase">
              Your Academic Hub
            </p>
          </div>

          {/* ════ After Pills ══════════════════════════════════════ */}
          <div
            className="absolute right-0 top-0 h-full flex flex-col justify-center gap-[18px] z-10"
            style={{ width: "28%" }}
          >
            {AFTER_ITEMS.map(({ icon: Icon, color, label }) => (
              <div
                key={label}
                className="after-pill flex items-center gap-2.5 bg-white pl-1 pr-4 py-1.5 rounded-full border border-gray-100 shadow-sm w-fit hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${color}`}
                >
                  <Icon size={14} strokeWidth={2.5} />
                </div>
                <span className="text-[13px] font-bold text-gray-800 whitespace-nowrap">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* end diagram */}
      </div>
    </section>
  );
}
