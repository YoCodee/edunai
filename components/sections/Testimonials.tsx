"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const testimonialsData = [
  {
    id: 1,
    name: "Amanda Peterson",
    role: "Computer Science Major",
    image: "https://i.pravatar.cc/150?u=amanda",
    rating: 5.0,
    text: "Edunai has totally streamlined my semester. The AI whiteboard scanner automatically generates flashcards and notes from lectures, saving my team hours of manual typing and organization.",
  },
  {
    id: 2,
    name: "James Carter",
    role: "Medical Student",
    image: "https://i.pravatar.cc/150?u=james",
    rating: 5.0,
    text: "The platform is easy to use, keeps everything in one place, and helps our study group stay on top of things without extra hassle. Highly recommend it to all med students!",
  },
  {
    id: 3,
    name: "Sarah Mitchell",
    role: "Design Student",
    image: "https://i.pravatar.cc/150?u=sarah",
    rating: 4.9,
    text: "I love the collaborative kanban boards for our group projects. We can seamlessly assign tasks and sync everything to our personal schedules. It's an absolute game changer!",
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<SVGPathElement>(null);

  const centerCardRef = useRef<HTMLDivElement>(null);
  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(1); // Default center is James (index 1)

  useEffect(() => {
    // Initial states for GSAP
    gsap.set(flapRef.current, { transformOrigin: "top center", rotationX: 0 });
    gsap.set(centerCardRef.current, {
      y: 150,
      scale: 0.8,
      opacity: 0,
      zIndex: 30,
    });
    gsap.set(leftCardRef.current, {
      x: 0,
      y: 150,
      rotation: 0,
      scale: 0.8,
      opacity: 0,
      zIndex: 10,
    });
    gsap.set(rightCardRef.current, {
      x: 0,
      y: 150,
      rotation: 0,
      scale: 0.8,
      opacity: 0,
      zIndex: 10,
    });
    gsap.set(controlsRef.current, { opacity: 0, y: 20 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
        end: "+=1000",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });

    // 1. Envelope flap opens up
    tl.to(flapRef.current, {
      rotationX: -180,
      duration: 1,
      ease: "power2.inOut",
    });

    // 2. Center card slides up out of envelope
    tl.to(
      centerCardRef.current,
      { y: -30, scale: 1, opacity: 1, duration: 1.5, ease: "power2.out" },
      "-=0.3",
    );

    // 3. Envelope fades out & moves down
    tl.to(
      envelopeRef.current,
      { y: 300, opacity: 0, duration: 1.2, ease: "power2.in" },
      "+=0.2",
    );

    // 4. Side cards emerge from behind the center card, scaling and rotating
    tl.to(
      leftCardRef.current,
      {
        x: -380,
        y: -20,
        rotation: -12,
        opacity: 0.6,
        duration: 1.5,
        ease: "back.out(1.2)",
      },
      "-=0.5",
    );
    tl.to(
      rightCardRef.current,
      {
        x: 380,
        y: -20,
        rotation: 12,
        opacity: 0.6,
        duration: 1.5,
        ease: "back.out(1.2)",
      },
      "<",
    );

    // 5. Controls fade in
    tl.to(controlsRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.5");

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonialsData.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonialsData.length) % testimonialsData.length,
    );
  };

  const getCardData = (offset: number) => {
    return testimonialsData[
      (currentIndex + offset + testimonialsData.length) %
        testimonialsData.length
    ];
  };

  return (
    <section
      ref={sectionRef}
      className="bg-[#fbfcff] py-24 min-h-screen relative overflow-hidden font-sans border-t border-gray-100 flex flex-col justify-center"
    >
      <div className="max-w-[1200px] mx-auto px-6 relative z-10 flex flex-col items-center w-full">
        {/* Header */}
        <div className="text-center mb-10 w-full">
          <h2 className="text-[44px] md:text-[60px] font-bold tracking-tight text-[#1a1c20] mb-4">
            Words of Appreciation
          </h2>
          <p className="text-[17px] text-gray-500 max-w-lg mx-auto">
            Thousands of students, from freshmen to graduates, use Edunai to
            manage their academic life and collaborate perfectly.
          </p>
        </div>

        {/* Animation Container */}
        <div
          ref={containerRef}
          className="relative w-full max-w-[1000px] h-[550px] flex items-center justify-center mt-12"
        >
          {/* Side Cards (Left and Right) */}
          <div
            ref={leftCardRef}
            className="absolute inset-0 m-auto w-[340px] h-[380px] pointer-events-none"
          >
            <TestimonialCard data={getCardData(-1)} />
          </div>
          <div
            ref={rightCardRef}
            className="absolute inset-0 m-auto w-[340px] h-[380px] pointer-events-none"
          >
            <TestimonialCard data={getCardData(1)} />
          </div>

          {/* Center Card */}
          <div
            ref={centerCardRef}
            className="absolute inset-0 m-auto w-[340px] h-[380px]"
          >
            <TestimonialCard data={getCardData(0)} active />
          </div>

          {/* Navigation Controls */}
          <div
            ref={controlsRef}
            className="absolute -bottom-8 left-0 right-0 flex justify-center gap-4 z-50"
          >
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-full border border-gray-200 bg-white shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:scale-110 transition-all"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full border border-gray-200 bg-white shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:scale-110 transition-all"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Envelope Graphic */}
          <div
            ref={envelopeRef}
            className="absolute bottom-[0%] left-1/2 -translate-x-1/2 w-[440px] h-[280px] z-40 pointer-events-none"
          >
            {/* Back of envelope (Inside) */}
            <svg
              width="440"
              height="280"
              viewBox="0 0 440 280"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute bottom-0 z-0"
            >
              <path
                d="M0 80L220 220L440 80V260C440 271.046 431.046 280 420 280H20C8.95431 280 0 271.046 0 260V80Z"
                fill="#8b5cf6"
              />
            </svg>

            {/* Top Flap (Starts closed, rotates back) */}
            <svg
              width="440"
              height="200"
              viewBox="0 0 440 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute top-0 z-50"
            >
              <path ref={flapRef} d="M0 80L220 200L440 80H0Z" fill="#9f75ff" />
            </svg>

            {/* Front body of envelope (White with drop shadow) */}
            <svg
              width="440"
              height="280"
              viewBox="0 0 440 280"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute bottom-0 z-50 drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
            >
              <path
                d="M0 80L220 220L440 80V260C440 271.046 431.046 280 420 280H20C8.95431 280 0 271.046 0 260V80Z"
                fill="white"
              />
              <path d="M0 80L220 220L0 280V80Z" fill="#fcfcfc" />
              <path d="M440 80L220 220L440 280V80Z" fill="#f7f7f7" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

const TestimonialCard = ({
  data,
  active = false,
}: {
  data: any;
  active?: boolean;
}) => {
  return (
    <div
      className={`w-full h-full bg-white rounded-[32px] p-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.12)] border border-gray-100 flex flex-col items-center text-center transition-all duration-500 ${!active && "blur-[1px]"}`}
    >
      <div className="w-16 h-16 rounded-[18px] overflow-hidden mb-5 shadow-sm bg-gray-100 border-4 border-white">
        <img
          src={data.image}
          alt={data.name}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-[20px] font-bold text-gray-900 mb-1">{data.name}</h3>
      <p className="text-[13px] text-gray-400 mb-5">{data.role}</p>

      <div className="flex gap-1 mb-6 items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={18}
            fill={i < Math.floor(data.rating) ? "#fbbf24" : "none"}
            stroke={i < Math.floor(data.rating) ? "#fbbf24" : "#cbd5e1"}
            strokeWidth={i < Math.floor(data.rating) ? 1 : 2}
          />
        ))}
        <span className="text-[14px] font-bold text-gray-700 ml-2">
          {data.rating.toFixed(1)}
        </span>
      </div>

      <p className="text-[14px] text-gray-500 leading-[1.8] font-medium italic px-2">
        "{data.text}"
      </p>
    </div>
  );
};
