"use client";

import { useFocusMode } from "@/components/ui/FocusModeContext";
import PomodoroTimer from "@/components/ui/PomodoroTimer";

/**
 * Renders the Pomodoro timer only when Focus Mode is active.
 * Must be a client component; mounted inside FocusModeProvider in layout.tsx.
 */
export default function FocusModeWrapper() {
  const { isFocused } = useFocusMode();
  if (!isFocused) return null;
  return <PomodoroTimer />;
}
