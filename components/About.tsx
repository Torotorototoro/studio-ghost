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
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section label */}
        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-white/[0.06] bg-white/[0.02]">
          <span className="w-1.5 h-1.5 rounded-full bg-purple" style={{ animation: "breathe 3s ease-in-out infinite" }} />
          <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase">Philosophy</span>
        </div>

        <h2 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-white mb-4">
          PHILOSOPHY
        </h2>
        <div className="w-20 h-[2px] bg-gradient-to-r from-cyan to-purple mb-12" />

        {/* Problem → Solution → Belief */}
        <div className="space-y-8 mb-16">
          <div className="glass-card p-8">
            <h3 className="text-xs tracking-[0.2em] text-white/30 uppercase mb-4 font-semibold">
              Problem
            </h3>
            <p className="text-white/60 leading-relaxed text-[15px]">
              従来のコンサルティングは、大人数のチームで動く。
              関わる人が増えるほど統一感は失われ、意思決定は遅くなり、
              本来のビジョンからズレていく。時間もコストも膨らむ一方で、
              アウトプットの質は比例しない。
            </p>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-xs tracking-[0.2em] text-cyan uppercase mb-4 font-semibold">
              Solution
            </h3>
            <p className="text-white/60 leading-relaxed text-[15px]">
              AI &times; 少数精鋭。これが私たちの答え。
              AIが定型業務・分析・最適化を担い、人間は創造性と判断に集中する。
              少人数だからこそ統一感が生まれ、AIだからこそスピードが出る。
              結果、従来の何倍もの速度で、一貫したクオリティを実現する。
            </p>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-xs tracking-[0.2em] text-purple uppercase mb-4 font-semibold">
              Belief
            </h3>
            <p className="text-white/60 leading-relaxed text-[15px]">
              技術が進むほど、「人がやらなくていいこと」は増えていく。
              だからこそ私たちは、「人がいないと進まないこと」に集中する。
              ビジョンを描くこと。信頼を築くこと。覚悟を持って決断すること。
              それが、テクノロジーの時代における人の価値だと信じている。
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-card p-8">
            <h3 className="text-xs tracking-[0.2em] text-cyan uppercase mb-4 font-semibold">
              Mission
            </h3>
            <p className="text-white/60 leading-relaxed text-[15px]">
              AI &times; 少数精鋭の力で、ビジネスの立ち上げからスケールまでを一気通貫で支援する。
              戦略・ブランディング・テクノロジーを統合し、
              圧倒的なスピードと統一感で事業を前に進める。
            </p>
          </div>
          <div className="glass-card p-8">
            <h3 className="text-xs tracking-[0.2em] text-purple uppercase mb-4 font-semibold">
              Vision
            </h3>
            <p className="text-white/60 leading-relaxed text-[15px]">
              あらゆるビジネスが、少数精鋭とAIの力で
              ゼロからスケールまで駆け抜けられる世界を。
              人の判断力とテクノロジーの実行力が融合する、
              新時代のビジネスコンサルティングを確立する。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
