"use client";

import * as React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ActOneScript } from "./act-one-script";
import { ActTwoTagline } from "./act-two-tagline";
import { ActThreeVoid } from "./act-three-void";
import { ActFiveReveal } from "./act-five-reveal";
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
      const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top center",
          // Finish the animation ~1 viewport before the section ends,
          // leaving a "hold" where the final scene can breathe.
          end: () => `bottom-=${window.innerHeight}px bottom`,
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
        className="relative z-10 bg-transparent opacity-100"
        style={{ 
          // Add extra hold so the following features section can overlap by 100svh
          // without shortening the overall scroll.
          height: "550svh",
          width: "100vw", 
          marginLeft: "calc(50% - 50vw)" 
        }}
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
              {timeline ? <ActFiveReveal timeline={timeline} /> : null}

            </div>
          </div>
        </div>
      </section>

      {/* Act 6: Features Section */}
      <ActFourSolution />

      <section
        data-scriptfx-after-features="true"
        className="relative z-[90] flex h-[100svh] w-screen items-center justify-center bg-transparent"
        style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
      >
        <div className="font-display text-[64px] font-medium tracking-[-2.4px] text-on-surface">
          TEST
        </div>
      </section>
    </>
  );
}


