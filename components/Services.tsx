"use client";

import { useSectionReveal } from "./useSectionReveal";

const PHASES = [
  {
    phase: "0 → 1",
    title: "Launch",
    subtitle: "ビジネスの立ち上げ",
    items: ["事業設計・ビジネスモデル構築", "ブランディング・CI策定", "MVP開発・プロトタイピング"],
    accent: "cyan" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    phase: "1 → 10",
    title: "Scale",
    subtitle: "グロースの加速",
    items: ["マーケティング戦略・実行", "テクノロジー実装・自動化", "組織設計・チームビルディング"],
    accent: "purple" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M13 7l5 5-5 5" />
        <path d="M6 7l5 5-5 5" />
      </svg>
    ),
  },
  {
    phase: "10 → 100",
    title: "Operate",
    subtitle: "持続的な成長",
    items: ["運用最適化・KPIマネジメント", "AI自動化・業務効率化", "データドリブン経営支援"],
    accent: "cyan" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
];

export default function Services() {
  const { ref, style } = useSectionReveal(0.1);

  return (
    <section
      id="services"
      ref={ref}
      className="relative py-32 sm:py-40 px-6 section-reveal"
      style={style}
    >
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section label */}
        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-white/[0.06] bg-white/[0.02]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan" style={{ animation: "breathe 3s ease-in-out infinite" }} />
          <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase">What we do</span>
        </div>

        <h2 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-white mb-4">
          SERVICES
        </h2>
        <div className="w-20 h-[2px] bg-gradient-to-r from-purple to-cyan mb-6" />
        <p className="text-white/40 text-sm mb-16 max-w-2xl">
          ゼロからスケールまで。3フェーズの一気通貫モデルで、ビジネスのあらゆるステージを支援します。
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {PHASES.map((phase, i) => (
            <div
              key={i}
              className="glass-card p-8 group"
              style={{
                animation: "pulse-glow 4s ease-in-out infinite",
                animationDelay: `${i * 1.3}s`,
              }}
            >
              {/* Icon */}
              <div
                className={`mb-6 p-3 inline-flex rounded-xl ${
                  phase.accent === "cyan"
                    ? "bg-[rgba(0,229,255,0.08)] text-cyan"
                    : "bg-[rgba(180,74,255,0.08)] text-purple"
                }`}
              >
                {phase.icon}
              </div>

              {/* Phase label */}
              <div className={`text-xs tracking-[0.15em] uppercase mb-2 font-semibold ${
                phase.accent === "cyan" ? "text-cyan" : "text-purple"
              }`}>
                {phase.phase}
              </div>

              <h3 className="font-heading text-lg font-bold text-white tracking-wide mb-1">
                {phase.title}
              </h3>
              <p className="text-white/40 text-sm mb-5">
                {phase.subtitle}
              </p>

              <ul className="space-y-2">
                {phase.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-white/50 text-sm leading-relaxed">
                    <span className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${
                      phase.accent === "cyan" ? "bg-cyan/60" : "bg-purple/60"
                    }`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
