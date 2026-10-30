import type { Metadata } from "next";
import { LandingStudyPage } from "@/components/home/landing-study-page";

export const metadata: Metadata = { title: "Landing preview — Scroll and morph", description: "A scroll-led Write chapter for ScriptFX, with a typewriter transition into Hear.", robots: { index: false, follow: false }, alternates: { canonical: "/" } };

export default function TapLandingPreview() {
  return <LandingStudyPage variant="tap" />;
}
