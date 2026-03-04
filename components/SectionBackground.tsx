"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface SectionBackgroundProps {
  src: string;
  alt?: string;
  overlay?: string;
  overlayOpacity?: number;
  priority?: boolean;
  parallax?: boolean;
}

export default function SectionBackground({
  src,
  alt = "",
  overlay = "linear-gradient(to bottom, rgba(10,10,11,0.7), rgba(10,10,11,0.85))",
  overlayOpacity = 1,
  priority = false,
  parallax = false,
}: SectionBackgroundProps) {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    if (!parallax) return;
    const onScroll = () => setOffsetY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [parallax]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Photo */}
      <div
        style={{
          position: "absolute",
          inset: parallax ? "-10%" : 0,
          transform: parallax ? `translateY(${offsetY * 0.08}px)` : undefined,
          willChange: parallax ? "transform" : undefined,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          priority={priority}
          quality={85}
          className="object-cover"
        />
      </div>

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: overlay,
          opacity: overlayOpacity,
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(10,10,11,0.5) 100%)",
        }}
      />
    </div>
  );
}
