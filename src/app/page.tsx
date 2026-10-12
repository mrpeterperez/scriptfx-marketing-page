import { HomeHero, IntroReveal, ScreenplaySection } from "@/components/home";

export default function Home() {
  return (
    <>
      <noscript><style>{`.hero-wrapper{position:relative!important;opacity:1!important;visibility:visible!important;height:85svh!important}.hero-headline{position:absolute!important}.hero-wrapper .panel:not(:first-of-type),.cinematic-screenplay,[data-cinematic-features],.intro-reveal{display:none!important}.hero-wrapper .panel:first-of-type{opacity:1!important}.hero-wrapper{transform:none!important}div:has(>.hero-wrapper){height:auto!important}`}</style></noscript>
      <IntroReveal />
      <HomeHero />
      <ScreenplaySection />
    </>
  );
}
