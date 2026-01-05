"use client";

import * as React from "react";
import { gsap } from "gsap";
import { sounds } from "@/lib/sounds";

interface ActFourSolutionProps {
  timeline: gsap.core.Timeline | null;
}

export function ActFourSolution({ timeline }: ActFourSolutionProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const textRef = React.useRef<HTMLDivElement>(null);
  const pathRef = React.useRef<SVGPathElement>(null);

  // Wave animation config
  const numPoints = 10;
  const delayPointsMax = 0.3;

  // Target text
  const targetText = "Bring your script to life";

  React.useLayoutEffect(() => {
    if (!timeline || !containerRef.current || !svgRef.current || !pathRef.current) return;

    const container = containerRef.current;
    const path = pathRef.current;
    const textEl = textRef.current;

    if (!textEl) return;

    // Get all target character spans
    const allTargetChars = Array.from(
      textEl.querySelectorAll(".solution-char")
    ) as HTMLSpanElement[];

    // Initialize points (start at 0 = top/hidden for drip down effect)
    const points: number[] = [];
    for (let j = 0; j < numPoints; j++) {
      points.push(0);
    }

    // Function to render the SVG path based on current point values
    // Wave drips DOWN from top
    const renderPath = () => {
      let d = `M 0 0 V ${points[0]} C`;

      for (let j = 0; j < numPoints - 1; j++) {
        const p = ((j + 1) / (numPoints - 1)) * 100;
        const cp = p - (1 / (numPoints - 1) * 100) / 2;
        d += ` ${cp} ${points[j]} ${cp} ${points[j + 1]} ${p} ${points[j + 1]}`;
      }

      d += ` V 0 H 0`;
      path.setAttribute("d", d);
    };

    // Create a cleanup context
    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(container, { autoAlpha: 0 });
      gsap.set(textEl, { autoAlpha: 0 });
      gsap.set(allTargetChars, { autoAlpha: 0, y: 40, filter: "blur(10px)" });

      // Initialize path to hidden state (all points at 0 - wave starts at top)
      for (let j = 0; j < numPoints; j++) {
        points[j] = 0;
      }
      renderPath();

      // === ANIMATION SEQUENCE ===

      // 1. Fade in container (instant - it's full screen overlay)
      timeline.to(container, {
        autoAlpha: 1,
        duration: 0.01,
      });

      // 2. Wave drips DOWN from top
      timeline.addLabel("waveDrip");

      // Generate random delays for each point column for organic feel
      const pointsDelay: number[] = [];
      for (let i = 0; i < numPoints; i++) {
        pointsDelay[i] = Math.random() * delayPointsMax;
      }

      // Create a sub-timeline for the wave animation with onUpdate
      const waveTl = gsap.timeline({
        onUpdate: renderPath,
      });

      // Animate each point from 0 to 100 (drip down to cover screen)
      for (let j = 0; j < numPoints; j++) {
        const delay = pointsDelay[j];
        waveTl.to(
          points,
          {
            [j]: 100,
            duration: 1.0,
            ease: "power2.inOut",
          },
          delay
        );
      }

      // Add the wave timeline to main timeline
      timeline.add(waveTl, "waveDrip");

      // 3. Small pause with black screen
      timeline.to({}, { duration: 0.8 });

      // 4. Reveal text
      timeline.addLabel("textReveal");

      // Play reveal sound
      timeline.call(() => sounds.softChime(), [], "textReveal");

      // Show text container
      timeline.to(
        textEl,
        {
          autoAlpha: 1,
          duration: 0.01,
        },
        "textReveal"
      );

      // Reveal chars with elegant stagger
      allTargetChars.forEach((char, i) => {
        const delay = i * 0.025;

        timeline.to(
          char,
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "power3.out",
          },
          `textReveal+=${delay}`
        );
      });

      // Add glow effect to text
      timeline.to(
        textEl,
        {
          filter:
            "drop-shadow(0 0 30px rgba(255,255,255,0.4)) drop-shadow(0 0 60px rgba(255,255,255,0.2))",
          duration: 1.5,
          ease: "power2.out",
        },
        "textReveal+=0.3"
      );

      // 5. Hold final state
      timeline.to({}, { duration: 2.5 });

    }, container);

    return () => {
      ctx.revert();
    };
  }, [timeline]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
    >
      {/* Single solid black wave SVG - covers entire viewport */}
      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          ref={pathRef}
          fill="#000000"
        />
      </svg>

      {/* Text reveal - on top of black */}
      <div
        ref={textRef}
        className="relative z-10 flex items-center justify-center px-8"
      >
        <h2 className="text-center font-display text-[42px] font-medium leading-[1.1] tracking-[-1px] text-white md:text-[72px] md:tracking-[-2px]">
          {targetText.split("").map((char, i) => (
            <span
              key={i}
              className="solution-char inline-block"
              style={{ whiteSpace: char === " " ? "pre" : undefined }}
            >
              {char}
            </span>
          ))}
        </h2>
      </div>
    </div>
  );
}
