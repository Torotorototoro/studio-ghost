import dynamic from "next/dynamic";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import SynapseCanvas from "@/components/SynapseCanvas";

const About = dynamic(() => import("@/components/About"));
const Services = dynamic(() => import("@/components/Services"));
const TrackRecord = dynamic(() => import("@/components/TrackRecord"));
const Contact = dynamic(() => import("@/components/Contact"));
const Footer = dynamic(() => import("@/components/Footer"));
const GhostParticles = dynamic(() => import("@/components/GhostParticles"));
const NoiseOverlay = dynamic(() => import("@/components/NoiseOverlay"));

export default function Home() {
  return (
    <div className="relative min-h-screen bg-void scan-lines">
      {/* Global fixed backgrounds */}
      <SynapseCanvas />
      <Navigation />
      <NoiseOverlay />
      <GhostParticles />
      <main className="relative z-10">
        <Hero />
        <About />
        <Services />
        <TrackRecord />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
