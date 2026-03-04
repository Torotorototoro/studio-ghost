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
        {/* backdrop-filter purged by Tailwind v4 — embedded here */}
        <style dangerouslySetInnerHTML={{ __html: `
          .glass-card {
            -webkit-backdrop-filter: blur(16px) saturate(1.3);
            backdrop-filter: blur(16px) saturate(1.3);
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
