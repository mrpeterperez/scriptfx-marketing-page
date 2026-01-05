"use client";

import * as React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ActOneScript } from "./act-one-script";
import { ActTwoTagline } from "./act-two-tagline";
import { ActThreeVoid } from "./act-three-void";
import { ActFourSolution } from "./act-four-solution";

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ScreenplaySectionV2() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const grayBoxRef = React.useRef<HTMLDivElement>(null);
  const paddingContainerRef = React.useRef<HTMLDivElement>(null);
  const [timeline, setTimeline] = React.useState<gsap.core.Timeline | null>(null);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top center",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });
      
      setTimeline(tl);
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        ref={containerRef}
        className="relative left-1/2 w-screen -translate-x-1/2 bg-black opacity-100"
        style={{ height: "500svh" }}
      >
        {/* Sticky container */}
        <div className="sticky top-0 h-[100svh] w-full">
          <div 
            ref={paddingContainerRef}
            className="relative h-full w-full px-6 py-6 md:px-12 md:py-12"
          >
            <div 
              ref={grayBoxRef}
              className="relative h-full w-full overflow-hidden rounded-[16px] border border-border bg-secondary-container"
            >
              
              <ActOneScript timeline={timeline} />
              <ActTwoTagline timeline={timeline} />
              <ActThreeVoid timeline={timeline} grayBoxRef={grayBoxRef} paddingContainerRef={paddingContainerRef} />

            </div>
          </div>
        </div>
      </section>
      
      {/* Meet ScriptFX + Features Section - comes after screenplay */}
      <ActFourSolution />
    </>
  );
}


