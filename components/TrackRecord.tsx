"use client";

import { useEffect, useRef, useState } from "react";
import { useSectionReveal } from "./useSectionReveal";

function useCounter(end: number, active: boolean, duration = 2000, decimal = false) {
  const [value, setValue] = useState(decimal ? "0.0" : "0");

  useEffect(() => {
    if (!active) return;

    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * end;

      setValue(decimal ? current.toFixed(1) : Math.floor(current).toLocaleString());

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setValue(decimal ? end.toFixed(1) : end.toLocaleString());
      }
    }

    requestAnimationFrame(step);
  }, [active, end, duration, decimal]);

  return value;
}

const STATS = [
  { end: 120, suffix: "+", label: "Creators Supported", decimal: false },
  { end: 3.2, prefix: "¥", suffix: "B", label: "Revenue Generated", decimal: true },
  { end: 500, suffix: "+", label: "Projects Completed", decimal: false },
];

function StatCard({
  stat,
  active,
  delay,
}: {
  stat: (typeof STATS)[number];
  active: boolean;
  delay: number;
}) {
  const value = useCounter(stat.end, active, 2000, stat.decimal);

  return (
    <div
      className="glass-card p-8 sm:p-10 text-center"
      style={{
        animation: "pulse-glow 4s ease-in-out infinite",
        animationDelay: `${delay}s`,
      }}
    >
      <div
        className="font-bold text-white mb-3 glow-cyan"
        style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
      >
        {stat.prefix || ""}
        {active ? value : (stat.decimal ? "0.0" : "0")}
        <span className="text-aurora">{stat.suffix}</span>
      </div>
      <p className="text-white/30 text-xs tracking-[0.2em] uppercase">{stat.label}</p>
    </div>
  );
}

export default function TrackRecord() {
  const counterRef = useRef<HTMLElement>(null);
  const [countersActive, setCountersActive] = useState(false);
  const { ref, style } = useSectionReveal(0.15);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCountersActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (counterRef.current) observer.observe(counterRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="track-record"
      ref={(el) => {
        (ref as React.MutableRefObject<HTMLElement | null>).current = el;
        counterRef.current = el;
      }}
      className="relative py-32 sm:py-40 px-6 section-reveal"
      style={style}
    >
      {/* Background blob */}
      <div
        className="morph-blob absolute bg-cyan"
        style={{ width: 450, height: 450, top: "30%", left: "50%", transform: "translateX(-50%)", animationDelay: "-12s" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section label */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.06] bg-white/[0.02]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan" style={{ animation: "breathe 3s ease-in-out infinite" }} />
            <span className="text-[10px] tracking-[0.2em] text-white/30 uppercase">Our impact</span>
          </div>
        </div>

        <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-white mb-4 text-center">
          TRACK RECORD
        </h2>
        <div className="w-20 h-[2px] bg-gradient-to-r from-cyan to-purple mx-auto mb-16" />

        <div className="grid md:grid-cols-3 gap-6">
          {STATS.map((stat, i) => (
            <StatCard key={i} stat={stat} active={countersActive} delay={i * 1.3} />
          ))}
        </div>
      </div>
    </section>
  );
}
