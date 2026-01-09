"use client";

import * as React from "react";
import { gsap } from "gsap";
import { screenplayLines, getLineClass } from "./screenplay-data";

interface ActOneScriptProps {
  timeline: gsap.core.Timeline | null;
}

export function ActOneScript({ timeline }: ActOneScriptProps) {
  const screenplayContentRef = React.useRef<HTMLDivElement>(null);
  const linesRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const topGradientRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (!timeline || !screenplayContentRef.current) return;

    const screenplayContent = screenplayContentRef.current;
    const topGradient = topGradientRef.current;

    // Initial states - dim text, no blur (atmospheric but clean)
    gsap.set(screenplayContent, { autoAlpha: 1, scale: 1 });
    gsap.set(topGradient, { autoAlpha: 0 });
    
    // Hide all lines initially - they'll reveal dim
    linesRef.current.forEach((line) => {
      if (line) gsap.set(line, { autoAlpha: 0, y: 20 });
    });

    // Fade in top gradient early
    timeline.to(topGradient, { autoAlpha: 1, duration: 0.1 }, 0);

    // 1. Reveal lines one by one - dim (55% opacity) with typewriter sound
    linesRef.current.forEach((line, i) => {
      if (!line) return;

      timeline.to(line, {
        autoAlpha: 0.55,
        y: 0,
        duration: 0.4, 
        ease: "power2.out",
      }, i * 0.35);
    });

    // Short pause
    timeline.to({}, { duration: 1.2 });

    // 2. Focus effect: Dim others more, FADE TO BLACK becomes solid white hero
    const lastLine = linesRef.current[linesRef.current.length - 1];
    
    // Dim all lines EXCEPT the last one
    linesRef.current.forEach((line, i) => {
      if (!line) return;
      const isLastLine = i === linesRef.current.length - 1;
      
      if (!isLastLine) {
        timeline.to(line, {
          autoAlpha: 0.2,
          duration: 0.6,
          ease: "power2.inOut",
        }, i === 0 ? undefined : "<");
      }
    });
    
    // FADE TO BLACK becomes SOLID WHITE with glow - the hero moment
    if (lastLine) {
      timeline.to(lastLine, {
        autoAlpha: 1,
        color: "#ffffff",
        textShadow: "0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.25)",
        duration: 0.6,
        ease: "power2.out",
      }, "<");
    }

    // 3. Hold the "FADE TO BLACK" hero moment
    timeline.to({}, { duration: 2 });

    // 4. Dissolve completely
    timeline.to(screenplayContent, {
      autoAlpha: 0,
      scale: 0.95,
      filter: "blur(12px)",
      duration: 1,
      ease: "power2.inOut",
    });

  }, [timeline]);

  return (
    <div
      className="absolute inset-0 flex items-start justify-center overflow-hidden p-6 pt-16 pb-24 md:items-end md:p-16 md:pb-48 md:pt-4"
    >
      {/* Top fade gradient */}
      <div
        ref={topGradientRef}
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-secondary-container via-secondary-container/80 to-transparent opacity-0"
      />

      <div
        ref={screenplayContentRef}
        className="w-full max-w-[680px] select-text font-mono text-[14px] leading-relaxed md:text-[19px]"
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
          </div>
        ))}
      </div>
    </div>
  );
}
