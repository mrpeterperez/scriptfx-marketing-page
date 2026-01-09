import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/nav/top-nav";
import { SoundToggle } from "@/components/sound/sound-effects";

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

export const metadata: Metadata = {
  title: {
    default: "ScriptFX",
    template: "%s | ScriptFX",
  },
  description: "ScriptFX helps you ship faster with automation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/fva4ncx.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-surface text-on-surface antialiased font-body`}
      >
        <TopNav />
        <main className="mx-auto w-full max-w-5xl px-6 pt-28">
          {children}
        </main>

        {/* Audio toggle (UI only for now) */}
        <SoundToggle />
      </body>
    </html>
  );
}
