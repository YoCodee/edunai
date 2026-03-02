"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Coffee, SkipForward } from "lucide-react";

const WORK_MIN = 25;
const BREAK_MIN = 5;

type Phase = "work" | "break";

export default function PomodoroTimer() {
  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(WORK_MIN * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  const totalSeconds = phase === "work" ? WORK_MIN * 60 : BREAK_MIN * 60;
  const pct = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const reset = useCallback(() => {
    setRunning(false);
    setSecondsLeft(phase === "work" ? WORK_MIN * 60 : BREAK_MIN * 60);
  }, [phase]);

  const skip = useCallback(() => {
    setRunning(false);
    if (phase === "work") {
      setPhase("break");
      setSecondsLeft(BREAK_MIN * 60);
      setSessions((s) => s + 1);
    } else {
      setPhase("work");
      setSecondsLeft(WORK_MIN * 60);
    }
  }, [phase]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setRunning(false);
          // Auto-switch
          if (phase === "work") {
            setPhase("break");
            setSessions((c) => c + 1);
            return BREAK_MIN * 60;
          } else {
            setPhase("work");
            return WORK_MIN * 60;
          }
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, phase]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  // SVG ring
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = circ - (pct / 100) * circ;

  return (
    <div className="fixed bottom-6 right-6 z-9999 select-none">
      <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-4 w-[180px] flex flex-col items-center gap-3">
        {/* Phase badge */}
        <div className="flex items-center gap-1.5">
          {phase === "work" ? (
            <span className="text-[11px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full tracking-wide">
              FOCUS
            </span>
          ) : (
            <span className="text-[11px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full tracking-wide flex items-center gap-1">
              <Coffee size={10} /> BREAK
            </span>
          )}
          <span className="text-[10px] text-gray-400">#{sessions + 1}</span>
        </div>

        {/* SVG ring + time */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" width="80" height="80">
            <circle
              cx="40"
              cy="40"
              r={r}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="5"
            />
            <circle
              cx="40"
              cy="40"
              r={r}
              fill="none"
              stroke={phase === "work" ? "#fca03e" : "#38bcfc"}
              strokeWidth="5"
              strokeDasharray={circ}
              strokeDashoffset={dash}
              strokeLinecap="round"
              className={running ? "pomo-ring-active" : ""}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <span className="text-[22px] font-black text-gray-900 tracking-tight">
            {mm}:{ss}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={() => setRunning((r) => !r)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all text-white"
            style={{ background: phase === "work" ? "#fca03e" : "#38bcfc" }}
          >
            {running ? <Pause size={12} /> : <Play size={12} />}
            {running ? "Pause" : "Start"}
          </button>
          <button
            onClick={skip}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
          >
            <SkipForward size={13} />
          </button>
        </div>

        <p className="text-[10px] text-gray-400">Press Esc to exit</p>
      </div>
    </div>
  );
}
