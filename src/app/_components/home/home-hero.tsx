"use client";

import * as React from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const slides = [
  "/placeholder/video-poster.png",
  "/placeholder/slide-2.png",
  "/placeholder/slide-3.png",
];

export function HomeHero() {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const panels = gsap.utils.toArray<HTMLElement>(".hero-panel");

    const ctx = gsap.context(() => {
      // Each panel pins and the next one folds/slides up over it
      panels.forEach((panel, i) => {
        // Pin each panel except the last
        if (i < panels.length - 1) {
          ScrollTrigger.create({
            trigger: panel,
            start: "top top",
            end: "bottom top",
            pin: true,
            pinSpacing: false,
            onEnter: () => setActiveIndex(i),
            onEnterBack: () => setActiveIndex(i),
          });
        } else {
          // Last panel just triggers the indicator
          ScrollTrigger.create({
            trigger: panel,
            start: "top 50%",
            onEnter: () => setActiveIndex(i),
            onEnterBack: () => setActiveIndex(i),
          });
        }

        // Fold/darken effect on pinned panels as next panel comes over
        if (i < panels.length - 1) {
          const inner = panel.querySelector(".panel-inner");
          if (inner) {
            gsap.to(inner, {
              scale: 0.92,
              opacity: 0.5,
              scrollTrigger: {
                trigger: panels[i + 1],
                start: "top bottom",
                end: "top top",
                scrub: true,
              },
            });
          }
        }
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative -mt-28 -mb-12">
      {/* Slide indicator */}
      <div className="fixed right-6 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-2 md:right-12">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              activeIndex === i ? "scale-125 bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Panels - stacked with increasing z-index so they fold over each other */}
      {slides.map((src, i) => (
        <section
          key={src}
          className="hero-panel relative h-[100svh] w-full"
          style={{ zIndex: i + 1 }}
        >
          <div className="panel-inner relative h-full w-full px-6 py-6 md:px-12 md:py-12 origin-center">
            <div className="relative h-full w-full overflow-hidden rounded-[16px] shadow-2xl">
              <Image
                alt=""
                src={src}
                fill
                sizes="100vw"
                className="pointer-events-none object-cover"
                priority={i === 0}
              />

              {/* Gradient overlay */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.25) 65.968%, rgba(0, 0, 0, 0.75) 79.979%, rgba(0, 0, 0, 0.8) 100%)",
                }}
              />

              {/* Film matte bars - top and bottom like 35mm */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-black" />
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-black" />

              {/* Headline on first slide only */}
              {i === 0 && (
                <div className="absolute bottom-14 left-4 z-20 max-w-[520px] text-white md:bottom-20 md:left-12 md:max-w-[760px]">
                  <h1 className="font-display text-[36px] font-medium leading-[34px] tracking-[-1.2px] not-italic md:text-[60px] md:leading-[46px] md:tracking-[-2.4px]">
                    <span className="mb-2 block md:mb-4">Write Your Screenplay.</span>
                    <span className="block">
                      Watch It Come{" "}
                      <span className="font-display italic font-medium">Alive.</span>
                    </span>
                  </h1>
                  <p className="mt-3 font-body text-[16px] leading-[22px] tracking-[-0.16px] text-white/90 md:mt-6 md:text-[18px] md:leading-[24px] md:tracking-[-0.18px]">
                    From screenplay to cinema — without leaving the page.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
