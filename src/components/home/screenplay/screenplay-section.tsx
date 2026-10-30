"use client";

import * as React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScreenplayDocument } from "./screenplay-document";
import { ActFiveReveal } from "./act-five-reveal";
import { LandingOverview } from "@/components/home/landing-overview";

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ScreenplaySection({ children }: { children?: React.ReactNode }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const grayBoxRef = React.useRef<HTMLDivElement>(null);
  const paddingContainerRef = React.useRef<HTMLDivElement>(null);
  const [documentReady, setDocumentReady] = React.useState(false);
  const [timeline, setTimeline] = React.useState<gsap.core.Timeline | null>(null);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: () => `top top+=${parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--masthead-height"))}`,
          // Finish the animation ~1 viewport before the section ends,
          // leaving a "hold" where the final scene can breathe.
          end: () => `bottom-=${window.innerHeight}px bottom`,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      setTimeline(tl);
    }, container);

    return () => ctx.revert();
  }, []);

  React.useLayoutEffect(() => {
    if (!documentReady || !timeline) return;
    timeline.pause();
    timeline.scrollTrigger?.refresh();
    timeline.scrollTrigger?.update();
  }, [documentReady, timeline]);

  return (
    <>
      <section
        ref={containerRef}
        className="cinematic-screenplay relative z-10 bg-transparent opacity-100"
        style={{ 
          height: "580svh",
          width: "100vw", 
          marginLeft: "calc(50% - 50vw)" 
        }}
      >
        {/* Sticky container */}
        <div className="screenplay-stage sticky w-full">
          <div 
            ref={paddingContainerRef}
            className="relative h-full w-full"
          >
            <div 
              ref={grayBoxRef}
              className="screenplay-canvas relative h-full w-full overflow-hidden"
            >
              
              <ScreenplayDocument timeline={timeline} onReady={setDocumentReady} />
              {timeline && documentReady ? <ActFiveReveal timeline={timeline} /> : null}

            </div>
          </div>
        </div>
      </section>

      {children ?? <LandingOverview />}
    </>
  );
}
