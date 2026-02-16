"use client";

import { useSectionReveal } from "./useSectionReveal";

export default function About() {
  const { ref, style } = useSectionReveal(0.15);

  return (
    <section
      id="about"
      ref={ref}
      className="relative py-32 sm:py-40 px-6 section-reveal"
      style={style}
    >
      {/* Background blob */}
      <div
        className="morph-blob absolute bg-purple"
        style={{ width: 400, height: 400, top: "20%", right: "5%", animationDelay: "-5s" }}
      />
      {/* Liquid lens */}
      <div
        className="liquid-lens liquid-lens--a"
        style={{ width: 300, height: 300, top: "30%", right: "15%", zIndex: 0 }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section label */}
        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-white/[0.06] bg-white/[0.02]">
          <span className="w-1.5 h-1.5 rounded-full bg-purple" style={{ animation: "breathe 3s ease-in-out infinite" }} />
          <span className="text-[10px] tracking-[0.2em] text-white/30 uppercase">Who we are</span>
        </div>

        <h2 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-white mb-4">
          ABOUT
        </h2>
        <div className="w-20 h-[2px] bg-gradient-to-r from-cyan to-purple mb-12" />

        <p className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-white/90 leading-snug mb-4">
          The invisible force
        </p>
        <p className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold leading-snug mb-12">
          <span className="text-aurora">behind the spotlight.</span>
        </p>

        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div className="glass-card p-8">
            <h3 className="text-xs tracking-[0.2em] text-cyan uppercase mb-4 font-semibold">
              Mission
            </h3>
            <p className="text-white/50 leading-relaxed text-[15px]">
              著名人・インフルエンサーの裏側で、見えない力として事業を動かす。
              私たちはクリエイターが本来の活動に集中できるよう、
              ビジネスの複雑さをすべて引き受けるゴーストです。
            </p>
          </div>
          <div className="glass-card p-8">
            <h3 className="text-xs tracking-[0.2em] text-purple uppercase mb-4 font-semibold">
              Vision
            </h3>
            <p className="text-white/50 leading-relaxed text-[15px]">
              すべてのクリエイターが、自分の才能だけに集中できる世界を。
              戦略、テクノロジー、プロデュースの三位一体で、
              クリエイターエコノミーの新しいスタンダードを創る。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
