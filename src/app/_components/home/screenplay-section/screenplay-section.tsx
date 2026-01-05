"use client";

import * as React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

// Screenplay content - types in progressively on scroll
const screenplayLines = [
  {
    type: "action",
    text: "She stares at the screen. The cursor blinks. One word at a time, the scene builds itself—",
  },
  {
    type: "action",
    text: "A coffee shop materializes. Rain on windows. Two strangers reaching for the same book.",
  },
  { type: "action", text: "Elena watches, breathless, as her characters move. Speak. Live." },
  { type: "action", text: "For the first time, she isn't just writing a story." },
  { type: "action", text: "She's watching it happen." },
  { type: "character", text: "ELENA" },
  { type: "dialogue", text: "(whispers)" },
  { type: "dialogue", text: "It's real." },
  { type: "action", text: "She leans back. A single tear catches the light of the monitor." },
  { type: "action", text: "The cursor blinks once more—" },
  { type: "action", text: "—then types on its own:" },
  { type: "transition", text: "FADE OUT." },
];

export function ScreenplaySection() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const screenplayRef = React.useRef<HTMLDivElement>(null);
  const screenplayContentRef = React.useRef<HTMLDivElement>(null);
  const taglineRef = React.useRef<HTMLDivElement>(null);
  const linesRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const cursorRef = React.useRef<HTMLSpanElement>(null);
  const topGradientRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    const screenplay = screenplayRef.current;
    const screenplayContent = screenplayContentRef.current;
    const tagline = taglineRef.current;
    const cursor = cursorRef.current;
    const topGradient = topGradientRef.current;

    if (!container || !screenplay || !screenplayContent || !tagline || !topGradient) return;

    gsap.registerPlugin(ScrollTrigger, TextPlugin);

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // --- Initial states (fix: nothing shows until the section enters) ---
    gsap.set(container, { autoAlpha: 0 });
    gsap.set(tagline, { autoAlpha: 0, scale: 0.95 });
    gsap.set(topGradient, { autoAlpha: 0 });
    gsap.set(screenplayContent, { y: 0 });

    // ✅ All lines hidden initially
    linesRef.current.forEach((line) => {
      if (line) gsap.set(line, { autoAlpha: 0, y: 0 });
    });

    // Blinking cursor animation
    if (cursor) {
      gsap.to(cursor, {
        opacity: 0,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });
    }

    // Reduced motion: just show everything without scroll animation
    if (reduceMotion) {
      gsap.set(container, { autoAlpha: 1 });
      linesRef.current.forEach((line) => {
        if (line) gsap.set(line, { autoAlpha: 1, y: 0, opacity: 1 });
      });
      return;
    }

    const ctx = gsap.context(() => {
      const lines = linesRef.current.filter(Boolean) as HTMLDivElement[];
      const totalLines = lines.length;

      // Fade in container and reveal first 3 lines when it enters viewport
      ScrollTrigger.create({
        trigger: container,
        start: "top 80%",
        onEnter: () => {
          gsap.to(container, {
            autoAlpha: 1,
            duration: 0.6,
            ease: "power2.out",
          });
        },
      });

      // Main timeline controlled by scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 75%",
          end: "bottom bottom",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });

      // Fade in top gradient early (5% - 15%)
      tl.to(
        topGradient,
        {
          autoAlpha: 1,
          duration: 0.1,
          ease: "power2.out",
        },
        0.05
      );

      // Phase 1: Type in ALL lines sequentially based on scroll
      lines.forEach((line, i) => {
        const originalText = screenplayLines[i].text;
        
        // Set initial state for typing (visible but empty)
        gsap.set(line, { text: "", autoAlpha: 1, y: 0 });

        // Calculate timing based on index
        // We spread the typing over the first 50% of the scroll
        const totalTypingDuration = 0.5;
        const step = totalTypingDuration / totalLines;
        const startProgress = i * step;

        tl.to(
          line,
          {
            text: { value: originalText, delimiter: "" },
            duration: step * 0.9, // slightly faster than the step to leave a tiny gap
            ease: "none",
          },
          startProgress
        );
      });

      // Phase 3: Fade down all lines except last (55% - 70%)
      lines.forEach((line, i) => {
        const isLastLine = i === totalLines - 1;
        if (!isLastLine) {
          tl.to(
            line,
            {
              opacity: 0.2,
              duration: 0.15,
              ease: "power2.inOut",
            },
            0.55
          );
        }
      });

      // Make last line glow brighter
      const fadeOutLine = lines[totalLines - 1];
      if (fadeOutLine) {
        tl.to(
          fadeOutLine,
          {
            textShadow: "0 0 30px rgba(255,255,255,0.5)",
            duration: 0.15,
          },
          0.55
        );
      }

      // Phase 4: Fade out screenplay, fade in tagline (70% - 90%)
      tl.to(
        screenplay,
        {
          autoAlpha: 0,
          duration: 0.2,
          ease: "power2.inOut",
        },
        0.7
      );

      tl.to(
        tagline,
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.2,
          ease: "power2.out",
        },
        0.75
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative left-1/2 w-screen -translate-x-1/2 opacity-0"
      style={{ height: "250svh" }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-[100svh] w-full">
        <div className="relative h-full w-full px-6 py-6 md:px-12 md:py-12">
          <div className="relative h-full w-full overflow-hidden rounded-[16px] border border-border bg-secondary-container">
            {/* Screenplay page */}
            <div
              ref={screenplayRef}
              className="absolute inset-0 flex items-start justify-center overflow-hidden p-8 pt-24 md:p-16 md:pt-32"
            >
              {/* Top fade gradient - fades in on scroll */}
              <div
                ref={topGradientRef}
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-secondary-container via-secondary-container/80 to-transparent opacity-0"
              />

              <div
                ref={screenplayContentRef}
                className="w-full max-w-[680px] font-mono text-[18px] leading-loose md:text-[22px]"
              >
                {screenplayLines.map((line, i) => (
                  <div
                    key={i}
                    ref={(el) => {
                      linesRef.current[i] = el;
                    }}
                    className={`${getLineClass(line.type)} text-on-surface`}
                  >
                    {line.text}
                    {/* Blinking cursor on last line */}
                    {i === screenplayLines.length - 1 && (
                      <span
                        ref={cursorRef}
                        className="ml-1 inline-block h-[1.2em] w-[3px] translate-y-[0.15em] bg-on-surface"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tagline that fades in after screenplay */}
            <div ref={taglineRef} className="absolute inset-0 flex items-center justify-center p-8">
              <h2 className="text-center font-display text-[36px] font-medium leading-[1.1] tracking-[-1.2px] text-on-surface md:text-[64px] md:tracking-[-2.4px]">
                Screenwriting
                <br />
                doesn't end on
                <br />
                the page <span className="italic">anymore.</span>
              </h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Helper for screenplay formatting classes
function getLineClass(type: string): string {
  switch (type) {
    case "scene":
      return "mb-6 uppercase font-bold";
    case "action":
      return "mb-6";
    case "character":
      return "mt-4 mb-1 text-center uppercase";
    case "dialogue":
      return "mx-auto mb-4 max-w-[380px] text-center";
    case "transition":
      return "mt-8 text-right uppercase font-bold";
    default:
      return "";
  }
}
