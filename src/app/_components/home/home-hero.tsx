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
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const currentSectionRef = React.useRef<HTMLElement | null>(null);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>(".panel");
      const wrapper = container.querySelector<HTMLElement>(".hero-wrapper");
      const indicators = gsap.utils.toArray<HTMLElement>(".indicator-dot");
      let currentSection = sections[0];
      currentSectionRef.current = currentSection;

      gsap.defaults({ overwrite: "auto" });

      // Set initial state - first panel visible, others hidden
      sections.forEach((section, i) => {
        if (i === 0) {
          gsap.set(section, { autoAlpha: 1, scale: 1, rotationY: 0, filter: "blur(0px)" });
        } else {
          gsap.set(section, { autoAlpha: 0, scale: 0.95, rotationY: 0, filter: "blur(0px)" });
        }
      });

      // Stretch container height for 3 sections + transition space
      gsap.set(container, { height: (sections.length + 0.5) * window.innerHeight });

      // Create ScrollTrigger for each section with fade/scale/rotate/blur effect
      sections.forEach((section, i) => {
        ScrollTrigger.create({
          start: () => (i - 0.5) * window.innerHeight,
          end: () => (i + 0.5) * window.innerHeight,
          onToggle: (self) => {
            if (self.isActive && section !== currentSection) {
              const currentIndex = sections.indexOf(currentSection);
              const rotationDirection = i > currentIndex ? -1.5 : 1.5;
              
              // Fade out current with rotation and blur
              gsap.to(currentSection, {
                autoAlpha: 0,
                scale: 0.95,
                rotationY: rotationDirection,
                filter: "blur(8px)",
                duration: 0.6,
                ease: "power2.inOut",
              });
              
              // Fade in new with counter-rotation and blur removal
              gsap.to(section, {
                autoAlpha: 1,
                scale: 1,
                rotationY: 0,
                filter: "blur(0px)",
                duration: 0.6,
                ease: "power2.inOut",
              });
              
              // Animate indicators with spring physics
              indicators.forEach((dot, dotIndex) => {
                if (dotIndex === i) {
                  gsap.to(dot, {
                    height: "3rem",
                    duration: 0.5,
                    ease: "elastic.out(1, 0.5)",
                  });
                } else {
                  gsap.to(dot, {
                    height: "0.25rem",
                    duration: 0.4,
                    ease: "power2.out",
                  });
                }
              });
              
              currentSection = section;
              currentSectionRef.current = section;
              setCurrentIndex(i);
            }
          },
        });
      });

      // Scroll up the entire hero wrapper after the last panel
      if (wrapper) {
        ScrollTrigger.create({
          start: () => (sections.length - 0.5) * window.innerHeight,
          end: () => (sections.length + 0.5) * window.innerHeight,
          scrub: 1,
          onUpdate: (self) => {
            gsap.to(wrapper, {
              yPercent: -100 * self.progress,
              scale: 1 - 0.1 * self.progress,
              autoAlpha: 1 - self.progress,
              duration: 0,
            });
          },
        });
      }
    }, container);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative -mt-28">
      {/* Fixed wrapper for all panels and UI - fades out after hero */}
      <div className="hero-wrapper fixed left-0 top-0 h-[100svh] w-full">
        {/* Vertical progress indicator */}
        <div className="fixed right-6 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-3 md:right-12">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`indicator-dot h-1 w-1 rounded-full ${
                currentIndex === i ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* Fixed headline overlay - always visible */}
        <div className="fixed bottom-4 left-4 z-50 max-w-[520px] pb-12 pl-12 text-white md:bottom-12 md:left-12 md:max-w-[760px]">
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

        {/* Panels - each positioned absolutely, fade/scale transitions */}
        {slides.map((src, i) => (
          <section
            key={src}
            className="panel absolute left-0 top-0 h-full w-full"
          >
            <div className="relative h-full w-full px-6 py-6 md:px-12 md:py-12">
              <div className="relative h-full w-full overflow-hidden rounded-[16px]">
                <Image
                  alt=""
                  src={src}
                  fill
                  sizes="100vw"
                  className="pointer-events-none object-cover"
                  priority={i === 0}
                />

                {/* Film grain overlay */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSczMDAnIGhlaWdodD0nMzAwJz48ZmlsdGVyIGlkPSdhJyB4PScwJyB5PScwJz48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Jy43NScgc3RpdGNoVGlsZXM9J3N0aXRjaCcgdHlwZT0nZnJhY3RhbE5vaXNlJy8+PGZlQ29sb3JNYXRyaXggdHlwZT0nc2F0dXJhdGUnIHZhbHVlcz0nMCcvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbHRlcj0ndXJsKCNhKScvPjwvc3ZnPg==')",
                    backgroundRepeat: "repeat",
                    animation: "grain 8s steps(10) infinite",
                  }}
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

                {/* Film matte bars */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-black/25" />
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-black/35" />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
