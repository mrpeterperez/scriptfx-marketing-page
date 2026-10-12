"use client";

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
    const overflow = document.body.style.overflow;
    let cancelled = false;
    let ctx: gsap.Context | undefined;
    const finish = () => {
      gsap.set(container, { autoAlpha: 0 });
      gsap.set(headline, { autoAlpha: 1, x: 0, y: 0, scale: 1 });
      gsap.set(reveal, { autoAlpha: 1, y: 0 });
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
        document.body.style.overflow = "hidden";
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
        const tl = gsap.timeline({ onComplete: finish, defaults: { force3D: false } });
        tl.fromTo(headline.children, { autoAlpha: 0 }, { autoAlpha: 1, duration: .7, stagger: .18, ease: "power2.out" }, .25);
        tl.to(image, { scale: 1, duration: 2.5, ease: "power2.out" }, 0);
        tl.to(headline, { x: 0, y: 0, scale: 1, duration: 1.6, ease: "power3.inOut" }, 1.45);
        tl.to(image, { autoAlpha: 0, duration: .6, ease: "power2.inOut" }, 2.45);
        tl.set(container, { autoAlpha: 0 }, 3.05);
        tl.to(reveal, { autoAlpha: 1, y: 0, duration: .5, stagger: .1, ease: "power2.out" }, 2.9);
      }, container);
    };
    const width = window.innerWidth;
    const height = window.innerHeight;
    const resize = () => {
      if (Math.abs(window.innerWidth - width) < 20 && Math.abs(window.innerHeight - height) < 20) return;
      cancelled = true;
      ctx?.revert();
      finish();
    };
    window.addEventListener("resize", resize);
    void document.fonts.ready.then(start);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", resize);
      ctx?.revert();
      document.body.style.overflow = overflow;
    };
  }, []);

  return (
    <div ref={containerRef} className="intro-reveal pointer-events-none fixed inset-0 z-[40]" aria-hidden="true">
      <div ref={imageRef} className="absolute inset-0">
        <Image src="/video/mountain-scene-poster.jpg" alt="" fill sizes="100vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-black/35" />
      </div>
    </div>
  );
}
