"use client";

/**
 * SVG fractal noise film grain overlay — same technique as OJPP.
 * Fixed fullscreen, pointer-events none, very subtle (2% opacity).
 */
export default function NoiseOverlay() {
  return (
    <div className="noise-overlay">
      <svg width="100%" height="100%">
        <filter id="noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise-filter)" />
      </svg>
    </div>
  );
}
