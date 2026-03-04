export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="font-bold flex items-baseline gap-2">
          <img src="/haku-brush.png" alt="魄" className="h-6 w-auto opacity-40 invert" draggable={false} />
          <span className="text-sm tracking-[0.2em] text-aurora font-heading">HAKU</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs tracking-wider text-slate-500">
          <a href="#" className="hover:text-slate-300 transition-colors duration-300">
            Privacy Policy
          </a>
          <span className="text-slate-600">|</span>
          <a href="#" className="hover:text-slate-300 transition-colors duration-300">
            Terms
          </a>
        </div>

        {/* Social */}
        <div className="flex items-center gap-4">
          {[
            {
              label: "X (Twitter)",
              d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
              fill: true,
            },
            {
              label: "Instagram",
              svg: (
                <>
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </>
              ),
            },
            {
              label: "YouTube",
              d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
              fill: true,
            },
          ].map((item) => (
            <a
              key={item.label}
              href="#"
              className="text-slate-500 hover:text-cyan transition-colors duration-300"
              aria-label={item.label}
            >
              {item.fill ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d={item.d} />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  {item.svg}
                </svg>
              )}
            </a>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center mt-8 text-[10px] tracking-wider text-slate-500">
        &copy; {new Date().getFullYear()} 魄 HAKU. All rights reserved.
      </div>
    </footer>
  );
}
