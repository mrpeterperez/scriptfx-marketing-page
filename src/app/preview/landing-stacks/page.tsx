import type { Metadata } from "next";
import { HomeHero, IntroReveal, ScreenplaySection } from "@/components/home";
import { LandingStacks } from "@/components/home/landing-stacks";

export const metadata: Metadata = { title: "Landing preview — Swipe the story", description: "Explore Write, Hear, and See through a stack of swipeable ScriptFX product cards.", robots: { index: false, follow: false }, alternates: { canonical: "/" } };

export default function StackLandingPreview() {
  return <><IntroReveal /><HomeHero /><ScreenplaySection><LandingStacks /></ScreenplaySection></>;
}
