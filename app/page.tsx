import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import TrackRecord from "@/components/TrackRecord";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import GhostParticles from "@/components/GhostParticles";
import NoiseOverlay from "@/components/NoiseOverlay";
import FluidCanvas from "@/components/FluidCanvas";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-void scan-lines">
      {/* Global fixed backgrounds */}
      <FluidCanvas />
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
