"use client";

import { useSectionReveal } from "./useSectionReveal";

const SERVICES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Strategy & Branding",
    description: "事業戦略の策定からブランドアイデンティティの構築まで。クリエイターの世界観を損なわず、収益化とスケールを両立する戦略を設計します。",
    accent: "cyan" as const,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 8l3 3-3 3" />
        <path d="M13 14h4" />
      </svg>
    ),
    title: "Tech & DX",
    description: "EC・アプリ開発、データ分析、DX推進。最新テクノロジーでクリエイターのビジネスインフラを構築し、データドリブンな意思決定を支援します。",
    accent: "purple" as const,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14" />
        <rect x="3" y="6" width="12" height="12" rx="2" />
      </svg>
    ),
    title: "Production",
    description: "イベント企画・案件プロデュース・コンテンツ制作。クリエイターの影響力を最大化するプロジェクトを、企画から実行まで一気通貫でプロデュースします。",
    accent: "cyan" as const,
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
      {/* Background blobs */}
      <div
        className="morph-blob absolute bg-cyan"
        style={{ width: 450, height: 450, bottom: "5%", left: "5%", animationDelay: "-10s" }}
      />
      <div
        className="morph-blob absolute bg-purple"
        style={{ width: 350, height: 350, top: "10%", right: "10%", opacity: 0.08, animationDelay: "-3s" }}
      />
      {/* Liquid lens */}
      <div
        className="liquid-lens liquid-lens--b"
        style={{ width: 320, height: 320, bottom: "15%", right: "5%", zIndex: 0 }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section label */}
        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-white/[0.06] bg-white/[0.02]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan" style={{ animation: "breathe 3s ease-in-out infinite" }} />
          <span className="text-[10px] tracking-[0.2em] text-white/30 uppercase">What we do</span>
        </div>

        <h2 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-white mb-4">
          SERVICES
        </h2>
        <div className="w-20 h-[2px] bg-gradient-to-r from-purple to-cyan mb-16" />

        <div className="grid md:grid-cols-3 gap-6">
          {SERVICES.map((service, i) => (
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
                  service.accent === "cyan"
                    ? "bg-[rgba(0,229,255,0.08)] text-cyan"
                    : "bg-[rgba(180,74,255,0.08)] text-purple"
                }`}
              >
                {service.icon}
              </div>

              <h3 className="font-heading text-lg font-bold text-white tracking-wide mb-3">
                {service.title}
              </h3>

              <p className="text-white/40 text-sm leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
