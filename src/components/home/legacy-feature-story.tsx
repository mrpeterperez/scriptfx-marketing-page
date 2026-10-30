"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { FeaturesSection } from "./features";
import { ProductPreview } from "@/components/site/product-preview";
import { ProductDemoFrame } from "@/components/site/product-demo";
import { LandingMoment, type MomentKind } from "./landing-moment";
import frame from "./landing-study.module.css";
import stack from "./landing-stacks.module.css";
import styles from "./legacy-feature-story.module.css";

type PreviewTab = { title: string; description: string; headline: string; caption: string; kind: MomentKind | "classic" | "tools" | "ai" };
const chapters: { tone: string; tabs: PreviewTab[] }[] = [
  { tone: "gold", tabs: [
    { title: "Classic", description: "Just you and the page.", headline: "Write like you always have.", caption: "Familiar. Focused. Out of the way.", kind: "classic" },
    { title: "With tools", description: "See the whole story.", headline: "Write beat by beat.", caption: "Shape the acts. Move the scenes.", kind: "tools" },
    { title: "With AI", description: "You direct. It helps.", headline: "A second perspective.", caption: "Your story. Your decisions.", kind: "ai" },
  ] },
  { tone: "red", tabs: [
    { title: "Voices", description: "Cast every character.", headline: "Give each character a voice.", caption: "Hear the scene performed.", kind: "voices" },
    { title: "Rewrite", description: "Listen. Then try again.", headline: "Write it. Hear it. Rewrite it.", caption: "Find the line that lands.", kind: "rewrite" },
    { title: "Immersive", description: "Step inside the scene.", headline: "Go immersive.", caption: "Put on headphones. Sound all around you.", kind: "immersive" },
  ] },
  { tone: "black", tabs: [
    { title: "Storyboard", description: "Find the visual story.", headline: "Build the scene.", caption: "From words to frames.", kind: "storyboard" },
    { title: "Scene preview", description: "See it in motion.", headline: "Watch an idea take shape.", caption: "A possibility to build on.", kind: "film" },
  ] },
  { tone: "gold", tabs: [
    { title: "Shots", description: "Frame the moment.", headline: "Find your angle.", caption: "See the scene shot by shot.", kind: "storyboard" },
    { title: "Takes", description: "Explore another direction.", headline: "Try another take.", caption: "Same scene. Another possibility.", kind: "cut" },
  ] },
  { tone: "red", tabs: [
    { title: "Cast", description: "Start with the voice.", headline: "Find the character.", caption: "A voice changes the whole scene.", kind: "voices" },
    { title: "Performance", description: "See the moment played.", headline: "Bring the performance to life.", caption: "Explore how the scene could feel.", kind: "film" },
  ] },
  { tone: "black", tabs: [
    { title: "Preview", description: "Watch it come together.", headline: "Watch the page come alive.", caption: "From the page to a possibility.", kind: "film" },
    { title: "Another take", description: "Keep exploring.", headline: "See it another way.", caption: "A new take on the same story.", kind: "cut" },
  ] },
];
const moments = ["voices", "rewrite", "immersive", "storyboard", "film", "cut"] as const;

function FeatureVisual({ active }: { active: number }) {
  const root = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const id = useId();
  const chapter = chapters[active];
  const tabIndex = selected[active] ?? 0;
  const feature = chapter.tabs[tabIndex];
  const isProduct = ["classic", "tools", "ai"].includes(feature.kind);
  const chooseTab = (index: number) => setSelected(current => ({ ...current, [active]: index }));
  useLayoutEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => { gsap.fromTo("[data-feature-caption]", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: "power3.out", clearProps: "transform,opacity" }); }, root);
    return () => context.revert();
  }, [active, tabIndex]);
  return <div ref={root} className={styles.preview}>
    <div className={styles.showcase}>
    <div className={styles.tabs} role="tablist" aria-label={`${["Write", "Hear", "Build", "Direct", "Act", "Watch"][active]} features`}>
      {chapter.tabs.map((tab, index) => <button key={tab.title} id={`${id}-tab-${index}`} role="tab" type="button" aria-selected={index === tabIndex} aria-controls={`${id}-panel`} tabIndex={index === tabIndex ? 0 : -1} onClick={() => chooseTab(index)} onKeyDown={event => {
        const next = event.key === "ArrowRight" ? (index + 1) % chapter.tabs.length : event.key === "ArrowLeft" ? (index - 1 + chapter.tabs.length) % chapter.tabs.length : event.key === "Home" ? 0 : event.key === "End" ? chapter.tabs.length - 1 : null;
        if (next === null) return;
        event.preventDefault(); chooseTab(next);
        (event.currentTarget.parentElement?.children[next] as HTMLButtonElement)?.focus();
      }}><strong>{tab.title}</strong><span>{tab.description}</span></button>)}
    </div>
    <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${tabIndex}`} className={`${stack.media} ${styles.media}`} data-tone={chapter.tone}>
      <div className={frame.window}>
        <div className={frame.chrome}><span aria-hidden="true"><i /><i /><i /></span><span>ScriptFX</span><span /></div>
        <div className={frame.screen}>
          <div className={frame.live} data-active={isProduct} aria-hidden={!isProduct}><ProductPreview mode={feature.kind === "ai" ? "ai" : feature.kind === "tools" ? "tools" : "classic"} enabled={isProduct} fit compactCanvas compactBelow={720} label="Animated ScriptFX screenplay and Beats preview" /></div>
          {moments.map(moment => <div key={moment} className={`${frame.detail} ${stack.demo} ${styles.detail} landing-card`} data-active={feature.kind === moment} inert={feature.kind !== moment} aria-hidden={feature.kind !== moment}><ProductDemoFrame sound={false}><LandingMoment kind={moment} /></ProductDemoFrame></div>)}
        </div>
      </div>
    </div>
    </div>
    <div className={styles.caption} data-feature-caption aria-live="polite"><div><h3>{feature.headline}</h3><p>{feature.caption}</p></div></div>
  </div>;
}

const renderPreview = (index: number) => <FeatureVisual active={index} />;
export function LegacyFeatureStory() {
  return <FeaturesSection renderPreview={renderPreview} modern />;
}
