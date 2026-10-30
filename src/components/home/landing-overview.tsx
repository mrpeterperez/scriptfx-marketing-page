"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { productArtSubjects } from "@/lib/site/art-direction";
import { LandingMoment } from "./landing-moment";
import { ProductDemoFrame } from "@/components/site/product-demo";

const chapters = [
  { title: "Write.", slug: "screenplay-editor", copy: "Familiar screenplay formatting. Room to find the right line. Move between writing and listening as your draft takes shape.", link: "Explore screenwriting", moments: [
    { kind: "elements", frame: "gold", line: "Write like you always have.", copy: "Familiar. Focused. Out of the way." },
    { kind: "beats", frame: "red", line: "Write. Beat by beat.", copy: "Shape the acts. Move the scenes. Keep the page in sync." },
    { kind: "revisions", frame: "black", line: "Write it another way.", copy: "Three versions. One scene. Your call." },
    { kind: "together", frame: "gold", line: "Write it together.", copy: "Your co-writer, producer, and readers. One script. Every note on its line." },
  ] },
  { title: "Hear.", slug: "audio-drama", copy: "Give characters distinct voices. Hear the dialogue as a table read, or step inside an immersive scene with sound and music.", link: "Explore audio drama", moments: [
    { kind: "voices", frame: "gold", line: "Hear every character.", copy: "Give each character a voice. Direct how they say it." },
    { kind: "rewrite", frame: "black", line: "Hear your next rewrite.", copy: "Write it. Hear it. Rewrite it. Listen to the difference." },
    { kind: "sound-film", frame: "gold", line: "Hear it like a film.", copy: "Table read or audio drama. Add the room, the sounds, and a score." },
    { kind: "immersive", frame: "red", line: "Hear it all around you.", copy: "Go immersive. Put on headphones and step inside the scene." },
  ] },
  { title: "See.", slug: "video", copy: "Explore performances, framing, and shots from your screenplay. Review each generated take and decide what belongs in your story.", link: "Explore cinematic video", moments: [
    { kind: "storyboard", frame: "black", line: "See the scene in frames.", copy: "Explore the wide, the close-up, and the moment between them." },
    { kind: "film", frame: "red", line: "See the page come alive.", copy: "Explore a performance. Follow the dialogue from page to screen." },
    { kind: "cut", frame: "gold", line: "See another possibility.", copy: "Review another take. Decide what belongs in your story." },
  ] },
] as const;

export function LandingOverview({ startAt = 0 }: { startAt?: number }) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(min-height: 561px) and (prefers-reduced-motion: no-preference)", () => {
      const scope = root.current!;
      scope.dataset.motion = "active";
      const panels = gsap.utils.toArray<HTMLElement>(".landing-panel", scope);
      const markers = gsap.utils.toArray<HTMLElement>(".landing-panel-marker", scope);
      const header = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--masthead-height")) || 64;
      const titleResets: (() => void)[] = [];
      const measure = () => {
        const stages = panels.map(panel => panel.querySelector<HTMLElement>(".landing-chapter-stage") ?? panel);
        const tops = stages.map(stage => Math.min(header(), window.innerHeight - stage.offsetHeight));
        stages.forEach((stage, index) => gsap.set(stage, { "--landing-stick-top": `${tops[index]}px` }));
        titleResets.forEach(reset => reset());
      };
      let refreshing = false;
      const beginRefresh = () => { refreshing = true; measure(); };
      const endRefresh = () => { refreshing = false; };
      measure();
      ScrollTrigger.addEventListener("refreshInit", beginRefresh);
      ScrollTrigger.addEventListener("refresh", endRefresh);
      panels.slice(0, -1).forEach((panel, index) => {
        const surface = panel.querySelector(".landing-panel-surface");
        const shade = panel.querySelector(".landing-collision-shade");
        const track = panel.querySelector<HTMLElement>(".landing-track")!;
        const cards = Array.from(track.children) as HTMLElement[];
        let activeCard = 0;
        let enabled = true;
        let returning = false;
        let returnAt = Infinity;
        const activate = (next: number) => {
          activeCard = next;
          cards.forEach((card, cardIndex) => {
            card.inert = !enabled || returning || cardIndex !== next;
            if (card.inert) card.querySelectorAll<HTMLMediaElement>("audio,video").forEach(clip => clip.pause());
          });
        };
        activate(0);
        const sequence = gsap.timeline({
          onUpdate: () => {
            const next = Math.max(0, Math.min(cards.length - 1, Math.round(-Number(gsap.getProperty(track, "xPercent")) / 100)));
            const rewinding = sequence.time() >= returnAt;
            if (next !== activeCard || rewinding !== returning) {
              returning = rewinding;
              activate(next);
            }
          },
          scrollTrigger: {
            trigger: markers[index], start: () => `top top+=${header()}`,
            endTrigger: markers[index + 1], end: "top bottom",
            scrub: .35, invalidateOnRefresh: true,
            onEnter: () => { enabled = true; activate(activeCard); },
            onEnterBack: self => {
              enabled = true;
              if (refreshing) { activate(activeCard); return; }
              returning = false;
              sequence.progress(0);
              activate(0);
              window.scrollTo({ top: self.start + 1, behavior: "instant" });
            },
            onLeave: () => { enabled = false; activate(activeCard); },
            onLeaveBack: () => { enabled = false; activate(activeCard); },
          },
        });
        const title = panel.querySelector<HTMLElement>(".landing-floating-heading");
        const titleAt = (cardIndex: number) => {
          const stage = panel.querySelector<HTMLElement>(".landing-chapter-stage")!;
          const anchor = cards[cardIndex].querySelector<HTMLElement>(".landing-heading-anchor")!;
          const box = stage.getBoundingClientRect();
          const scale = box.width / stage.offsetWidth;
          const rect = anchor.getBoundingClientRect();
          return { x: (rect.left - track.getBoundingClientRect().left) / scale - cardIndex * stage.offsetWidth, y: (rect.top - box.top) / scale, fontSize: getComputedStyle(anchor).fontSize };
        };
        if (title) {
          gsap.set(title, titleAt(0));
          titleResets.push(() => { if (sequence.progress() === 0) gsap.set(title, titleAt(0)); });
        }
        sequence.to({}, { duration: .65 });
        cards.slice(1).forEach((card, cardIndex) => {
          const at = sequence.duration();
          const visual = card.querySelector(".landing-moment-media");
          const letters = card.querySelectorAll(".moment-letter");
          const details = card.querySelectorAll("[data-moment-reveal], .moment-beats section");
          const waves = card.querySelectorAll(".moment-wave i");
          gsap.set(visual, { y: 30, scale: .97, opacity: 0 });
          gsap.set(letters, { opacity: 0 });
          if (details.length) gsap.set(details, { y: 14, opacity: 0 });
          if (waves.length) gsap.set(waves, { scaleY: .12, transformOrigin: "50% 50%" });
          if (title) sequence.fromTo(title,
            { x: () => titleAt(cardIndex).x, y: () => titleAt(cardIndex).y, fontSize: () => titleAt(cardIndex).fontSize },
            { x: () => titleAt(cardIndex + 1).x, y: () => titleAt(cardIndex + 1).y, fontSize: () => titleAt(cardIndex + 1).fontSize, duration: .9, ease: "power3.inOut", immediateRender: false }, at);
          sequence
            .to(track, { xPercent: -(cardIndex + 1) * 100, duration: .9, ease: "power3.inOut" }, at)
            .to(visual, { y: 0, scale: 1, opacity: 1, duration: .6, ease: "power3.out" }, at + .3);
          if (details.length) sequence.to(details, { y: 0, opacity: 1, duration: .4, stagger: { amount: .18 }, ease: "power2.out" }, at + .65);
          if (waves.length) sequence.to(waves, { scaleY: 1, duration: .45, stagger: { amount: .25 }, ease: "power2.out" }, at + .65);
          sequence
            .to(letters, { opacity: 1, duration: .001, stagger: { amount: .28 }, ease: "none" }, at + .8)
            .fromTo(card.querySelector(".moment-type-caret"), { opacity: 0 }, { opacity: 1, duration: .01 }, at + .8)
            .to(card.querySelector(".moment-type-caret"), { opacity: 0, duration: .08 }, at + 1.22)
            .to({}, { duration: .75 }, at + 1.25);
        });
        if (panel.getAttribute("aria-labelledby") !== "chapter-audio-drama") {
          returnAt = sequence.duration();
          sequence.addLabel("carriageReturn", returnAt);
          sequence.to(track, { xPercent: 0, duration: 1.1, ease: "power4.inOut" }, returnAt);
          if (title) sequence.fromTo(title,
            { x: () => titleAt(cards.length - 1).x, y: () => titleAt(cards.length - 1).y, fontSize: () => titleAt(cards.length - 1).fontSize },
            { x: () => titleAt(0).x, y: () => titleAt(0).y, fontSize: () => titleAt(0).fontSize, duration: 1.1, ease: "power4.inOut", immediateRender: false }, returnAt);
          sequence.to({}, { duration: .15 });
        }
        gsap.timeline({ scrollTrigger: {
          trigger: markers[index + 1], start: "top bottom", end: () => `top top+=${header()}`,
          scrub: .25, invalidateOnRefresh: true,
        } })
          .to(surface, { scale: .94, y: -24, ease: "none", transformOrigin: "50% 0%" }, 0)
          .to(shade, { opacity: .12, ease: "none" }, 0);
      });
      return () => {
        ScrollTrigger.removeEventListener("refreshInit", beginRefresh);
        ScrollTrigger.removeEventListener("refresh", endRefresh);
        delete scope.dataset.motion;
        scope.querySelectorAll<HTMLElement>(".landing-card").forEach(card => { card.inert = false; });
      };
    }, root);
    return () => media.revert();
  }, []);

  return <div ref={root} className="landing-overview" data-scriptfx-features="true">
    <div className="landing-chapters">{chapters.slice(startAt).map(chapter => {
      const art = productArtSubjects.find(item => item.slug === chapter.slug)!;
      const stem = chapter.title.slice(0, -1);
      return <section key={chapter.slug} className="landing-chapter landing-panel" aria-labelledby={`chapter-${chapter.slug}`} style={{ "--chapter-scroll": `${chapter.moments.length * 120 + (chapter.slug === "audio-drama" ? 240 : 320)}svh` } as CSSProperties}>
        <div className="landing-panel-marker" aria-hidden="true" />
        <div className="landing-chapter-stage landing-panel-surface"><span className="landing-floating-heading" aria-hidden="true">{stem}</span><div className="landing-track">
          <div className="landing-chapter-surface landing-card"><div className="landing-chapter-copy"><h2 id={`chapter-${chapter.slug}`} aria-label={chapter.title}><span><span className="landing-heading-anchor">{stem}</span>.</span></h2><p>{chapter.copy}</p><Link href={`/products/${chapter.slug}`} className="landing-editorial-link">{chapter.link}<ArrowUpRight size={17} aria-hidden="true" /></Link></div><div className="landing-chapter-art"><Image src={art.src} alt={art.subject} width={800} height={800} sizes="(min-width: 1024px) 540px, (min-width: 768px) 45vw, 100vw" /></div></div>
          {chapter.moments.map(moment => <div key={moment.kind} className="landing-moment-card landing-card" data-moment={moment.kind}>
            <div className="landing-moment-media" data-frame={moment.frame}><ProductDemoFrame sound={false}><LandingMoment kind={moment.kind} /></ProductDemoFrame></div>
            <div className="landing-moment-caption"><h3 className="moment-typewriter" aria-label={moment.line}><span aria-hidden="true"><span className="landing-heading-anchor">{stem}</span>{Array.from(moment.line.slice(stem.length)).map((letter, letterIndex) => <span key={letterIndex} className="moment-letter">{letter}</span>)}<span className="moment-type-caret" /></span></h3>{"copy" in moment && <p>{moment.copy}</p>}</div>
          </div>)}
        </div><span className="landing-collision-shade" aria-hidden="true" /></div>
      </section>;
    })}
      <section className="landing-invitation landing-panel" aria-labelledby="landing-invitation-title" data-scriptfx-show-dont-tell="true"><div className="landing-panel-marker" aria-hidden="true" /><div className="landing-invitation-surface landing-panel-surface"><h2 id="landing-invitation-title">Make something<br />worth telling.</h2><p>Start with the scene you can’t stop thinking about.</p><div><Button asChild><Link href="/get-access">Get access<ArrowUpRight size={17} aria-hidden="true" /></Link></Button><Link href="/pricing" className="landing-editorial-link">Explore plans<ArrowUpRight size={17} aria-hidden="true" /></Link></div><small>Join the waitlist. No payment required.</small></div></section>
    </div>
  </div>;
}
