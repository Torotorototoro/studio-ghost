"use client";

import { useEffect, useState } from "react";
import FluidBackground from "./FluidBackground";
import GhostStream from "./GhostStream";

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center"
      style={{ minHeight: "max(100vh, 700px)" }}
    >
      {/* Layer 0: Flow field particles */}
      <FluidBackground />

      {/* Layer 1: Morph blobs */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div
          className="morph-blob absolute bg-cyan"
          style={{ width: 500, height: 500, top: "5%", left: "5%", animationDelay: "0s" }}
        />
        <div
          className="morph-blob absolute bg-purple"
          style={{ width: 450, height: 450, bottom: "10%", right: "5%", animationDelay: "-7s" }}
        />
        <div
          className="morph-blob absolute bg-purple"
          style={{ width: 300, height: 300, top: "45%", left: "55%", opacity: 0.06, animationDelay: "-14s" }}
        />
      </div>

      {/* Layer 2: Ghost Stream (kinetic typography) */}
      <GhostStream />

      {/* Layer 3: Liquid lenses */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        <div
          className="liquid-lens liquid-lens--a"
          style={{ width: 400, height: 400, top: "15%", left: "10%" }}
        />
        <div
          className="liquid-lens liquid-lens--b"
          style={{ width: 350, height: 350, bottom: "20%", right: "15%" }}
        />
      </div>

      {/* Layer 4: Vignettes */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 40%, transparent 20%, rgba(2,6,23,0.85) 100%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-full h-48"
          style={{
            background: "linear-gradient(to top, var(--sg-void), transparent)",
          }}
        />
        <div
          className="absolute top-0 left-0 w-full h-32"
          style={{
            background: "linear-gradient(to bottom, var(--sg-void), transparent)",
          }}
        />
      </div>

      {/* Layer 5: Content with parallax */}
      <div
        className="relative z-10 text-center px-6"
        style={{ transform: `translateY(${scrollY * -0.1}px)` }}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm">
          <span
            className="w-2 h-2 rounded-full bg-cyan"
            style={{ animation: "breathe 3s ease-in-out infinite" }}
          />
          <span className="text-xs tracking-widest text-white/50 uppercase font-heading">
            Creator Business Consulting
          </span>
        </div>

        {/* Main title — Outfit font + glitch */}
        <h1
          className="font-heading font-black tracking-tighter text-white mb-2 glitch-chromatic"
          style={{ fontSize: "clamp(3.5rem, 12vw, 9rem)", lineHeight: 0.9 }}
        >
          STUDIO
        </h1>
        <h1
          className="font-heading font-black tracking-tighter text-aurora mb-8 glitch-text"
          style={{ fontSize: "clamp(3.5rem, 12vw, 9rem)", lineHeight: 0.9 }}
        >
          GHOST
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-white/40 max-w-xl mx-auto mb-12 font-light tracking-wide leading-relaxed">
          We produce the invisible force behind creators.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#contact" className="btn-glow">
            Contact Us
          </a>
          <a href="#services" className="btn-glass">
            Our Services
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
        <span className="text-[10px] tracking-widest text-white/20 uppercase font-heading">Scroll</span>
        <div
          className="w-[1px] h-10"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)",
            animation: "bounce-slow 2s ease-in-out infinite",
          }}
        />
      </div>
    </section>
  );
}
