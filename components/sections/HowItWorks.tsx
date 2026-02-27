"use client";

import { ScanText, Sparkles, Trophy } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: "Capture & Upload",
      description:
        "Take a quick photo of the whiteboard or upload your scribbled notes after class.",
      icon: ScanText,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      id: 2,
      title: "AI Processing",
      description:
        "Our Gemini-powered engine instantly transcribes, structures, and organizes the insights.",
      icon: Sparkles,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      id: 3,
      title: "Review & Master",
      description:
        "Learn faster using auto-generated flashcards, quizzes, and a clean digital summary.",
      icon: Trophy,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <section className="bg-white py-24 relative overflow-hidden font-sans">
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-20">
          <div className="px-5 py-2 bg-[#fbfcff] rounded-full border border-gray-200 shadow-sm text-sm font-medium text-gray-600 mb-8">
            How it Works
          </div>
          <h2 className="text-[36px] md:text-[46px] font-medium leading-[1.1] tracking-tight text-[#1a1c20] max-w-2xl">
            From chaotic notes to <br /> structured knowledge in seconds.
          </h2>
        </div>

        {/* Steps Container */}
        <div className="relative">
          {/* Connector Line (Desktop only) */}
          <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 -z-10" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center text-center relative group"
                >
                  {/* Step Number Badge */}
                  <div className="absolute top-0 right-1/2 translate-x-[40px] -translate-y-2 w-8 h-8 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-[12px] font-black text-gray-400 z-20 shadow-sm group-hover:border-gray-300 transition-colors">
                    {step.id}
                  </div>

                  {/* Huge Icon Container */}
                  <div
                    className={`w-[120px] h-[120px] rounded-full flex items-center justify-center mb-8 border-[6px] border-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] ${step.bgColor} relative z-10 transition-transform duration-300 group-hover:-translate-y-2`}
                  >
                    <Icon className={step.color} size={42} strokeWidth={1.5} />
                  </div>

                  <h3 className="text-[22px] font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[15px] text-gray-500 leading-relaxed max-w-[280px]">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
