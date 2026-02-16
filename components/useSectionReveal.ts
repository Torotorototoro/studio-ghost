"use client";

import { useEffect, useRef, useState } from "react";

export function useSectionReveal(threshold = 0.2) {
  const ref = useRef<HTMLElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Mark as hydrated so we can start the hidden state
    setHydrated(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  // Before hydration: fully visible (SSR-safe)
  // After hydration but not yet visible: hidden with transform
  // After visible: animate in
  const style: React.CSSProperties = hydrated
    ? {
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
      }
    : {};

  return { ref, style };
}
