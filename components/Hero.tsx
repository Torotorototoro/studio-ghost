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
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ minHeight: "max(100vh, 700px)" }}
    >
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
      </div>

      {/* Layer 2: Giant background 魄 watermark */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-end"
        style={{ zIndex: 2 }}
      >
        <img
          src="/haku-brush.png"
          alt=""
          className="select-none"
          style={{
            height: "90vh",
            width: "auto",
            opacity: 0.07,
            transform: `translateX(10%) translateY(${scrollY * -0.05}px)`,
            maskImage: "radial-gradient(ellipse 80% 70% at 60% 50%, black 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 60% 50%, black 30%, transparent 80%)",
          }}
          draggable={false}
        />
      </div>

      {/* Layer 3: Vignettes */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
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

      {/* Layer 4: Content — left aligned */}
      <div
        className="relative z-10 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto w-full"
        style={{ transform: `translateY(${scrollY * -0.1}px)` }}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-slate-200 bg-white/40 backdrop-blur-sm">
          <span
            className="w-2 h-2 rounded-full bg-cyan"
            style={{ animation: "breathe 3s ease-in-out infinite" }}
          />
          <span className="text-xs tracking-widest text-slate-500 uppercase" style={{ fontFamily: "var(--font-geist-sans)" }}>
            AI-Powered Business Consulting
          </span>
        </div>

        {/* Logo mark */}
        <img
          src="/haku-brush.png"
          alt="魄"
          className="mb-4 select-none"
          style={{ height: "clamp(4rem, 10vw, 7rem)", width: "auto" }}
          draggable={false}
        />

        {/* Tagline */}
        <p className="font-heading text-xl sm:text-2xl md:text-3xl text-slate-700 mb-2 tracking-wide leading-relaxed">
          見えない力で、<br />
          事業を動かす。
        </p>
        <p className="text-sm sm:text-base text-slate-400 mb-10 max-w-md font-light tracking-wide leading-relaxed">
          ビジネスの立ち上げからスケールまで、一気通貫で。
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-start gap-4">
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
        <span className="text-[10px] tracking-widest text-slate-300 uppercase" style={{ fontFamily: "var(--font-geist-sans)" }}>Scroll</span>
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
