"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** What rises into view as the page scrolls: every header's lines, every card, and anything marked data-reveal. Pinned tool steps animate themselves. */
const TARGETS = "header > *, .catalog-section-heading > *, article:not(.tools-story article), [data-reveal]";

/**
 * Reveals a page's content as it scrolls in: each element rises into place
 * once, and siblings that sit on one row follow each other. Honors reduced
 * motion, and leaves no styles behind once an element has arrived.
 */
export function ScrollReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const scope = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const root = scope.current;
      if (!root) return;
      const byParent = new Map<Element, HTMLElement[]>();
      for (const node of root.querySelectorAll<HTMLElement>(TARGETS)) {
        if (!node.parentElement || node.closest("[data-reveal-skip]")) continue;
        byParent.set(node.parentElement, [...(byParent.get(node.parentElement) ?? []), node]);
      }
      for (const items of byParent.values()) {
        const top = items[0].offsetTop;
        items.forEach((item, index) => gsap.from(item, {
          y: 22, opacity: 0, duration: .7, ease: "power2.out",
          // Cards on the same row arrive one after another; a column arrives card by card as each scrolls in.
          delay: Math.abs(item.offsetTop - top) < 12 ? index * .08 : 0,
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: item, start: "top 90%", once: true },
        }));
      }
      // Images and fonts settle after mount; measure again so triggers sit where the content really is.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      return () => window.removeEventListener("load", refresh);
    }, scope);
    return () => media.revert();
  }, []);
  return <div ref={scope} className={className}>{children}</div>;
}
