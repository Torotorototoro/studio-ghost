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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[rgba(255,255,255,0.75)] backdrop-blur-xl border-b border-slate-200/60"
          : "bg-transparent"
      }`}
      style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="text-xl font-bold tracking-widest text-slate-800 group">
          STUDIO
          <span className="text-aurora ml-1">GHOST</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative text-sm tracking-wider text-slate-400 hover:text-cyan transition-colors duration-300 py-1"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyan transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-slate-500 transition-all duration-300 ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-slate-500 transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-slate-500 transition-all duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          menuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(20px)",
          transitionTimingFunction: "var(--ease-out-expo)",
        }}
      >
        <div className="px-6 pb-6 pt-2 border-t border-slate-200/40">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-sm tracking-wider text-slate-400 hover:text-cyan transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
