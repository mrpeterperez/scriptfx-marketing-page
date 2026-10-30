"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProductPreview } from "@/components/site/product-preview";
import { ProductDemoFrame } from "@/components/site/product-demo";
import { LandingMoment, type MomentKind } from "./landing-moment";
import frame from "./landing-study.module.css";
import styles from "./landing-stacks.module.css";

type Feature = { title: string; copy: string; kind: MomentKind; tone: "gold" | "red" | "black" };
const chapters: { id: string; lines: string[]; copy: string; link: string; features: Feature[] }[] = [
  { id: "write", lines: ["Write like you", "always have."], copy: "Familiar. Focused. Out of the way.", link: "screenplay-editor", features: [
    { title: "Write like you always have.", copy: "Familiar. Focused. Out of the way.", kind: "elements", tone: "gold" },
    { title: "Write beat by beat.", copy: "Shape the acts. Find the scene. Keep the page in sync.", kind: "beats", tone: "red" },
    { title: "Write it another way.", copy: "Three versions. One scene. Your call.", kind: "revisions", tone: "black" },
    { title: "Write it together.", copy: "One script. Your people. Every note on its line.", kind: "together", tone: "gold" },
  ] },
  { id: "hear", lines: ["Hear the story", "come alive."], copy: "Every character. Every line. Every little sound.", link: "audio-drama", features: [
    { title: "Give every character a voice.", copy: "Cast the scene. Direct how they say it.", kind: "voices", tone: "gold" },
    { title: "Hear the scene performed.", copy: "Press play. Hear how the conversation lands.", kind: "table-read", tone: "red" },
    { title: "Write it. Hear it. Rewrite it.", copy: "A little less dialogue. A little more feeling.", kind: "rewrite", tone: "black" },
    { title: "Make it sound like a film.", copy: "The voices, the room, the sounds, and a score.", kind: "sound-film", tone: "gold" },
    { title: "Go immersive.", copy: "Put on headphones. Step inside the scene.", kind: "immersive", tone: "red" },
  ] },
  { id: "see", lines: ["See what you", "imagined."], copy: "From the page to a possibility.", link: "video", features: [
    { title: "Find the frame.", copy: "The wide. The close-up. The moment between them.", kind: "storyboard", tone: "black" },
    { title: "Watch the page come alive.", copy: "Follow the dialogue from page to screen.", kind: "film", tone: "red" },
    { title: "Try another take.", copy: "Explore a performance. Decide what belongs.", kind: "cut", tone: "gold" },
  ] },
];

function FeatureStack({ chapter }: { chapter: typeof chapters[number] }) {
  const root = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const busy = useRef(false);
  const drag = useRef<{ id: number; x: number; y: number; lastX: number; lastAt: number; velocity: number; moved: boolean } | null>(null);
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [shown, setShown] = useState(false);
  const count = chapter.features.length;
  const current = chapter.features[active];
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const offset = (index: number) => ((index - active) * direction + count) % count;

  useLayoutEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setShown(entry.isIntersecting && entry.intersectionRatio >= .35), { threshold: [0, .35] });
    observer.observe(root.current!);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      cards.current.forEach((card, index) => {
        const depth = ((index - active) * direction + count) % count;
        gsap.set(card, { x: 0, y: depth * 15, scale: 1 - depth * .035, rotation: depth === 0 ? 0 : (depth % 2 ? 1.5 : -1.5), opacity: depth > 2 ? 0 : 1 });
      });
    }, root);
    return () => context.revert();
  }, [active, direction, count]);

  useLayoutEffect(() => () => { cards.current.forEach(card => { if (card) gsap.killTweensOf(card); }); }, []);

  const advance = (step: number, travel = step > 0 ? -1 : 1) => {
    if (busy.current) return;
    busy.current = true;
    const outgoing = cards.current[active]!;
    const complete = () => { setActive(index => (index + step + count) % count); busy.current = false; };
    if (reduced()) { complete(); return; }
    gsap.to(outgoing, { x: travel * (outgoing.offsetWidth + 80), rotation: travel * 12, opacity: 0, duration: .42, ease: "power3.in", onComplete: complete });
    const next = cards.current[(active + step + count) % count];
    gsap.to(next, { y: 0, scale: 1, rotation: 0, duration: .55, ease: "power3.out" });
  };
  const reset = () => {
    gsap.to(cards.current[active], { x: 0, rotation: 0, scale: 1, duration: reduced() ? 0 : .5, ease: "power3.out" });
    const next = cards.current[(active + direction + count) % count];
    gsap.to(next, { y: 15, scale: .965, duration: reduced() ? 0 : .5, ease: "power3.out" });
  };
  const down = (event: PointerEvent<HTMLElement>) => {
    if (busy.current || !event.isPrimary || (event.pointerType === "mouse" && event.button !== 0) || (event.target as HTMLElement).closest("button,a,input,select,textarea,video,audio,canvas")) return;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, lastAt: event.timeStamp, velocity: 0, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    gsap.killTweensOf(event.currentTarget);
  };
  const move = (event: PointerEvent<HTMLElement>) => {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    const x = event.clientX - gesture.x, y = event.clientY - gesture.y;
    if (!gesture.moved && (Math.abs(x) < 8 || Math.abs(y) > Math.abs(x))) return;
    gesture.moved = true;
    if (event.cancelable) event.preventDefault();
    gesture.velocity = (event.clientX - gesture.lastX) / Math.max(1, event.timeStamp - gesture.lastAt);
    gesture.lastX = event.clientX; gesture.lastAt = event.timeStamp;
    const step = x < 0 ? 1 : -1;
    if (step !== direction) setDirection(step);
    const progress = Math.min(1, Math.abs(x) / event.currentTarget.offsetWidth);
    gsap.set(event.currentTarget, { x, rotation: reduced() ? 0 : x / 28, scale: 1 - progress * .025 });
    gsap.set(cards.current[(active + step + count) % count], { y: 15 * (1 - progress), scale: .965 + progress * .035 });
  };
  const release = (event: PointerEvent<HTMLElement>, cancelled = false) => {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const x = event.clientX - gesture.x;
    const quick = event.timeStamp - gesture.lastAt < 120 && Math.abs(gesture.velocity) > .6;
    if (!cancelled && gesture.moved && (Math.abs(x) > event.currentTarget.offsetWidth * .18 || (quick && Math.abs(x) > 24))) advance(x < 0 ? 1 : -1, x < 0 ? -1 : 1);
    else reset();
  };
  const go = (step: number) => { if (!busy.current) { setDirection(step); advance(step); } };

  return <div ref={root} className={styles.featureStack}>
    <div className={styles.deck} role="region" aria-roledescription="carousel" aria-label={`${chapter.id} features`} tabIndex={0} onKeyDown={event => {
      if ((event.target as HTMLElement).closest("input,textarea,select,[role=slider]")) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); go(event.key === "ArrowRight" ? 1 : -1); }
    }}>
      {chapter.features.map((feature, index) => <article key={feature.kind} ref={element => { cards.current[index] = element; }} className={`${styles.card} landing-card`} style={{ zIndex: count - offset(index), pointerEvents: index === active ? "auto" : "none" } as CSSProperties} data-active={index === active} data-depth={offset(index)} inert={index !== active || !shown} aria-hidden={index !== active} role="group" aria-roledescription="slide" aria-label={`${feature.title} ${index + 1} of ${count}`} onPointerDown={down} onPointerMove={move} onPointerUp={event => release(event)} onPointerCancel={event => release(event, true)}>
        <div className={styles.media} data-tone={feature.tone}>
          <div className={frame.window}>
            <div className={frame.chrome}><span aria-hidden="true"><i /><i /><i /></span><span>ScriptFX</span><span /></div>
            <div className={frame.screen}>
              {feature.kind === "elements" || feature.kind === "beats" ? <div className={frame.live} data-active="true"><ProductPreview mode={feature.kind === "beats" ? "tools" : "classic"} enabled={index === active && shown} fit compactCanvas compactBelow={720} label={`Animated ScriptFX ${feature.kind === "beats" ? "Beats board" : "screenplay"} preview`} /></div> : <div className={`${frame.detail} ${styles.demo}`} data-active="true"><ProductDemoFrame sound={false}><LandingMoment kind={feature.kind} /></ProductDemoFrame></div>}
            </div>
          </div>
        </div>
      </article>)}
    </div>
    <div className={styles.caption} aria-live="polite" aria-atomic="true"><h3 key={current.title}>{current.title}</h3><p>{current.copy}</p></div>
    <div className={styles.controls}>
      <span className={styles.counter}><span>{String(active + 1).padStart(2, "0")}</span><span aria-hidden="true"> / </span>{String(count).padStart(2, "0")}</span>
      <span className={styles.hint}>Swipe to explore</span>
      <div className={styles.arrows}><button type="button" onClick={() => go(-1)} aria-label={`Previous ${chapter.id} feature`}><ArrowLeft size={18} /></button><button type="button" onClick={() => go(1)} aria-label={`Next ${chapter.id} feature`}><ArrowRight size={18} /></button></div>
    </div>

  </div>;
}

export function LandingStacks() {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const scope = root.current!;
    const media = gsap.matchMedia();
    media.add("(min-height: 701px) and (prefers-reduced-motion: no-preference)", () => {
      scope.dataset.motion = "active";
      const sections = [...scope.querySelectorAll<HTMLElement>("[data-stack-chapter]")];
      const stages = sections.map(section => section.querySelector<HTMLElement>("[data-stack-stage]")!);
      const measure = () => {
        const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--masthead-height")) || 64;
        stages.forEach(stage => stage.style.setProperty("--stack-top", `${Math.min(header, innerHeight - stage.offsetHeight)}px`));
      };
      measure();
      const observer = new ResizeObserver(measure);
      stages.forEach(stage => observer.observe(stage));
      sections.slice(1).forEach((section, index) => {
        gsap.timeline({ scrollTrigger: { trigger: section, start: "top bottom", end: () => `top ${parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--masthead-height")) || 64}px`, scrub: .5, invalidateOnRefresh: true } })
          .to(stages[index], { scale: .955, y: -28, transformOrigin: "50% 0%", ease: "none" }, 0);
      });
      let alive = true;
      void document.fonts.ready.then(() => { if (!alive) return; ScrollTrigger.refresh(); if (/^#stack-(write|hear|see)$/.test(location.hash)) document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: "start", behavior: "instant" }); });
      return () => { alive = false; observer.disconnect(); delete scope.dataset.motion; };
    }, scope);
    return () => media.revert();
  }, []);

  return <div ref={root} className={styles.stories} data-scriptfx-features="true">
    {chapters.map((chapter, index) => <section key={chapter.id} id={`stack-${chapter.id}`} className={styles.chapter} data-stack-chapter aria-labelledby={`stack-${chapter.id}-title`} style={{ zIndex: index + 1 }}>
      <div className={styles.stage} data-stack-stage>
        {index === 0 && <nav className={styles.compare} aria-label="Compare landing previews"><Link href="/preview/landing-tap#write-study">Scroll study</Link><Link href="/">Original <ArrowUpRight size={12} /></Link></nav>}
        <div className={styles.copy}><h2 id={`stack-${chapter.id}-title`}>{chapter.lines.map(line => <span key={line}>{line}</span>)}</h2><p>{chapter.copy}</p><Link className={styles.explore} href={`/products/${chapter.link}`}>Explore {chapter.id === "write" ? "screenwriting" : chapter.id === "hear" ? "audio drama" : "cinematic video"}<ArrowUpRight size={16} /></Link></div>
        <FeatureStack chapter={chapter} />
      </div>
    </section>)}
    <section className={styles.invitation} data-scriptfx-show-dont-tell="true"><h2>Make something<br />worth telling.</h2><p>Start with the scene you can’t stop thinking about.</p><Link href="/get-access">Get access <ArrowUpRight size={18} /></Link></section>
  </div>;
}
