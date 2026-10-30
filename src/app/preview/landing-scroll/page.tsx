import type { Metadata } from "next";
import { LandingStudyPage } from "@/components/home/landing-study-page";

export const metadata: Metadata = { title: "Landing preview — Scroll story", description: "A scroll-led Write chapter for ScriptFX.", robots: { index: false, follow: false }, alternates: { canonical: "/" } };

export default function ScrollLandingPreview() {
  return <LandingStudyPage variant="scroll" />;
}
