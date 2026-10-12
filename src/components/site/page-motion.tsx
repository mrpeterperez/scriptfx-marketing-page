"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function PageMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (!root.current) return;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".site-page-header > *", {
          y: 30, autoAlpha: 0, duration: 0.85, stagger: 0.09, ease: "power3.out",
        });
        gsap.utils.toArray<HTMLElement>("[data-visual-reveal], .site-card, .site-cta, .site-copy > section, .faq-list details").forEach(element => {
          gsap.from(element, {
            y: 42, autoAlpha: 0, duration: 0.85, ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 94%", once: true },
          });
        });
      });
      media.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-visual-media]").forEach(frame => {
          const art = frame.querySelector("[data-media-art]");
          if (!art) return;
          gsap.fromTo(art, { yPercent: -5, scale: 1.08 }, {
            yPercent: 5, scale: 1, ease: "none",
            scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: 0.6 },
          });
        });
      });
    }, root);
    return () => { media.revert(); context.revert(); };
  }, [pathname]);

  return <div ref={root}>{children}</div>;
}
