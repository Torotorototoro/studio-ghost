"use client";

import { useEffect, useState } from "react";

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
      {/* Layer 1: Morph blobs (hero-only decoration) */}
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

      {/* Layer 2: Vignettes — light theme */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 40%, transparent 20%, rgba(248,250,252,0.85) 100%)",
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

      {/* Layer 4: Content with parallax */}
      <div
        className="relative z-10 text-center px-6"
        style={{ transform: `translateY(${scrollY * -0.1}px)` }}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-slate-200 bg-white/40 backdrop-blur-sm">
          <span
            className="w-2 h-2 rounded-full bg-cyan"
            style={{ animation: "breathe 3s ease-in-out infinite" }}
          />
          <span className="text-xs tracking-widest text-slate-500 uppercase font-heading">
            AI-Powered Business Consulting
          </span>
        </div>

        {/* Main title */}
        <h1
          className="font-normal text-slate-800 mb-3"
          style={{ fontFamily: "var(--font-brush)", fontSize: "clamp(6rem, 22vw, 16rem)", lineHeight: 0.85 }}
        >
          魄
        </h1>
        <h1
          className="font-heading font-black tracking-[0.3em] text-aurora mb-8"
          style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)", lineHeight: 1 }}
        >
          HAKU
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-12 font-light tracking-wide leading-relaxed">
          ビジネスの立ち上げからスケールまで、一気通貫で。
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
        <span className="text-[10px] tracking-widest text-slate-300 uppercase font-heading">Scroll</span>
        <div
          className="w-[1px] h-10"
          style={{
            background: "linear-gradient(to bottom, rgba(15,23,42,0.3), transparent)",
            animation: "bounce-slow 2s ease-in-out infinite",
          }}
        />
      </div>
    </section>
  );
}
