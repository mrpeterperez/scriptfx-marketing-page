"use client";

import * as React from "react";
import { gsap } from "gsap";

interface ActTwoTaglineProps {
  timeline: gsap.core.Timeline | null;
}

export function ActTwoTagline({ timeline }: ActTwoTaglineProps) {
  const taglineRef = React.useRef<HTMLDivElement>(null);
  const taglineLinesRef = React.useRef<(HTMLSpanElement | null)[]>([]);

  React.useLayoutEffect(() => {
    if (!timeline || !taglineRef.current) return;

    const tagline = taglineRef.current;

    // Initial states
    gsap.set(tagline, { autoAlpha: 1, scale: 1 });
    
    // Hide tagline lines initially
    taglineLinesRef.current.forEach((line) => {
      if (line) gsap.set(line, { autoAlpha: 0, y: 20, filter: "blur(10px)" });
    });

    // 4. Reveal Tagline Lines (Staggered Fade In)
    taglineLinesRef.current.forEach((line, i) => {
      if (!line) return;
      
      // i=0: Start slightly before script is fully gone
      // i>0: Start 0.5s after the previous line STARTS (so they cascade nicely)
      // Using ">-0.5" would mean start 0.5s before previous ENDS.
      // Let's use a relative offset from the previous start for consistent rhythm.
      
      const position = i === 0 ? "<+=0.5" : ">-=0.2"; 
      
      timeline.to(line, {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1,
        ease: "power2.out",
      }, position);
    });

    // Hold tagline for longer
    timeline.to({}, { duration: 2 });

    // Fade out tagline to transition to Act Three
    timeline.to(tagline, {
      autoAlpha: 0,
      scale: 0.95,
      filter: "blur(10px)",
      duration: 1,
      ease: "power2.inOut",
    });

  }, [timeline]);

  return (
    <div 
      ref={taglineRef}
      className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 md:p-8"
    >
      <h2 className="pointer-events-auto text-center font-display text-[48px] font-medium leading-[1.15] tracking-[-1.2px] text-on-surface md:text-[75px] md:tracking-[-2.4px]">
        <span ref={(el) => { taglineLinesRef.current[0] = el; }} className="block">Screenwriting</span>
        <span ref={(el) => { taglineLinesRef.current[1] = el; }} className="block">doesn't end on</span>
        <span ref={(el) => { taglineLinesRef.current[2] = el; }} className="block">
          the page <span className="italic">anymore.</span>
        </span>
      </h2>
    </div>
  );
}
