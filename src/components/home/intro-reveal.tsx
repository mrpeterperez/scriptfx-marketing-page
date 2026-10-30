"use client";

import { FilmPlate } from "@/components/effects/film-plate";

import * as React from "react";
import Image from "next/image";
import { gsap } from "gsap";

export function IntroReveal() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    const headline = document.querySelector<HTMLElement>(".hero-headline h1");
    if (!container || !image || !headline) return;
    const reveal = document.querySelectorAll(".hero-tagline, .hero-actions");
    const letters = headline.querySelectorAll<HTMLElement>(".hero-type-letter");
    const caret = headline.querySelector<HTMLElement>(".hero-intro-caret");
    const overflow = document.body.style.overflow;
    let cancelled = false;
    let finished = false;
    let ctx: gsap.Context | undefined;
    const finish = () => {
      finished = true;
      gsap.set(container, { autoAlpha: 0 });
      gsap.set(headline, { autoAlpha: 1, x: 0, y: 0, scale: 1 });
      gsap.set(reveal, { autoAlpha: 1, y: 0 });
      gsap.set(letters, { autoAlpha: 1 });
      if (caret) gsap.set(caret, { autoAlpha: 0 });
      document.body.style.overflow = overflow;
      window.dispatchEvent(new CustomEvent("scriptfx-intro-complete"));
    };
    gsap.set(headline, { autoAlpha: 0 });
    const start = () => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.scrollY > 80) {
          finish();
          return;
        }
        const target = headline.getBoundingClientRect();
        const bounds = container.getBoundingClientRect();
        const scale = Math.min(bounds.width * .88 / target.width, bounds.height * .5 / target.height, 2.2);
        gsap.set(headline, {
          autoAlpha: 1,
          transformOrigin: "50% 50%",
          x: bounds.left + bounds.width / 2 - target.left - target.width / 2,
          y: bounds.top + bounds.height / 2 - target.top - target.height / 2,
          scale,
        });
        gsap.set(reveal, { autoAlpha: 0, y: 16 });
        gsap.set(image, { scale: 1.12 });
        gsap.set(letters, { autoAlpha: 0 });
        if (caret) gsap.set(caret, { autoAlpha: 1 });
        const tl = gsap.timeline({ onComplete: finish, defaults: { force3D: false } });
        let at = .2;
        for (const line of headline.querySelectorAll(".hero-line-1, .hero-line-2")) {
          line.querySelectorAll<HTMLElement>(".hero-type-letter").forEach(letter => {
            tl.set(letter, { autoAlpha: 1 }, at);
            if (caret) tl.call(() => { gsap.set(caret, { left: letter.offsetLeft + letter.offsetWidth, top: letter.offsetTop }); }, [], at);
            at += .038;
          });
          at += .2;
        }
        const settle = at + .4;
        tl.to(image, { scale: 1, duration: settle + .95, ease: "power2.out" }, 0);
        if (caret) tl.set(caret, { autoAlpha: 0 }, settle);
        tl.to(headline, { x: 0, y: 0, scale: 1, duration: .9, ease: "power3.inOut" }, settle);
        tl.to(image, { autoAlpha: 0, duration: .5, ease: "power2.inOut" }, settle + .2);
        tl.set(container, { autoAlpha: 0 }, settle + .7);
        tl.to(reveal, { autoAlpha: 1, y: 0, duration: .3, stagger: .04, ease: "power2.out" }, settle + .6);
      }, container);
    };
    const width = window.innerWidth;
    const height = window.innerHeight;
    const resize = () => {
      if (finished) return;
      if (Math.abs(window.innerWidth - width) < 20 && Math.abs(window.innerHeight - height) < 20) return;
      cancelled = true;
      ctx?.revert();
      finish();
    };
    const scroll = () => {
      if (finished || window.scrollY <= 80) return;
      cancelled = true;
      ctx?.revert();
      finish();
    };
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", scroll, { passive: true });
    void document.fonts.ready.then(start);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", scroll);
      ctx?.revert();
      document.body.style.overflow = overflow;
    };
  }, []);

  return (
    <div ref={containerRef} className="intro-reveal pointer-events-none fixed inset-0 z-[40]" aria-hidden="true">
      <div ref={imageRef} className="absolute inset-0">
        <Image src="/video/mountain-scene-poster.jpg" alt="" fill sizes="100vw" className="object-cover" priority />
        <FilmPlate />
        <div className="absolute inset-0 bg-black/35" />
      </div>
    </div>
  );
}
