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

    // Initial states - start slightly faded and blurry (atmospheric, not meant to be read)
    gsap.set(screenplayContent, { autoAlpha: 0.6, scale: 1, filter: "blur(1.5px)" });
    gsap.set(topGradient, { autoAlpha: 0 });
    
    // Hide all lines initially
    linesRef.current.forEach((line) => {
      if (line) gsap.set(line, { autoAlpha: 0, y: 20 });
    });

    // Fade in top gradient early
    timeline.to(topGradient, { autoAlpha: 1, duration: 0.1 }, 0);

    // 1. Reveal lines one by one (already slightly blurred from container)
    linesRef.current.forEach((line, i) => {
      if (!line) return;
      
      timeline.to(line, {
        autoAlpha: 1,
        y: 0,
        duration: 0.4, 
        ease: "power2.out",
      }, i * 0.35); // Faster stagger since they're atmospheric
    });

    // Shorter pause - they're not meant to read it anyway
    timeline.to({}, { duration: 1.2 });

    // 2. Focus effect: Everything dims more, blur increases - "memory fading"
    timeline.to(screenplayContent, {
      autoAlpha: 0.35,
      filter: "blur(3px)",
      duration: 0.6,
      ease: "power2.inOut",
    });
    
    // Last line gets slight glow through the blur
    const lastLine = linesRef.current[linesRef.current.length - 1];
    if (lastLine) {
      timeline.to(lastLine, {
        textShadow: "0 0 30px rgba(255,255,255,0.6)",
        duration: 0.5,
        ease: "power2.out",
      }, "<");
    }

    // 3. Hold the atmospheric "FADE TO BLACK" 
    timeline.to({}, { duration: 2 });

    // 4. Dissolve completely - blur increases as it fades
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
