"use client";

import * as React from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { yourWayFrames } from "./your-way-data";

gsap.registerPlugin(ScrollTrigger);

export function YourWaySection() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);

  // Title refs
  const titleWrapperRef = React.useRef<HTMLDivElement>(null);
  const titlePart1Ref = React.useRef<HTMLSpanElement>(null);
  const titlePart2Ref = React.useRef<HTMLSpanElement>(null);

  // Columns refs
  const columnsRef = React.useRef<HTMLDivElement>(null);
  const columnRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    const card = cardRef.current;
    const titleWrapper = titleWrapperRef.current;
    const columns = columnsRef.current;

    if (!container || !card || !titleWrapper || !columns) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // Initial states
      // Title starts centered vertically (yPercent: 0 means it's at its natural flex-centered position)
      gsap.set(titleWrapper, { yPercent: 0 });
      if (titlePart1Ref.current) gsap.set(titlePart1Ref.current, { autoAlpha: 0, y: 40, filter: "blur(12px)" });
      if (titlePart2Ref.current) gsap.set(titlePart2Ref.current, { autoAlpha: 0, y: 40, filter: "blur(12px)" });

      // Columns hidden
      gsap.set(columns, { autoAlpha: 0 });
      columnRefs.current.forEach((col) => {
        if (col) gsap.set(col, { autoAlpha: 0, y: 80, filter: "blur(12px)", scale: 0.9 });
      });

      // Phases - each card gets its moment with generous scroll time:
      // 0-2: "One Script." fades in
      // 2-4: "Any Setup." fades in  
      // 4-8: HOLD - title centered, big moment
      // 8-10: Title shifts up, columns container appears
      // 10-14: Card 1 fades in (laptop)
      // 14-18: HOLD - laptop's moment
      // 18-22: Card 2 fades in (gear)
      // 22-26: HOLD - gear's moment
      // 26-30: Card 3 fades in (crew)
      // 30-34: HOLD - all cards together
      const totalPhases = 34;

      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${totalPhases * 50}vh`,
        pin: true,
        scrub: reduceMotion ? 0 : 1.2,
        onUpdate: (self) => {
          const progress = self.progress;
          const phase = progress * totalPhases;

          // Helper to get card visibility based on phase
          const getCardState = (cardIndex: number) => {
            // Card 0: starts appearing at phase 10, fully in by 14
            // Card 1: starts appearing at phase 18, fully in by 22
            // Card 2: starts appearing at phase 26, fully in by 30
            const startPhase = 10 + cardIndex * 8;
            const fadeInDuration = 4;
            if (phase < startPhase) {
              return { opacity: 0, y: 80, blur: 12, scale: 0.9 };
            } else if (phase < startPhase + fadeInDuration) {
              const p = (phase - startPhase) / fadeInDuration;
              // Ease out cubic for smoother entrance
              const eased = 1 - Math.pow(1 - p, 3);
              return { 
                opacity: eased, 
                y: 80 * (1 - eased), 
                blur: 12 * (1 - eased),
                scale: 0.9 + 0.1 * eased
              };
            } else {
              return { opacity: 1, y: 0, blur: 0, scale: 1 };
            }
          };

          // ===== PHASE 0-2: "One Script." fades in =====
          if (phase < 2) {
            const p = phase / 2;

            gsap.set(titleWrapper, { yPercent: 0 });
            gsap.set(columns, { autoAlpha: 0 });

            if (titlePart1Ref.current) {
              const fade = Math.min(p * 2, 1);
              gsap.set(titlePart1Ref.current, {
                autoAlpha: fade,
                y: 40 * (1 - fade),
                filter: `blur(${12 * (1 - fade)}px)`,
              });
            }
            if (titlePart2Ref.current) {
              gsap.set(titlePart2Ref.current, { autoAlpha: 0, y: 40, filter: "blur(12px)" });
            }

            columnRefs.current.forEach((col) => {
              if (col) gsap.set(col, { autoAlpha: 0, y: 80, filter: "blur(12px)", scale: 0.9 });
            });
          }
          // ===== PHASE 2-4: "Any Setup." fades in =====
          else if (phase < 4) {
            const p = (phase - 2) / 2;

            gsap.set(titleWrapper, { yPercent: 0 });
            gsap.set(columns, { autoAlpha: 0 });

            if (titlePart1Ref.current) {
              gsap.set(titlePart1Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            }
            if (titlePart2Ref.current) {
              const fade = Math.min(p * 2, 1);
              gsap.set(titlePart2Ref.current, {
                autoAlpha: fade,
                y: 40 * (1 - fade),
                filter: `blur(${12 * (1 - fade)}px)`,
              });
            }

            columnRefs.current.forEach((col) => {
              if (col) gsap.set(col, { autoAlpha: 0, y: 80, filter: "blur(12px)", scale: 0.9 });
            });
          }
          // ===== PHASE 4-8: HOLD - title centered, big moment =====
          else if (phase < 8) {
            gsap.set(titleWrapper, { yPercent: 0 });
            gsap.set(columns, { autoAlpha: 0 });

            if (titlePart1Ref.current) gsap.set(titlePart1Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (titlePart2Ref.current) gsap.set(titlePart2Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });

            columnRefs.current.forEach((col) => {
              if (col) gsap.set(col, { autoAlpha: 0, y: 80, filter: "blur(12px)", scale: 0.9 });
            });
          }
          // ===== PHASE 8-10: Title shifts up =====
          else if (phase < 10) {
            const p = (phase - 8) / 2;

            gsap.set(titleWrapper, { yPercent: -80 * p });

            if (titlePart1Ref.current) gsap.set(titlePart1Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (titlePart2Ref.current) gsap.set(titlePart2Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });

            gsap.set(columns, { autoAlpha: p });
            columnRefs.current.forEach((col) => {
              if (col) gsap.set(col, { autoAlpha: 0, y: 80, filter: "blur(12px)", scale: 0.9 });
            });
          }
          // ===== PHASES 10+: Cards appear one by one with holds =====
          else {
            gsap.set(titleWrapper, { yPercent: -80 });
            gsap.set(columns, { autoAlpha: 1 });

            if (titlePart1Ref.current) gsap.set(titlePart1Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (titlePart2Ref.current) gsap.set(titlePart2Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });

            // Each card gets its moment
            columnRefs.current.forEach((col, i) => {
              if (!col) return;
              const state = getCardState(i);
              gsap.set(col, {
                autoAlpha: state.opacity,
                y: state.y,
                filter: `blur(${state.blur}px)`,
                scale: state.scale,
              });
            });
          }
        },
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative z-[85] w-full"
      style={{
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
      }}
    >
      <div className="relative h-screen w-full overflow-hidden px-6 py-6 md:px-12 md:py-12">
        <div
          ref={cardRef}
          className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[16px] border border-border bg-surface"
        >
          {/* Title - starts centered, shifts up */}
          <div
            ref={titleWrapperRef}
            className="absolute inset-0 flex items-center justify-center transform-gpu will-change-transform"
          >
            <h2 className="text-center font-display text-5xl font-medium leading-[1.1] tracking-tighter text-on-surface md:text-6xl lg:text-7xl">
              <span ref={titlePart1Ref} className="block transform-gpu will-change-transform">
                One Script.
              </span>
              <span ref={titlePart2Ref} className="block transform-gpu will-change-transform">
                Any <span className="italic">Setup.</span>
              </span>
            </h2>
          </div>

          {/* Three columns - appear below title */}
          <div
            ref={columnsRef}
            className="absolute inset-x-0 bottom-0 top-1/3 flex items-center justify-center px-8 md:px-16 lg:px-24"
          >
            <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              {yourWayFrames.map((frame, i) => (
                <div
                  key={frame.id}
                  ref={(el) => { columnRefs.current[i] = el; }}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border/50 bg-surface-container transform-gpu will-change-transform"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={frame.image}
                      alt={frame.headline}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  {/* Text */}
                  <div className="p-5 md:p-6">
                    <h3 className="font-display text-2xl font-medium tracking-tight text-on-surface md:text-3xl">
                      {frame.headline}
                    </h3>
                    <p className="mt-1 font-body text-sm font-light text-on-surface-variant md:text-base">
                      {frame.subtext}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
