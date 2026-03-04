"use client";

/**
 * #4 — Ghost Stream: Kinetic Typography
 * Horizontal flowing text lanes with creator/business keywords.
 * Multiple sizes, fonts, opacities.
 */

const WORDS = [
  "STRATEGY", "BRANDING", "INFLUENCE", "CREATOR", "魄",
  "PRODUCTION", "DX", "REVENUE", "VISION", "HAKU",
  "CONTENT", "SCALE", "ENGAGE", "MONETIZE", "PLATFORM",
  "SPIRIT", "DIGITAL", "PRESENCE", "GROWTH", "IMPACT",
  "データ分析", "事業戦略", "プロデュース", "ブランディング", "マネタイズ",
  "インフルエンサー", "クリエイター", "コンテンツ", "エンゲージメント", "スケール",
  "EC", "SNS", "YouTube", "TikTok", "Instagram",
  "魄", "HAKU", "FORCE", "CREATIVE", "INNOVATION",
];

// Deterministic hash for stable styling per word
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const SIZES = [
  "text-[6px]", "text-[7px]", "text-[8px]", "text-[9px]", "text-[10px]",
  "text-[6px]", "text-[7px]", "text-[8px]", "text-[9px]", "text-[10px]",
  "text-[6px]", "text-[7px]", "text-[8px]", "text-[10px]", "text-[11px]",
  "text-xs", "text-xs", "text-sm", "text-sm",
  "text-base", "text-lg",
  "text-xl", "text-2xl", "text-3xl",
  "text-4xl",
];

const WEIGHTS = [
  "font-light", "font-normal", "font-normal", "font-normal",
  "font-medium", "font-medium", "font-semibold", "font-bold",
  "font-extrabold", "font-black",
];

const FONTS = [
  "font-heading", "", "", "", "",
  "font-mono", "",
];

const LANE_COUNT = 14;

function buildLane(laneIndex: number): string[] {
  const items: string[] = [];
  const seed = laneIndex * 7 + 3;
  for (let i = 0; i < 30; i++) {
    items.push(WORDS[(seed + i * 13) % WORDS.length]);
  }
  return items;
}

function WordSpan({ word, laneIndex, wordIndex }: { word: string; laneIndex: number; wordIndex: number }) {
  const h = hash(word + laneIndex + wordIndex);
  const size = SIZES[h % SIZES.length];
  const weight = WEIGHTS[(h >> 3) % WEIGHTS.length];
  const font = FONTS[(h >> 5) % FONTS.length];

  // Color: mostly dark slate, occasionally cyan or purple
  const colorRoll = (h >> 9) % 10;
  const color = colorRoll < 2 ? "text-cyan/40" : colorRoll < 3 ? "text-purple/40" : "text-slate-800";

  // Opacity variation
  const opacities = [0.04, 0.06, 0.08, 0.10, 0.12, 0.14, 0.16, 0.20, 0.25];
  const opacity = opacities[(h >> 11) % opacities.length];

  // Slight rotation
  const rotate = (h >> 13) % 8 === 0
    ? `rotate(${((h % 5) - 2) * 0.8}deg)`
    : "none";

  // Outline text (rare)
  const isOutline = (h >> 15) % 30 === 0;
  const outlineStyle = isOutline
    ? { WebkitTextStroke: "0.5px currentColor", WebkitTextFillColor: "transparent" } as React.CSSProperties
    : {};

  return (
    <span
      className={`inline-block mx-2 sm:mx-3 whitespace-nowrap select-none ${size} ${weight} ${font} ${color}`}
      style={{ opacity, transform: rotate, ...outlineStyle }}
    >
      {word}
    </span>
  );
}

export default function GhostStream() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {/* Edge fade masks */}
      <div className="absolute inset-0" style={{
        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent), linear-gradient(to bottom, transparent 5%, black 20%, black 80%, transparent 95%)",
        maskComposite: "intersect",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}>
        {Array.from({ length: LANE_COUNT }).map((_, laneIndex) => {
          const words = buildLane(laneIndex);
          const direction = laneIndex % 2 === 0 ? "stream-left" : "stream-right";
          // Vary speed: edge lanes slower (parallax feel)
          const distFromCenter = Math.abs(laneIndex - LANE_COUNT / 2) / (LANE_COUNT / 2);
          const duration = 25 + distFromCenter * 40;

          return (
            <div
              key={laneIndex}
              className="whitespace-nowrap"
              style={{
                width: "max-content",
                animation: `${direction} ${duration}s linear infinite`,
                lineHeight: `${100 / LANE_COUNT}vh`,
                willChange: "transform",
              }}
            >
              {/* Double the content for seamless loop */}
              {[...words, ...words].map((word, i) => (
                <WordSpan key={i} word={word} laneIndex={laneIndex} wordIndex={i} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
