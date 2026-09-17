import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "AI Kingdom Simulator — Crônicas da Coroa",
  description: "Gerenciamento narrativo de reino com liberdade de decisões interpretadas por IA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} dark h-full antialiased selection:bg-amber-600/30 selection:text-amber-200`}
    >
      <body className="min-h-full flex flex-col bg-[#08090d] text-slate-100 overflow-x-hidden font-sans">
        {children}
      </body>
    </html>
  );
}
