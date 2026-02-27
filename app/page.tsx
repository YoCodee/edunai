"use client";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import BeforeAfter from "@/components/sections/BeforeAfter";
import Solutions from "@/components/sections/Solutions";
import OfferSection from "@/components/sections/OfferSection";
import HowItWorks from "@/components/sections/HowItWorks";
import Testimonials from "@/components/sections/Testimonials";
import Footer from "@/components/sections/Footer";
import BackgroundOrbs from "@/components/ui/BackgroundOrbs";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden selection:bg-primary/30">
      <BackgroundOrbs />
      <Navbar />
      <main>
        <Hero />
        <BeforeAfter />
        <Solutions />
        <OfferSection />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
