"use client";

import * as React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { YourWayStack } from "./your-way-stack";

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
      // Initial states - title visible in center, columns hidden (height: 0 so they don't take space)
      if (titlePart1Ref.current) gsap.set(titlePart1Ref.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      if (titlePart2Ref.current) gsap.set(titlePart2Ref.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });

      // Columns hidden - use height: 0, autoAlpha: 0, overflow hidden to not take space initially
      gsap.set(columns, { autoAlpha: 0, height: 0, marginTop: 0, overflow: "hidden" });
      columnRefs.current.forEach((col) => {
        if (col) gsap.set(col, { autoAlpha: 0, y: 50, filter: "blur(8px)" });
      });

      // Phases:
      // 0-2: "One Script." fades in (centered)
      // 2-4: "Any Setup." fades in (centered)
      // 4-10: HOLD - title stays centered, big moment
      // 10-14: Columns container expands, cards fade in with stagger
      // 14-18: HOLD - final state, all visible
      const totalPhases = 18;

      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${totalPhases * 50}vh`,
        pin: true,
        scrub: reduceMotion ? 0 : 1.2,
        onUpdate: (self) => {
          const progress = self.progress;
          const phase = progress * totalPhases;

          // ===== PHASE 0-2: "One Script." fades in =====
          if (phase < 2) {
            const p = phase / 2;

            gsap.set(columns, { autoAlpha: 0, height: 0, marginTop: 0 });

            if (titlePart1Ref.current) {
              const fade = Math.min(p * 2, 1);
              gsap.set(titlePart1Ref.current, {
                autoAlpha: fade,
                y: 30 * (1 - fade),
                filter: `blur(${12 * (1 - fade)}px)`,
              });
            }
            if (titlePart2Ref.current) {
              gsap.set(titlePart2Ref.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
            }

            columnRefs.current.forEach((col) => {
              if (col) gsap.set(col, { autoAlpha: 0, y: 50, filter: "blur(8px)" });
            });
          }
          // ===== PHASE 2-4: "Any Setup." fades in =====
          else if (phase < 4) {
            const p = (phase - 2) / 2;

            gsap.set(columns, { autoAlpha: 0, height: 0, marginTop: 0 });

            if (titlePart1Ref.current) {
              gsap.set(titlePart1Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            }
            if (titlePart2Ref.current) {
              const fade = Math.min(p * 2, 1);
              gsap.set(titlePart2Ref.current, {
                autoAlpha: fade,
                y: 30 * (1 - fade),
                filter: `blur(${12 * (1 - fade)}px)`,
              });
            }

            columnRefs.current.forEach((col) => {
              if (col) gsap.set(col, { autoAlpha: 0, y: 50, filter: "blur(8px)" });
            });
          }
          // ===== PHASE 4-10: HOLD - title centered in the middle, big moment =====
          else if (phase < 10) {
            gsap.set(columns, { autoAlpha: 0, height: 0, marginTop: 0 });

            if (titlePart1Ref.current) gsap.set(titlePart1Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (titlePart2Ref.current) gsap.set(titlePart2Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });

            columnRefs.current.forEach((col) => {
              if (col) gsap.set(col, { autoAlpha: 0, y: 50, filter: "blur(8px)" });
            });
          }
          // ===== PHASE 10-14: Columns appear, pushing title up =====
          else if (phase < 14) {
            const p = (phase - 10) / 4;
            // Ease out cubic for smoother motion
            const eased = 1 - Math.pow(1 - p, 3);

            if (titlePart1Ref.current) gsap.set(titlePart1Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (titlePart2Ref.current) gsap.set(titlePart2Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });

            // Columns container expands to auto height
            gsap.set(columns, { 
              autoAlpha: eased, 
              height: "auto",
              marginTop: 48 * eased,
              overflow: "visible"
            });

            // Cards fade in with stagger
            columnRefs.current.forEach((col, i) => {
              if (!col) return;
              const delay = i * 0.1;
              const colProgress = Math.max(0, Math.min((p - delay) * 4, 1));
              gsap.set(col, {
                autoAlpha: colProgress,
                y: 50 * (1 - colProgress),
                filter: `blur(${8 * (1 - colProgress)}px)`,
              });
            });
          }
          // ===== PHASE 14+: HOLD - final state =====
          else {
            gsap.set(columns, { autoAlpha: 1, height: "auto", marginTop: 48, overflow: "visible" });

            if (titlePart1Ref.current) gsap.set(titlePart1Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (titlePart2Ref.current) gsap.set(titlePart2Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });

            columnRefs.current.forEach((col) => {
              if (col) gsap.set(col, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
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
          {/* Content wrapper - flexbox column for proper vertical stacking */}
          <div className="flex flex-col items-center justify-center w-full h-full px-8 md:px-16 lg:px-24">
            {/* Title - centered, will shift up when columns appear */}
            <div
              ref={titleWrapperRef}
              className="flex items-center justify-center transform-gpu will-change-transform"
            >
              <h2 className="flex flex-col items-center text-center font-display text-5xl font-medium leading-[1.15] tracking-tighter text-on-surface md:text-6xl">
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
              className="w-full max-w-5xl"
            >
              <YourWayStack registerCard={(i, el) => { columnRefs.current[i] = el; }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
