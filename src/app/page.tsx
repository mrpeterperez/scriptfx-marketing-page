"use client";

import { HomeHero } from "@/app/_components/home/home-hero";
import { ScreenplaySectionV2 } from "@/app/_components/home/screenplay-section";
import { FooterReveal } from "@/app/_components/home/footer-reveal";

export default function Home() {
  return (
    <>
      <HomeHero />
      <ScreenplaySectionV2 />
      
      {/* Footer Reveal - Join the Waitlist with panel animation */}
      <FooterReveal />
    </>
  );
}
