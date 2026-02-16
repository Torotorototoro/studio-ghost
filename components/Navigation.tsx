"use client";

import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Results", href: "#track-record" },
  { label: "Contact", href: "#contact" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[rgba(2,6,23,0.8)] backdrop-blur-xl border-b border-white/[0.05]"
          : "bg-transparent"
      }`}
      style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="text-xl font-bold tracking-widest text-white group">
          STUDIO
          <span className="text-aurora ml-1">GHOST</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative text-sm tracking-wider text-white/40 hover:text-cyan transition-colors duration-300 py-1"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyan transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

      </div>
    </nav>
  );
}
