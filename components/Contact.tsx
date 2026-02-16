"use client";

import { useSectionReveal } from "./useSectionReveal";

export default function Contact() {
  const { ref, style } = useSectionReveal(0.15);

  return (
    <section
      id="contact"
      ref={ref}
      className="relative py-32 sm:py-40 px-6 section-reveal"
      style={style}
    >
      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Section label */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.06] bg-white/[0.02]">
            <span className="w-1.5 h-1.5 rounded-full bg-purple" style={{ animation: "breathe 3s ease-in-out infinite" }} />
            <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase">Get in touch</span>
          </div>
        </div>

        <h2 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-white mb-4 text-center">
          CONTACT
        </h2>
        <div className="w-20 h-[2px] bg-gradient-to-r from-purple to-cyan mx-auto mb-6" />
        <p className="text-center text-white/40 mb-12 text-sm">
          まずは無料相談から。事業フェーズに合わせた最適なプランをご提案します。
        </p>

        <div className="glass-card p-8 sm:p-10">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-[10px] tracking-[0.2em] text-white/40 uppercase mb-2 font-semibold">
                Name
              </label>
              <input
                id="name"
                type="text"
                className="input-abyss"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[10px] tracking-[0.2em] text-white/40 uppercase mb-2 font-semibold">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input-abyss"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-[10px] tracking-[0.2em] text-white/40 uppercase mb-2 font-semibold">
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                className="input-abyss resize-none"
                placeholder="Your message"
              />
            </div>

            <button type="submit" className="btn-glow w-full">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
