"use client";

import { HomeHero } from "@/app/_components/home/home-hero";
import { ScreenplaySectionV2 } from "@/app/_components/home/screenplay-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <HomeHero />
      <ScreenplaySectionV2 />
      {/* Full-bleed footer (breaks out of the max-width <main> container) */}
      <div
        style={{
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
        }}
      >
        <Footer />
      </div>
    </>
  );
}
