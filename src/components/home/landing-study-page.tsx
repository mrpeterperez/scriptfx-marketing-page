import { HomeHero, IntroReveal, ScreenplaySection } from "@/components/home";
import { LandingOverview } from "./landing-overview";
import { LandingStudy, type LandingStudyVariant } from "./landing-study";
import styles from "./landing-study.module.css";

export function LandingStudyPage({ variant }: { variant: LandingStudyVariant }) {
  return <>
    <IntroReveal />
    <HomeHero />
    <ScreenplaySection>
      <LandingStudy variant={variant} />
      <div className={styles.following}><LandingOverview startAt={1} /></div>
    </ScreenplaySection>
  </>;
}
