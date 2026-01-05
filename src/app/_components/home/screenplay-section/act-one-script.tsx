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

    // Initial states
    gsap.set(screenplayContent, { autoAlpha: 1, scale: 1 });
    gsap.set(topGradient, { autoAlpha: 0 });
    
    // Hide all lines initially
    linesRef.current.forEach((line) => {
      if (line) gsap.set(line, { autoAlpha: 0, filter: "blur(8px)", y: 20 });
    });

    // Fade in top gradient early
    timeline.to(topGradient, { autoAlpha: 1, duration: 0.1 }, 0);

    // 1. Reveal lines one by one (Fade + Blur In)
    linesRef.current.forEach((line, i) => {
      if (!line) return;
      
      timeline.to(line, {
        autoAlpha: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 0.5, 
        ease: "power2.out",
      }, i * 0.5); 
    });

    // Add a pause to ensure readability of the full script
    timeline.to({}, { duration: 2 });

    // 2. Focus effect: Fade out previous lines, Glow the last line
    linesRef.current.forEach((line, i) => {
      if (!line) return;
      const isLastLine = i === linesRef.current.length - 1;
      
      // Sync all animations to start together
      const position = i === 0 ? undefined : "<";

      if (isLastLine) {
        // Glow effect for the last line
        timeline.to(line, {
          textShadow: "0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)",
          duration: 0.5,
          ease: "power2.out",
        }, position); 
      } else {
        // Dim others
        timeline.to(line, {
          opacity: 0.2,
          filter: "blur(1px)",
          duration: 0.5,
          ease: "power2.inOut",
        }, position);
      }
    });

    // 3. Hold the "FADE TO BLACK" glow for longer
    timeline.to({}, { duration: 3 });

    // 3. Dissolve the Script Content
    timeline.to(screenplayContent, {
      autoAlpha: 0,
      scale: 0.95,
      filter: "blur(10px)",
      duration: 1,
      ease: "power2.inOut",
    });

  }, [timeline]);

  return (
    <div
      className="absolute inset-0 flex items-end justify-center overflow-hidden pt-4 p-8 md:p-16 pb-32 md:pb-48"
    >
      {/* Top fade gradient */}
      <div
        ref={topGradientRef}
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-secondary-container via-secondary-container/80 to-transparent opacity-0"
      />

      <div
        ref={screenplayContentRef}
        className="w-full max-w-[680px] select-text font-mono text-[16px] leading-relaxed md:text-[19px]"
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
