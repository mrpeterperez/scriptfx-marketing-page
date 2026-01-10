"use client";

import { HomeHero } from "@/app/_components/home/home-hero";
import { IntroReveal } from "@/app/_components/home/intro-reveal";
import { ScreenplaySectionV2 } from "@/app/_components/home/screenplay-section";

export default function Home() {
  return (
    <>
      <IntroReveal />
      <HomeHero />
      <ScreenplaySectionV2 />
    </>
  );
}
