"use client";

import { useState, useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { Zap, Brain, BookOpen, Target, Award } from "lucide-react";

interface StudyNote {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  accentColor: string;
  orbColor: string;
  initialX: number;
  initialY: number;
  initialRotation: number;
  orbPosition: {
    top: string;
    right?: string;
    left?: string;
    bottom?: string;
  };
}

const NOTES_CONFIG: StudyNote[] = [
  {
    id: 1,
    title: "Quick Capture 1",
    description:
      "Snap photos of your notes and let AI instantly organize them for you.",
    icon: <Zap className="w-5 h-5" />,
    bgColor: "bg-brand-50",
    borderColor: "border-brand-200",
    accentColor: "text-brand-600",
    orbColor: "bg-brand-500",
    initialX: 300,
    initialY: 70,
    initialRotation: -6,
    orbPosition: { top: "-16px", right: "-16px" },
  },
  {
    id: 2,
    title: "Smart Organization",
    description:
      "AI sorts and structures your notes into clear, digestible sections automatically.",
    icon: <Brain className="w-5 h-5" />,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    accentColor: "text-blue-600",
    orbColor: "bg-blue-500",
    initialX: 820,
    initialY: 120,
    initialRotation: 4,
    orbPosition: { top: "-12px", right: "-12px" },
  },
  {
    id: 3,
    title: "Interactive Learning",
    description:
      "Access flashcards, quizzes, and summaries to master your material faster.",
    icon: <BookOpen className="w-5 h-5" />,
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    accentColor: "text-purple-600",
    orbColor: "bg-purple-500",
    initialX: 80,
    initialY: 280,
    initialRotation: 5,
    orbPosition: { top: "-14px", left: "-12px" },
  },
  {
    id: 4,
    title: "Personalized Path",
    description:
      "Get customized study recommendations based on your learning patterns.",
    icon: <Target className="w-5 h-5" />,
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    accentColor: "text-amber-600",
    orbColor: "bg-brand-500",
    initialX: 720,
    initialY: 340,
    initialRotation: -5,
    orbPosition: { top: "-16px", right: "-14px" },
  },
  {
    id: 5,
    title: "Track Progress",
    description:
      "Monitor your improvements and celebrate milestones on your learning journey.",
    icon: <Award className="w-5 h-5" />,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    accentColor: "text-blue-600",
    orbColor: "bg-blue-500",
    initialX: 300,
    initialY: 480,
    initialRotation: 3,
    orbPosition: { top: "-18px", right: "-10px" },
  },
];

export default function DraggableStudyNotes() {
  const [notes, setNotes] = useState<
    (StudyNote & { x: number; y: number; isDragging: boolean })[]
  >(
    NOTES_CONFIG.map((config) => ({
      ...config,
      x: config.initialX,
      y: config.initialY,
      isDragging: false,
    })),
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const dragStateRef = useRef<{
    index: number;
    startX: number;
    startY: number;
    startMouseX: number;
    startMouseY: number;
  } | null>(null);

  // Animation on mount
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.from(card, {
            y: 50,
            opacity: 0,
            duration: 0.8,
            delay: index * 0.12,
            ease: "power3.out",
          });
        }
      });
    });
    return () => ctx.revert();
  }, []);

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    index: number,
  ) => {
    const card = cardsRef.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    dragStateRef.current = {
      index,
      startX: notes[index].x,
      startY: notes[index].y,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
    };

    setNotes((prev) =>
      prev.map((note, i) =>
        i === index ? { ...note, isDragging: true } : note,
      ),
    );
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragStateRef.current || !containerRef.current) return;

    const { index, startX, startY, startMouseX, startMouseY } =
      dragStateRef.current;

    const deltaX = e.clientX - startMouseX;
    const deltaY = e.clientY - startMouseY;

    const newX = startX + deltaX;
    const newY = startY + deltaY;

    // Get container bounds
    const containerRect = containerRef.current.getBoundingClientRect();
    const cardElement = cardsRef.current[index];
    if (!cardElement) return;

    const cardRect = cardElement.getBoundingClientRect();
    const maxX = containerRect.width - cardRect.width;
    const maxY = containerRect.height - cardRect.height;

    // Constrain to container
    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));

    setNotes((prev) =>
      prev.map((note, i) =>
        i === index ? { ...note, x: constrainedX, y: constrainedY } : note,
      ),
    );
  };

  const handleMouseUp = () => {
    if (!dragStateRef.current) return;

    const { index } = dragStateRef.current;
    setNotes((prev) =>
      prev.map((note, i) =>
        i === index ? { ...note, isDragging: false } : note,
      ),
    );
    dragStateRef.current = null;
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 bg-blue-50 rounded-full border border-blue-200 mb-6">
            <span className="text-sm font-semibold text-blue-700">
              Interactive Features
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Your Learning Journey
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Drag the cards to explore the key benefits of Senai
          </p>
        </div>

        {/* Draggable Notes Container - Grid Style */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="relative h-[650px] md:h-[850px] cursor-grab active:cursor-grabbing rounded-3xl overflow-hidden"
          style={{
            perspective: "1200px",
            background: "#ffffff",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)",
            border: "1px solid rgba(200,190,180,0.2)",
          }}
        >
          {/* Grid Pattern Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(0deg, rgba(100,100,100,0.25) 1px, transparent 1px),
                linear-gradient(90deg, rgba(100,100,100,0.25) 1px, transparent 1px)
              `,
              backgroundSize: "24px 24px",
              opacity: 0.4,
            }}
          />

          {/* SVG Connecting Lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ top: 0, left: 0 }}
          >
            {/* Calculate card center positions */}
            {/* Card dimensions: width 288px (w-72), height ~160px */}
            {/* Line from card 1 to card 2 */}
            <line
              x1={notes[0].x + 144}
              y1={notes[0].y + 80}
              x2={notes[1].x + 144}
              y2={notes[1].y + 80}
              stroke="#b8a599"
              strokeWidth="2"
              strokeDasharray="8,6"
              opacity="0.35"
            />
            {/* Line from card 2 to card 3 */}
            <line
              x1={notes[1].x + 144}
              y1={notes[1].y + 80}
              x2={notes[2].x + 144}
              y2={notes[2].y + 80}
              stroke="#b8a599"
              strokeWidth="2"
              strokeDasharray="8,6"
              opacity="0.35"
            />
            {/* Line from card 3 to card 4 */}
            <line
              x1={notes[2].x + 144}
              y1={notes[2].y + 80}
              x2={notes[3].x + 144}
              y2={notes[3].y + 80}
              stroke="#b8a599"
              strokeWidth="2"
              strokeDasharray="8,6"
              opacity="0.35"
            />
            {/* Line from card 4 to card 5 */}
            <line
              x1={notes[3].x + 144}
              y1={notes[3].y + 80}
              x2={notes[4].x + 144}
              y2={notes[4].y + 80}
              stroke="#b8a599"
              strokeWidth="2"
              strokeDasharray="8,6"
              opacity="0.35"
            />
          </svg>

          {/* Cards */}
          {notes.map((note, index) => (
            <div
              key={note.id}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              onMouseDown={(e) => handleMouseDown(e, index)}
              style={{
                transform: `translate(${note.x}px, ${note.y}px) rotateZ(${note.initialRotation}deg) ${note.isDragging ? "scale(1.05)" : "scale(1)"}`,
                transition: note.isDragging
                  ? "none"
                  : "transform 0.4s cubic-bezier(0.23, 1, 0.320, 1)",
              }}
              className={`absolute w-44 md:w-72 rounded-2xl p-3 md:p-6 cursor-grab active:cursor-grabbing select-none transition-shadow duration-300 ${note.bgColor} ${note.borderColor} border-2 shadow-[0_10px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]`}
            >
              {/* Floating Orb */}
              <div
                className={`absolute w-6 h-6 md:w-12 md:h-12 ${note.orbColor} rounded-full shadow-lg`}
                style={{
                  top: note.orbPosition.top,
                  right: note.orbPosition.right,
                  left: note.orbPosition.left,
                  bottom: note.orbPosition.bottom,
                  animation: "float 3s ease-in-out infinite",
                  animationDelay: `${index * 0.2}s`,
                }}
              />

              {/* Number Badge */}
              <div className="absolute -top-2 -left-2 md:-top-4 md:-left-4 w-6 h-6 md:w-10 md:h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center font-bold text-xs md:text-base text-gray-700 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                0{note.id}
              </div>

              {/* Icon */}
              <div
                className={`${note.accentColor} mb-2 md:mb-4 scale-50 md:scale-100 origin-left`}
              >
                {note.icon}
              </div>

              {/* Content */}
              <h3
                className={`text-sm md:text-lg font-bold mb-1 md:mb-2 ${note.accentColor} leading-tight`}
              >
                {note.title}
              </h3>
              <p className="text-gray-700 text-[10px] md:text-sm leading-snug lg:leading-relaxed">
                {note.description}
              </p>
            </div>
          ))}

          {/* Explore Hint */}
          <div className="absolute bottom-8 right-8 text-gray-500 text-sm flex items-center gap-2 pointer-events-none">
            <span>Explore</span>
            <svg
              className="w-5 h-5 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6 text-lg">
            Ready to transform your study routine?
          </p>
          <a
            href="/register"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Start Learning Today
            <span className="ml-2">→</span>
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }
      `}</style>
    </section>
  );
}
