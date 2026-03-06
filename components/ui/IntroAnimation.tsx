"use client";

import { useEffect, useState } from "react";

// ─── Phase Timeline ────────────────────────────────────────────────────────
// idle    → nothing
// showE   → "E" pops in, then a box draws around it
// push    → "dunai" slides from the right; box stretches with it
// hold    → "Edunai" complete, box around full word
// curtain → entire white screen slides UP revealing the page below
type Phase = "idle" | "showE" | "push" | "hold" | "curtain";

export default function IntroAnimation() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [visible, setVisible] = useState(false);
  const [showBox, setShowBox] = useState(false);

  useEffect(() => {
    // DEV MODE: always show on every refresh
    setVisible(true);

    // ── 1. "E" pops in
    const t1 = setTimeout(() => setPhase("showE"), 150);

    // ── 2. box appears around "E"
    const t2 = setTimeout(() => setShowBox(true), 500);

    // ── 3. "dunai" pushes in, box stretches to wrap full word
    const t3 = setTimeout(() => setPhase("push"), 2300);

    // ── 4. short hold with full "Edunai" + box
    const t4 = setTimeout(() => setPhase("hold"), 3400);

    // ── 5. curtain: whole white screen slides up
    const t5 = setTimeout(() => setPhase("curtain"), 3950);

    // ── 6. unmount
    const t6 = setTimeout(() => setVisible(false), 5200);

    return () => [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
  }, []);

  if (!visible) return null;

  const eVisible = phase !== "idle";
  const isPush = ["push", "hold", "curtain"].includes(phase);
  const isCurtain = phase === "curtain";

  return (
    /*
     * The ENTIRE white div IS the curtain.
     * When phase === "curtain" it rises up off screen via translateY(-100%).
     */
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        // curtain lift
        transform: isCurtain ? "translateY(-100%)" : "translateY(0)",
        transition: isCurtain
          ? "transform 1.1s cubic-bezier(0.76, 0, 0.24, 1)"
          : "none",
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────────────── */}
      {/*
       * position: relative so the absolute box child references THIS div.
       * As "dunai" expands (max-width transition), this flex div widens
       * naturally, and the absolutely-positioned box follows it — giving
       * the "box stretches around Edunai" effect automatically.
       */}
      <div
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "baseline",
        }}
      >
        {/* ── The expanding box ───────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            top: -14,
            bottom: -14,
            left: -18,
            right: -18,
            border: "1.8px solid #111111",
            borderRadius: 7,
            opacity: showBox ? 1 : 0,
            // small scale spring when box first appears
            transform: showBox
              ? "scaleY(1) scaleX(1)"
              : "scaleY(0.82) scaleX(0.88)",
            transformOrigin: "center center",
            transition: showBox
              ? "opacity 0.4s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)"
              : "none",
            pointerEvents: "none",
          }}
        />

        {/* ── "E" ─────────────────────────────────────────────────────── */}
        <span
          style={{
            fontFamily: "'Times New Roman', Times, serif",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 96,
            lineHeight: 1,
            color: "#111111",
            letterSpacing: "0.01em",
            display: "inline-block",
            opacity: eVisible ? 1 : 0,
            transform: eVisible
              ? "scale(1) translateY(0px)"
              : "scale(0.35) translateY(28px)",
            transition: eVisible
              ? "opacity 0.38s ease, transform 0.52s cubic-bezier(0.34,1.56,0.64,1)"
              : "none",
          }}
        >
          E
        </span>

        {/* ── "dunai" slides in from right ────────────────────────────── */}
        {/*
         * max-width goes 0 → unconstrained (500px cap).
         * This clips the text while it pushes the "E" left,
         * and simultaneously stretches the outer box.
         */}
        <div
          style={{
            overflow: "hidden",
            maxWidth: isPush ? 480 : 0,
            transition: isPush
              ? "max-width 0.58s cubic-bezier(0.16,1,0.3,1)"
              : "none",
            display: "inline-flex",
            alignItems: "baseline",
          }}
        >
          {/* "dun" — Times New Roman italic (matches "E") */}
          <span
            style={{
              fontFamily: "'Times New Roman', Times, serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 96,
              lineHeight: 1,
              color: "#111111",
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
              display: "inline-block",
            }}
          >
            dun
          </span>

          {/* "ai" — Be Vietnam Pro bold */}
          <span
            style={{
              fontFamily:
                "var(--font-be-vietnam-pro), 'Be Vietnam Pro', sans-serif",
              fontStyle: "normal",
              fontWeight: 800,
              fontSize: 96,
              lineHeight: 1,
              color: "#111111",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              display: "inline-block",
            }}
          >
            ai
          </span>
        </div>
      </div>
    </div>
  );
}
