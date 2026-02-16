"use client";

import { useSectionReveal } from "./useSectionReveal";

const TESTIMONIALS = [
  {
    quote:
      "STUDIO GHOSTに任せてから、自分はコンテンツ制作だけに集中できるようになった。事業の立ち上げからグッズ展開、データ分析まで全部一気通貫でやってくれる。スピード感が全然違う。",
    name: "ホモサピ",
    role: "YouTuber / Content Creator",
    accent: "cyan" as const,
  },
  {
    quote:
      "少数精鋭なのにアウトプットの量と質が尋常じゃない。AIを使いこなしているからこそのスピードだと思う。何より、ブランドの世界観がブレないのが一番ありがたい。",
    name: "K.T.",
    role: "D2Cブランド ファウンダー",
    accent: "purple" as const,
  },
  {
    quote:
      "他のコンサル会社だと担当者が何人も変わって話が通じなくなる。ここは最初から最後まで同じチームだから、意思決定が圧倒的に早い。",
    name: "M.S.",
    role: "スタートアップ CEO",
    accent: "cyan" as const,
  },
];

export default function TrackRecord() {
  const { ref, style } = useSectionReveal(0.15);

  return (
    <section
      id="track-record"
      ref={ref}
      className="relative py-32 sm:py-40 px-6 section-reveal"
      style={style}
    >
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section label */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.06] bg-white/[0.02]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan" style={{ animation: "breathe 3s ease-in-out infinite" }} />
            <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase">Results</span>
          </div>
        </div>

        <h2 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-white mb-4 text-center">
          RESULTS
        </h2>
        <div className="w-20 h-[2px] bg-gradient-to-r from-cyan to-purple mx-auto mb-16" />

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="glass-card p-8 flex flex-col"
              style={{
                animation: "pulse-glow 4s ease-in-out infinite",
                animationDelay: `${i * 1.3}s`,
              }}
            >
              {/* Quote mark */}
              <span className={`text-3xl font-heading font-bold mb-4 ${
                t.accent === "cyan" ? "text-cyan/40" : "text-purple/40"
              }`}>
                &ldquo;
              </span>
              <p className="text-white/50 text-sm leading-relaxed flex-1 mb-6">
                {t.quote}
              </p>
              <div className="border-t border-white/[0.06] pt-4">
                <p className="text-white/80 text-sm font-semibold">{t.name}</p>
                <p className="text-white/30 text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
