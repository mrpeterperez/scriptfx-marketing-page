"use client";

import * as React from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { yourWayFrames } from "./your-way-data";

gsap.registerPlugin(ScrollTrigger);

export function YourWaySection() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  
  // Intro headline refs
  const introRef = React.useRef<HTMLDivElement>(null);
  const introPart1Ref = React.useRef<HTMLSpanElement>(null);
  const introPart2Ref = React.useRef<HTMLSpanElement>(null);
  
  // Horizontal scroll refs
  const horizontalRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    const intro = introRef.current;
    const horizontal = horizontalRef.current;
    const track = trackRef.current;
    
    if (!container || !wrapper || !intro || !horizontal || !track) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // Initial states
      if (introPart1Ref.current) gsap.set(introPart1Ref.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      if (introPart2Ref.current) gsap.set(introPart2Ref.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      gsap.set(horizontal, { autoAlpha: 0 });
      
      cardRefs.current.forEach((card, i) => {
        if (card) gsap.set(card, { autoAlpha: i === 0 ? 1 : 0.3, scale: i === 0 ? 1 : 0.95 });
      });
      
      textRefs.current.forEach((text, i) => {
        if (text) gsap.set(text, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 20 });
      });

      // Total phases: 2 intro + 3 cards + 0.5 hold = 5.5
      const totalPhases = 5.5;
      
      // Calculate horizontal scroll distance
      const cardWidth = window.innerWidth * 0.7; // 70vw per card
      const gap = 24; // gap between cards
      const totalScrollWidth = (cardWidth + gap) * (yourWayFrames.length - 1);

      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${totalPhases * 100}vh`,
        pin: true,
        scrub: reduceMotion ? 0 : 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const phase = progress * totalPhases;

          // ===== PHASE 1: Intro headline reveal (0-2) =====
          if (phase < 2) {
            const localProgress = phase / 2;
            
            // Show intro, hide horizontal
            gsap.set(intro, { autoAlpha: 1 });
            gsap.set(horizontal, { autoAlpha: 0 });
            
            // Staggered text reveals
            if (introPart1Ref.current) {
              const p = Math.max(0, Math.min(localProgress * 3, 1));
              gsap.set(introPart1Ref.current, { autoAlpha: p, y: 30 * (1 - p), filter: `blur(${12 * (1 - p)}px)` });
            }
            if (introPart2Ref.current) {
              const p = Math.max(0, Math.min((localProgress - 0.25) * 3, 1));
              gsap.set(introPart2Ref.current, { autoAlpha: p, y: 30 * (1 - p), filter: `blur(${12 * (1 - p)}px)` });
            }
          }
          // ===== PHASE 2: Transition + Horizontal scroll (2-5.5) =====
          else {
            const localProgress = (phase - 2) / 3.5;
            
            // Fade out intro, fade in horizontal
            const transitionProgress = Math.min(localProgress * 4, 1);
            gsap.set(intro, { autoAlpha: 1 - transitionProgress });
            gsap.set(horizontal, { autoAlpha: transitionProgress });
            
            // Horizontal scroll - move track
            if (track) {
              const scrollProgress = Math.max(0, Math.min((localProgress - 0.1) / 0.85, 1));
              const xOffset = -scrollProgress * totalScrollWidth;
              gsap.set(track, { x: xOffset });
            }
            
            // Determine which card is active based on scroll position
            const cardProgress = Math.max(0, Math.min((localProgress - 0.1) / 0.85, 1));
            const activeIndex = Math.min(
              Math.floor(cardProgress * yourWayFrames.length),
              yourWayFrames.length - 1
            );
            
            // Update cards
            cardRefs.current.forEach((card, i) => {
              if (!card) return;
              const isActive = i === activeIndex;
              gsap.set(card, {
                autoAlpha: isActive ? 1 : 0.4,
                scale: isActive ? 1 : 0.95,
              });
            });
            
            // Update text
            textRefs.current.forEach((text, i) => {
              if (!text) return;
              const isActive = i === activeIndex;
              gsap.set(text, {
                autoAlpha: isActive ? 1 : 0,
                y: isActive ? 0 : 20,
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
      <div
        ref={wrapperRef}
        className="relative h-screen w-full px-6 py-6 md:px-12 md:py-12"
      >
        <div className="relative h-full w-full overflow-hidden rounded-[16px] border border-border bg-surface">
          
          {/* ===== INTRO HEADLINE ===== */}
          <div
            ref={introRef}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <div className="max-w-4xl text-center px-6 md:px-8">
              <h2 className="text-center font-display text-5xl font-medium leading-[1.15] tracking-tighter text-on-surface md:text-6xl">
                <span ref={introPart1Ref} className="block">One Script.</span>
                <span ref={introPart2Ref} className="block">Any <span className="italic">Setup.</span></span>
              </h2>
            </div>
          </div>

          {/* ===== HORIZONTAL SCROLL AREA ===== */}
          <div
            ref={horizontalRef}
            className="absolute inset-0 z-20 flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 px-6 pt-6 md:px-12 md:pt-12">
              <p className="font-body text-[11px] uppercase tracking-[0.2em] text-on-surface-variant md:text-[12px]">
                One Script. Any Setup.
              </p>
            </div>
            
            {/* Cards container */}
            <div className="flex-1 flex items-center overflow-hidden">
              <div
                ref={trackRef}
                className="flex gap-6 pl-6 md:pl-12 transform-gpu will-change-transform"
                style={{ paddingRight: "30vw" }}
              >
                {yourWayFrames.map((frame, i) => (
                  <div
                    key={frame.id}
                    ref={(el) => { cardRefs.current[i] = el; }}
                    className="relative flex-shrink-0 w-[70vw] h-[60vh] rounded-2xl overflow-hidden transform-gpu will-change-transform"
                  >
                    <Image
                      src={frame.image}
                      alt={frame.headline}
                      fill
                      className="object-cover"
                      priority={i === 0}
                    />
                    {/* Gradient scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Text overlay */}
                    <div
                      ref={(el) => { textRefs.current[i] = el; }}
                      className="absolute bottom-6 left-6 z-10 md:bottom-10 md:left-10 transform-gpu will-change-transform"
                    >
                      <h3 className="font-display text-4xl font-medium leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl">
                        {frame.headline}
                      </h3>
                      <p className="mt-2 font-body text-lg font-light text-white/80 md:mt-3 md:text-xl">
                        {frame.subtext}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Frame indicator - bottom */}
            <div className="flex-shrink-0 px-6 pb-6 md:px-12 md:pb-12">
              <div className="flex gap-2">
                {yourWayFrames.map((frame, i) => (
                  <div
                    key={`dot-${frame.id}`}
                    className="h-1 w-8 rounded-full bg-on-surface-variant/30 transition-all duration-300"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
