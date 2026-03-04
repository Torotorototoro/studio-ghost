import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Shippori_Mincho_B1, Zen_Kaku_Gothic_New, Yuji_Boku } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const shippori = Shippori_Mincho_B1({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const yujiBoku = Yuji_Boku({
  variable: "--font-brush",
  subsets: ["latin"],
  weight: "400",
});

const zenKaku = Zen_Kaku_Gothic_New({
  variable: "--font-zen",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "魄 HAKU | インフルエンサー・クリエイター特化の事業コンサルティング",
  description:
    "著名人・インフルエンサーの裏側で、見えない力として事業を動かす。魄（HAKU）は、クリエイターに特化した事業コンサルティング会社です。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
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
        className={`${geistSans.variable} ${geistMono.variable} ${shippori.variable} ${zenKaku.variable} ${yujiBoku.variable} antialiased`}
        style={{ fontFamily: "var(--font-zen), var(--font-geist-sans), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
