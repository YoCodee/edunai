"use client";

import FeatureCard from "@/components/ui/FeatureCard";
import { Calendar, Rocket, Users, Notebook, Brain } from "lucide-react";

const Features = () => {
  return (
    <section className="bg-white px-12 py-24 relative">
      <div className="max-w-[1400px] mx-auto">
        <div className="hidden">
          {/* Originally there was a row of 4 items here, now moved to Hero strip */}
        </div>

        <div className="text-center mb-24">
          <h2 className="text-[48px] md:text-[56px] font-black leading-tight max-w-3xl mx-auto">
            A BRIGHTER FUTURE BEGINS <br />
            <span className="text-primary italic">WITH EDUNAI PLATFORM</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={Calendar}
            title="Planning Kegiatan"
            description="Organize your university life with a fun, intuitive interface. Master your time, master your life."
            delay={0.1}
          />
          <FeatureCard
            icon={Rocket}
            title="AI Content Magic"
            description="Turn whiteboard scribbles into neat, structured summaries or even PowerPoint presentations in seconds."
            delay={0.2}
          />
          <FeatureCard
            icon={Users}
            title="Trello-Style Collab"
            description="Collaboration shouldn't be boring. Work with your team on a board that feels alive and interactive."
            delay={0.3}
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
