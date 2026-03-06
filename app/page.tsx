import { createClient } from "@/utils/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import BeforeAfter from "@/components/sections/BeforeAfter";
import Solutions from "@/components/sections/Solutions";
import OfferSection from "@/components/sections/OfferSection";
import HowItWorks from "@/components/sections/HowItWorks";
import Testimonials from "@/components/sections/Testimonials";
import DraggableStudyNotes from "@/components/sections/DraggableStudyNotes";
import Footer from "@/components/sections/Footer";
import BackgroundOrbs from "@/components/ui/BackgroundOrbs";
import IntroAnimation from "@/components/ui/IntroAnimation";
import Features from "@/components/sections/Features";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const isLoggedIn = !!session?.user;

  return (
    <>
      <IntroAnimation />
      <div className="relative min-h-screen bg-background overflow-hidden selection:bg-primary/30">
        <BackgroundOrbs />
        <Navbar />
        <main>
          <Hero isLoggedIn={isLoggedIn} />
          <BeforeAfter />
          <div id="solutions">
            <Solutions />
          </div>
          <div id="features">
            <OfferSection />
          </div>
          <div id="how-it-works">
            <HowItWorks />
          </div>
          <DraggableStudyNotes />
          <Testimonials />
        </main>
        <Footer />
      </div>
    </>
  );
}
