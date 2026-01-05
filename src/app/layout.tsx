import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/nav/top-nav";
import { SoundProvider, SoundToggle } from "@/components/sound/sound-effects";
import { CustomCursor } from "@/components/cursor/custom-cursor";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-surface text-on-surface antialiased`}
      >
        <SoundProvider>
          {/* Custom cursor - active during screenplay section (roughly 0-40% of scroll) */}
          <CustomCursor activeScenes={[{ start: 0.05, end: 0.45 }]} />
          
          <TopNav />
          <main className="mx-auto w-full max-w-5xl px-6 pt-28 pb-12">
            {children}
          </main>
          
          {/* Sound toggle button */}
          <SoundToggle />
        </SoundProvider>
      </body>
    </html>
  );
}
