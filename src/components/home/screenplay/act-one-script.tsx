"use client";

import * as React from "react";
import { gsap } from "gsap";

const blocks = [
  [36], [100, 72], [94, 58], [100, 84], [88, 62], [76],
  [100, 78], [100, 64], [94, 48], [86], [58], [24], [34], [42], [100, 56], [68], [52],
];

export function ActOneScript({ timeline }: { timeline: gsap.core.Timeline | null }) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const endingRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (!timeline || !contentRef.current) return;
    const ctx = gsap.context(() => {
      const bars = contentRef.current!.querySelectorAll(".screenplay-skeleton-line");
      gsap.set(bars, { scaleX: 0, transformOrigin: "left center" });
      const letters = endingRef.current!.querySelectorAll(".screenplay-typewriter-letter");
      const cursor = endingRef.current!.querySelector(".screenplay-typewriter-cursor");
      gsap.set(letters, { visibility: "hidden" });
      gsap.set(cursor, { autoAlpha: 0 });
      timeline.to(bars, { scaleX: 1, duration: 0.45, stagger: 0.08, ease: "power2.out" });
      timeline.to({}, { duration: 0.7 });
      timeline.set(cursor, { autoAlpha: 1 });
      timeline.to(letters, { visibility: "visible", duration: 0.01, stagger: 0.055, ease: "none" });
      timeline.addLabel("endingReadable");
      timeline.to({}, { duration: 2.2 });
      timeline.set(cursor, { autoAlpha: 0 });
      timeline.to({}, { duration: 0.25 });
    }, contentRef);
    return () => ctx.revert();
  }, [timeline]);

  return <div className="screenplay-skeleton-frame absolute inset-0 flex items-center justify-center">
    <div ref={contentRef} className="screenplay-skeleton" aria-label="Animated screenplay preview">
      <div aria-hidden="true">
        {blocks.map((widths, index) => <div key={index} className={`screenplay-skeleton-block ${index >= 11 && index <= 13 ? "screenplay-skeleton-dialogue" : ""}`}>
          {widths.map((width, line) => <div key={line} className="screenplay-skeleton-line" style={{ width: `${width}%` }} />)}
        </div>)}
      </div>
      <div ref={endingRef} className="screenplay-skeleton-ending" aria-label="FADE TO BLACK.">
        {"FADE TO BLACK.".split("").map((letter, index) => <span key={index} className="screenplay-typewriter-letter" aria-hidden="true">{letter}</span>)}
        <span className="screenplay-typewriter-cursor" aria-hidden="true" />
      </div>
    </div>
  </div>;
}
