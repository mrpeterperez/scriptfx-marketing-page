import type { Metadata } from "next";
import { HomeHero, IntroReveal, ScreenplaySection } from "@/components/home";
import { LegacyFeatureStory } from "@/components/home/legacy-feature-story";
import { FooterSection } from "@/components/home/footer";
import styles from "./preview.module.css";

export const metadata: Metadata = { title: "Landing preview — Original scroll treatment", description: "The original ScriptFX pinned scroll treatment with current typography and product previews.", robots: { index: false, follow: false }, alternates: { canonical: "/" } };

export default function LegacyLandingPreview() {
  return <><IntroReveal /><HomeHero /><ScreenplaySection><div className={styles.legacy}><LegacyFeatureStory /><FooterSection includeFooter={false} /></div></ScreenplaySection></>;
}
