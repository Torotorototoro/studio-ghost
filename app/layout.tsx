import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Outfit, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

const zenKaku = Zen_Kaku_Gothic_New({
  variable: "--font-zen",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "STUDIO GHOST | インフルエンサー・クリエイター特化の事業コンサルティング",
  description:
    "著名人・インフルエンサーの裏側で、見えない力として事業を動かす。STUDIO GHOSTは、クリエイターに特化した事業コンサルティング会社です。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        {/* Keyframes that Tailwind v4 purges from globals.css — embedded here to bypass processing */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes stream-left {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          @keyframes stream-right {
            from { transform: translateX(-50%); }
            to   { transform: translateX(0); }
          }
          @keyframes glitch-flicker {
            0%, 85%, 100% { text-shadow: none; transform: none; }
            86% { text-shadow: -2px 0 rgba(0,229,255,0.7), 2px 0 rgba(180,74,255,0.7); transform: skewX(-2deg); }
            87% { text-shadow: 3px 0 rgba(0,229,255,0.7), -3px 0 rgba(180,74,255,0.7); transform: skewX(1deg); }
            88% { text-shadow: none; transform: none; }
            92% { text-shadow: -1px 0 rgba(0,229,255,0.5), 1px 0 rgba(180,74,255,0.5); transform: skewX(0.5deg); }
            93% { text-shadow: none; transform: none; }
          }
          @keyframes glitch-chromatic {
            0%, 90%, 100% { text-shadow: none; }
            91% { text-shadow: -3px -1px rgba(0,229,255,0.6), 3px 1px rgba(180,74,255,0.6); }
            93% { text-shadow: 2px -2px rgba(0,229,255,0.4), -2px 2px rgba(180,74,255,0.4); }
            95% { text-shadow: none; }
          }
          @keyframes glitch-scan {
            0%, 88%, 100% { clip-path: none; }
            89% { clip-path: inset(20% 0 60% 0); }
            90% { clip-path: inset(50% 0 20% 0); }
            91% { clip-path: inset(10% 0 70% 0); }
            92% { clip-path: none; }
          }
          @keyframes liquid-lens-drift {
            0%   { transform: translate(0, 0) scale(1); }
            33%  { transform: translate(30px, -20px) scale(1.05); }
            66%  { transform: translate(-20px, 15px) scale(0.95); }
            100% { transform: translate(10px, -10px) scale(1.02); }
          }
          @keyframes liquid-lens-morph {
            0%   { border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%; }
            25%  { border-radius: 60% 40% 30% 70% / 40% 60% 50% 50%; }
            50%  { border-radius: 30% 70% 50% 50% / 70% 30% 40% 60%; }
            75%  { border-radius: 50% 50% 40% 60% / 30% 70% 60% 40%; }
            100% { border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%; }
          }

          /* backdrop-filter also purged by Tailwind v4 */
          .glass-card {
            -webkit-backdrop-filter: blur(16px) saturate(1.3);
            backdrop-filter: blur(16px) saturate(1.3);
          }
          .liquid-lens {
            -webkit-backdrop-filter: blur(1px) saturate(1.1);
            backdrop-filter: blur(1px) saturate(1.1);
          }
        `}} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${zenKaku.variable} antialiased`}
        style={{ fontFamily: "var(--font-zen), var(--font-geist-sans), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
