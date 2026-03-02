"use client";

import { useEffect, useState } from "react";

const COLORS = [
  "#fca03e",
  "#38bcfc",
  "#a78bfa",
  "#34d399",
  "#f87171",
  "#facc15",
  "#fb7185",
  "#60a5fa",
];

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
}

interface ConfettiProps {
  active: boolean;
  /** How many particles to spawn */
  count?: number;
}

export default function Confetti({ active, count = 32 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) return;
    const items: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 8,
      delay: Math.random() * 0.6,
      duration: 1.1 + Math.random() * 0.7,
    }));
    setParticles(items);
    const t = setTimeout(() => setParticles([]), 2200);
    return () => clearTimeout(t);
  }, [active, count]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-50">
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            top: 0,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}
