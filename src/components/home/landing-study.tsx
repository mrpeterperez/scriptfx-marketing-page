"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProductPreview } from "@/components/site/product-preview";
import { ProductDemoFrame } from "@/components/site/product-demo";
import { LandingMoment } from "./landing-moment";
import styles from "./landing-study.module.css";

export type LandingStudyVariant = "scroll" | "tap";

const moments = [
  { id: "familiar", label: "Familiar", title: "Write like you always have.", copy: "Familiar screenplay formatting. Room to find the right line.", tone: "gold" },
  { id: "beats", label: "Beats", title: "Write beat by beat.", copy: "Shape the acts. Move the scenes. Keep the page in sync.", tone: "red" },
  { id: "versions", label: "Versions", title: "Write it another way.", copy: "Three versions. One scene. Your call.", tone: "black" },
  { id: "together", label: "Together", title: "Write it together.", copy: "Your co-writer, producer, and readers. One script. Every note on its line.", tone: "gold" },
] as const;

export function LandingStudy({ variant }: { variant: LandingStudyVariant }) {
  const root = useRef<HTMLElement>(null);
  const product = useRef<HTMLDivElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [entered, setEntered] = useState(variant === "tap");
  const current = moments[active];

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const scope = root.current!;
    const following = scope.nextElementSibling as HTMLElement | null;
    const media = gsap.matchMedia();
    const measure = () => {
      const stage = scope.querySelector<HTMLElement>("[data-study-stage]")!;
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--masthead-height")) || 64;
      stage.style.setProperty("--study-top", `${Math.min(header, window.innerHeight - stage.offsetHeight)}px`);
    };
    const resize = new ResizeObserver(measure);
    resize.observe(scope.querySelector("[data-study-stage]")!);
    measure();

    media.add({ reduced: "(prefers-reduced-motion: reduce)", short: "(max-height: 700px)" }, context => {
      if (!context.conditions?.reduced && !context.conditions?.short) return;
      scope.dataset.static = "true";
      setEntered(true);
      if (variant === "scroll") gsap.set("[data-study-art]", { autoAlpha: 0 });
      gsap.set("[data-study-product], [data-study-controls]", { autoAlpha: 1, y: 0, scale: 1 });
      return () => { delete scope.dataset.static; };
    }, scope);
    if (variant === "scroll") media.add("(min-height: 701px) and (prefers-reduced-motion: no-preference)", () => {
      const timeline = gsap.timeline({ scrollTrigger: {
        trigger: scope,
        start: () => `top top+=${parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--masthead-height")) || 64}`,
        end: "bottom bottom",
        scrub: .65,
        invalidateOnRefresh: true,
        onUpdate: self => {
          setEntered(self.progress > .17);
          setActive(Math.min(3, Math.max(0, Math.floor((self.progress - .28) / .18))));
        },
      } });
      trigger.current = timeline.scrollTrigger!;
      timeline
        .to({}, { duration: .12 })
        .to("[data-study-art]", { yPercent: -16, rotation: -4, scale: .93, autoAlpha: 0, duration: .16, ease: "power2.inOut" }, .12)
        .fromTo("[data-study-product]", { y: 40, scale: .95, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: .18, ease: "power3.out" }, .19)
        .fromTo("[data-study-controls]", { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .1 }, .22)
        .to({}, { duration: .68 }, .32);
      return () => { trigger.current = null; };
    }, scope);
    if (variant === "tap" && following) media.add("(min-height: 701px) and (prefers-reduced-motion: no-preference)", () => {
      const stage = scope.querySelector<HTMLElement>("[data-study-stage]")!;
      const hear = following.querySelector<HTMLElement>(".landing-chapter-stage")!;
      const header = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--masthead-height")) || 64;
      const hearTop = () => Math.min(header(), innerHeight - hear.offsetHeight);
      following.dataset.studyHandoff = "true";
      hear.inert = true;
      trigger.current = ScrollTrigger.create({
        trigger: scope, start: () => `top ${header()}px`,
        endTrigger: following, end: "top bottom", invalidateOnRefresh: true,
        onUpdate: self => {
          const position = self.progress * moments.length;
          const index = Math.min(moments.length - 1, Math.floor(position));
          setActive(index);
          buttons.current.forEach((button, buttonIndex) => button?.style.setProperty("--study-progress", String(buttonIndex === index ? Math.min(1, position - index) : 0)));
        },
      });
      gsap.timeline({ scrollTrigger: {
        trigger: following, start: "top bottom", end: () => `top ${hearTop()}px`,
        scrub: .45, invalidateOnRefresh: true,
        onUpdate: self => { stage.inert = self.progress >= .5; hear.inert = self.progress < .5; },
      } })
        .to(stage, { xPercent: -100, duration: 1, ease: "power3.inOut" }, 0)
        .fromTo(hear, { xPercent: 100 }, { xPercent: 0, duration: 1, ease: "power3.inOut" }, 0)
        .fromTo(hear, { y: () => hearTop() - innerHeight }, { y: 0, duration: 1, ease: "none" }, 0);
      return () => {
        trigger.current = null;
        delete following.dataset.studyHandoff;
        stage.inert = false;
        hear.inert = false;
      };
    }, scope);

    let alive = true;
    const refresh = () => {
      if (!alive) return;
      ScrollTrigger.refresh();
      if (location.hash === "#write-study") scope.scrollIntoView({ block: "start" });
    };
    void document.fonts.ready.then(() => requestAnimationFrame(refresh));
    return () => { alive = false; resize.disconnect(); media.revert(); };
  }, [variant]);

  useLayoutEffect(() => {
    if (!entered || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      gsap.fromTo("[data-study-window]", { y: 10, scale: .988 }, { y: 0, scale: 1, duration: .65, ease: "power3.out", clearProps: "transform" });
      const details = active === 2 ? ".landing-versions article" : active === 3 ? ".landing-together-app > div > p" : null;
      if (details) gsap.fromTo(details, { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: .075, duration: .65, ease: "power3.out", clearProps: "transform,opacity" });
    }, product);
    return () => context.revert();
  }, [active, entered]);

  const select = (index: number) => {
    if (trigger.current) {
      const stops = variant === "scroll" ? [.35, .54, .72, .92] : [.1, .375, .625, .9];
      window.scrollTo({ top: trigger.current.start + (trigger.current.end - trigger.current.start) * stops[index], behavior: "smooth" });
    } else setActive(index);
  };
  const navigate = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = event.key === "Home" ? 0 : event.key === "End" ? 3 : ["ArrowRight", "ArrowDown"].includes(event.key) ? (index + 1) % 4 : ["ArrowLeft", "ArrowUp"].includes(event.key) ? (index + 3) % 4 : null;
    if (next === null) return;
    event.preventDefault();
    buttons.current[next]?.focus();
    select(next);
  };

  return <section ref={root} id="write-study" className={styles.study} data-variant={variant} data-entered={entered} data-scriptfx-features="true" aria-labelledby="study-write-title">
    <div className={styles.stage} data-study-stage>
      <nav className={styles.compare} aria-label="Compare landing previews">
        <Link href="/preview/landing-scroll#write-study" aria-current={variant === "scroll" ? "page" : undefined} prefetch={false}>Scroll story</Link>
        <Link href="/preview/landing-tap#write-study" aria-current={variant === "tap" ? "page" : undefined} prefetch={false}>Scroll and morph</Link>
        <Link href="/" prefetch={false}>Original <ArrowUpRight size={12} aria-hidden="true" /></Link>
      </nav>
      <div className={styles.copy}>
        <div className={styles.lede}><h2 id="study-write-title">Write.</h2>
          <p>{variant === "scroll" ? "Familiar screenplay formatting. Room to find the right line. Move between writing and listening as your draft takes shape." : "Familiar. Focused. Out of the way."}</p>
        </div>
        <div className={styles.options} data-study-controls role="tablist" aria-label="Explore writing features" inert={!entered}>
          {moments.map((moment, index) => <button key={moment.id} ref={element => { buttons.current[index] = element; }} type="button" role="tab" id={`study-tab-${moment.id}`} aria-controls="study-product-panel" aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => select(index)} onKeyDown={event => navigate(event, index)}>
            <span className={styles.longLabel}>{moment.title}</span><span className={styles.shortLabel}>{moment.label}</span>
            <span className={styles.description}><span>{moment.copy}</span></span>
            {variant === "tap" && <span className={styles.progress} aria-hidden="true" />}
          </button>)}
        </div>
        <Link href="/products/screenplay-editor" className={styles.explore}>Explore screenwriting <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>

      <div className={styles.visual} role="tabpanel" id="study-product-panel" aria-labelledby={`study-tab-${current.id}`}>
        <div ref={product} className={styles.product} data-study-product>
          {["gold", "red", "black"].map(tone => <div key={tone} className={styles.material} data-tone={tone} data-active={current.tone === tone} aria-hidden="true" />)}
          <div className={styles.window} data-study-window>
            <div className={styles.chrome}><span aria-hidden="true"><i /><i /><i /></span><span>ScriptFX</span><span aria-hidden="true" /></div>
            <div className={styles.screen}>
              <div className={styles.live} data-active={active < 2} aria-hidden={active >= 2}><ProductPreview mode={active === 1 ? "tools" : "classic"} enabled={entered && active < 2} fit compactCanvas label="Animated ScriptFX screenplay and Beats preview." /></div>
              <div className={`${styles.detail} landing-card`} data-active={active === 2} inert={active !== 2} aria-hidden={active !== 2}><ProductDemoFrame sound={false}><LandingMoment kind="revisions" /></ProductDemoFrame></div>
              <div className={`${styles.detail} landing-card`} data-active={active === 3} inert={active !== 3} aria-hidden={active !== 3}><ProductDemoFrame sound={false}><LandingMoment kind="together" /></ProductDemoFrame></div>
            </div>
          </div>
        </div>
        {variant === "scroll" && <div className={styles.art} data-study-art><Image src="/art/products/renaissance/menu-old-master/screenplay-editor.jpg" alt="A black typewriter on a wooden writing desk" width={800} height={800} sizes="(min-width: 1000px) 700px, 90vw" priority /></div>}
      </div>
      <div className={styles.caption} aria-hidden="true" data-visible={entered}><h3>{current.title}</h3><p>{current.copy}</p></div>
    </div>
  </section>;
}
