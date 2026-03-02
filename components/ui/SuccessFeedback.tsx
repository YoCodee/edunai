"use client";

import { useState, useCallback } from "react";
import { CheckCircle } from "lucide-react";

interface SuccessFeedbackProps {
  size?: number;
  color?: string;
}

/** Renders an animated ✓ checkmark. Call `trigger()` to fire the animation. */
export function useSuccessFeedback() {
  const [visible, setVisible] = useState(false);

  const trigger = useCallback(() => {
    setVisible(true);
    setTimeout(() => setVisible(false), 2200);
  }, []);

  return { visible, trigger };
}

export default function SuccessFeedback({
  size = 48,
  color = "#22c55e",
}: SuccessFeedbackProps) {
  return (
    <div
      className="success-pop pointer-events-none"
      style={{ color, display: "inline-flex" }}
    >
      <CheckCircle size={size} strokeWidth={2.5} />
    </div>
  );
}
