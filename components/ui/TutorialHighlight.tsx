"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTutorial, TUTORIAL_STEPS } from "./TutorialContext";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getElementRect(id: string): SpotlightRect | null {
  const el = document.getElementById(id);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
  };
}

export default function TutorialHighlight() {
  const {
    isActive,
    currentStep,
    totalSteps,
    currentStepData,
    stopTutorial,
    nextStep,
    prevStep,
    goToStep,
  } = useTutorial();

  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(
    null,
  );
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const [entering, setEntering] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const padding = 8;

  useEffect(() => setMounted(true), []);

  const updatePositions = useCallback(() => {
    if (!currentStepData) return;
    const rect = getElementRect(currentStepData.targetId);
    if (!rect) return;

    const paddedRect = {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };
    setSpotlightRect(paddedRect);

    // calc tooltip position
    const tooltipW = 320;
    const tooltipH = 220;
    const vpW = window.innerWidth;
    const vpH = window.innerHeight + window.scrollY;

    let top = rect.top + rect.height / 2 - tooltipH / 2;
    let left = rect.left + rect.width + 24;

    if (left + tooltipW > vpW - 16) {
      left = rect.left - tooltipW - 24;
    }
    if (left < 16) left = 16;
    if (top < 80) top = 80;
    if (top + tooltipH > vpH - 16) top = vpH - tooltipH - 16;

    setTooltipPos({ top, left });
  }, [currentStepData]);

  useEffect(() => {
    if (!isActive || !currentStepData) {
      setSpotlightRect(null);
      return;
    }

    setEntering(true);
    const t = setTimeout(() => {
      updatePositions();
      setEntering(false);
    }, 60);

    window.addEventListener("resize", updatePositions);
    window.addEventListener("scroll", updatePositions, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", updatePositions);
      window.removeEventListener("scroll", updatePositions, true);
    };
  }, [isActive, currentStepData, updatePositions]);

  // Scroll target element into view
  useEffect(() => {
    if (!isActive || !currentStepData) return;
    const el = document.getElementById(currentStepData.targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isActive, currentStepData]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") stopTutorial();
      if (e.key === "ArrowRight" || e.key === "Enter") nextStep();
      if (e.key === "ArrowLeft") prevStep();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isActive, stopTutorial, nextStep, prevStep]);

  if (!mounted || !isActive || !spotlightRect || !currentStepData) return null;

  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const progressPct = ((currentStep + 1) / totalSteps) * 100;

  const overlay = (
    <>
      {/* ── CSS ── */}
      <style>{`
        @keyframes tut-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes tut-tooltip-in {
          from { opacity: 0; transform: translateX(-12px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0)  scale(1); }
        }
        @keyframes tut-pulse-ring {
          0%   { box-shadow: 0 0 0 0   rgba(251,160,62,0.55); }
          70%  { box-shadow: 0 0 0 10px rgba(251,160,62,0); }
          100% { box-shadow: 0 0 0 0   rgba(251,160,62,0); }
        }
        @keyframes tut-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .tut-tooltip-enter {
          animation: tut-tooltip-in 0.32s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .tut-overlay-enter {
          animation: tut-fade-in 0.22s ease forwards;
        }
        .tut-spotlight-ring {
          animation: tut-pulse-ring 1.8s ease-out infinite;
        }
        .tut-step-dot {
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
      `}</style>

      {/* ── SVG Cutout Overlay ── */}
      <svg
        className="tut-overlay-enter fixed inset-0 pointer-events-auto"
        style={{ zIndex: 9998, width: "100vw", height: "100vh" }}
        onClick={stopTutorial}
      >
        <defs>
          <mask id="tut-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={spotlightRect.left}
              y={spotlightRect.top - window.scrollY}
              width={spotlightRect.width}
              height={spotlightRect.height}
              rx={14}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(15,17,22,0.72)"
          mask="url(#tut-mask)"
        />
      </svg>

      {/* ── Spotlight Ring ── */}
      <div
        className="tut-spotlight-ring fixed pointer-events-none"
        style={{
          zIndex: 9999,
          top: spotlightRect.top - window.scrollY - 2,
          left: spotlightRect.left - 2,
          width: spotlightRect.width + 4,
          height: spotlightRect.height + 4,
          borderRadius: 16,
          border: "2px solid rgba(251,160,62,0.8)",
          transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />

      {/* ── Corner decorators ── */}
      {[
        { top: -6, left: -6 },
        { top: -6, right: -6 },
        { bottom: -6, left: -6 },
        { bottom: -6, right: -6 },
      ].map((pos, i) => (
        <div
          key={i}
          className="fixed pointer-events-none"
          style={{
            zIndex: 10000,
            width: 12,
            height: 12,
            borderRadius: 3,
            background: "#fca03e",
            top:
              pos.top !== undefined
                ? spotlightRect.top - window.scrollY + pos.top
                : undefined,
            bottom:
              (pos as any).bottom !== undefined
                ? `calc(100vh - ${spotlightRect.top - window.scrollY + spotlightRect.height + (pos as any).bottom}px)`
                : undefined,
            left:
              pos.left !== undefined
                ? spotlightRect.left + pos.left
                : undefined,
            right:
              (pos as any).right !== undefined
                ? `calc(100vw - ${spotlightRect.left + spotlightRect.width + (pos as any).right}px)`
                : undefined,
            transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
      ))}

      {/* ── Tooltip Card ── */}
      <div
        ref={tooltipRef}
        className="tut-tooltip-enter fixed pointer-events-auto"
        style={{
          zIndex: 10001,
          top: tooltipPos.top - window.scrollY,
          left: tooltipPos.left,
          width: 320,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
            borderRadius: 20,
            boxShadow:
              "0 24px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(251,160,62,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
            border: "1px solid rgba(251,160,62,0.2)",
            overflow: "hidden",
          }}
        >
          {/* Header gradient bar */}
          <div
            style={{
              height: 3,
              background: `linear-gradient(90deg, #fca03e ${progressPct}%, #f3e8d0 ${progressPct}%)`,
              transition: "background 0.4s ease",
            }}
          />

          <div style={{ padding: "20px 22px 18px" }}>
            {/* Step badge + close */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    background: "linear-gradient(135deg, #fff7ed, #fef3c7)",
                    border: "1px solid #fed7aa",
                    borderRadius: 20,
                    padding: "3px 10px",
                  }}
                >
                  <Sparkles size={10} style={{ color: "#f59e0b" }} />
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#d97706",
                      letterSpacing: "0.06em",
                    }}
                  >
                    TUTORIAL
                  </span>
                </div>
                <span
                  style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}
                >
                  {currentStep + 1} / {totalSteps}
                </span>
              </div>
              <button
                onClick={stopTutorial}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  background: "#f9fafb",
                  border: "1px solid #f3f4f6",
                  cursor: "pointer",
                  color: "#9ca3af",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#fee2e2";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#ef4444";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#f9fafb";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#9ca3af";
                }}
              >
                <X size={13} />
              </button>
            </div>

            {/* Icon + Title */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #fff7ed, #fed7aa)",
                  border: "1px solid #fde68a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                {currentStepData.icon}
              </div>
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1.2,
                }}
              >
                {currentStepData.title}
              </h3>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: 13,
                color: "#4b5563",
                lineHeight: 1.65,
                marginBottom: 18,
              }}
            >
              {currentStepData.description}
            </p>

            {/* Step dots */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 5,
                marginBottom: 16,
              }}
            >
              {TUTORIAL_STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToStep(i)}
                  className="tut-step-dot"
                  style={{
                    width: i === currentStep ? 20 : 6,
                    height: 6,
                    borderRadius: 99,
                    background:
                      i === currentStep
                        ? "#fca03e"
                        : i < currentStep
                          ? "#fed7aa"
                          : "#e5e7eb",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              {!isFirst && (
                <button
                  onClick={prevStep}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "9px 14px",
                    borderRadius: 12,
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#6b7280",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#f9fafb";
                  }}
                >
                  <ChevronLeft size={14} />
                  Sebelumnya
                </button>
              )}
              <button
                onClick={nextStep}
                style={{
                  flex: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "9px 14px",
                  borderRadius: 12,
                  background: isLast
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "linear-gradient(135deg, #fca03e, #f59e0b)",
                  border: "none",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                  cursor: "pointer",
                  boxShadow: isLast
                    ? "0 4px 12px rgba(16,185,129,0.3)"
                    : "0 4px 12px rgba(252,160,62,0.35)",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateY(0)";
                }}
              >
                {isLast ? (
                  <>✓ Selesai!</>
                ) : (
                  <>
                    Selanjutnya <ChevronRight size={14} />
                  </>
                )}
              </button>
            </div>

            {/* Keyboard hint */}
            <p
              style={{
                textAlign: "center",
                fontSize: 10,
                color: "#d1d5db",
                marginTop: 12,
              }}
            >
              ← → navigasi •{" "}
              <kbd
                style={{
                  background: "#f3f4f6",
                  padding: "1px 4px",
                  borderRadius: 4,
                  fontFamily: "monospace",
                }}
              >
                Esc
              </kbd>{" "}
              tutup
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(overlay, document.body);
}
