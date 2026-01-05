"use client";

import * as React from "react";
import { gsap } from "gsap";

interface ActThreeVoidProps {
  timeline: gsap.core.Timeline | null;
}

export function ActThreeVoid({ timeline }: ActThreeVoidProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const sourceTextRef = React.useRef<HTMLDivElement>(null);
  const targetTextRef = React.useRef<HTMLDivElement>(null);
  const leftColumnRef = React.useRef<HTMLDivElement>(null);
  const rightColumnRef = React.useRef<HTMLDivElement>(null);
  const leftMarginRef = React.useRef<HTMLDivElement>(null);
  const dividerRef = React.useRef<HTMLDivElement>(null);
  const grainRef = React.useRef<HTMLDivElement>(null);
  const shakeRef = React.useRef<HTMLDivElement>(null);

  // Source text
  const leftLines = ["For decades, stories", "lived between margins."];
  const rightLines = ["Pitched.", "Optioned.", "Noted.", "Parked."];

  // Target text
  const targetText = "That era is ending.";

  React.useLayoutEffect(() => {
    if (!timeline || !containerRef.current) return;

    const container = containerRef.current;
    const sourceText = sourceTextRef.current;
    const targetTextEl = targetTextRef.current;

    if (!sourceText || !targetTextEl) return;

    // Get all source character spans
    const leftChars = Array.from(
      sourceText.querySelectorAll(".left-char")
    ) as HTMLSpanElement[];
    const rightChars = Array.from(
      sourceText.querySelectorAll(".right-char")
    ) as HTMLSpanElement[];
    const allSourceChars = [...leftChars, ...rightChars];

    // Get divider (will also serve as right margin initially)
    const divider = dividerRef.current;
    
    // Get column refs
    const leftColumn = leftColumnRef.current;
    const rightColumn = rightColumnRef.current;
    
    // Get left margin line
    const leftMargin = leftMarginRef.current;

    // Get all target character spans
    const allTargetChars = Array.from(
      targetTextEl.querySelectorAll(".target-char")
    ) as HTMLSpanElement[];

    // Create a cleanup context
    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(container, { autoAlpha: 0 });
      gsap.set(targetTextEl, { autoAlpha: 0 });
      gsap.set(allTargetChars, { autoAlpha: 0 });
      
      // Hide right column initially
      if (rightColumn) {
        gsap.set(rightColumn, { autoAlpha: 0, x: 40 });
      }
      
      // Hide left margin initially (will draw from top like a pen)
      if (leftMargin) {
        gsap.set(leftMargin, { autoAlpha: 0, scaleY: 0, transformOrigin: "top center" });
      }
      
      // Calculate offset to center the left column
      let dividerMarginOffset = 0;
      if (leftColumn) {
        const containerWidth = container.offsetWidth;
        const leftWidth = leftColumn.offsetWidth;
        const centerOffset = (containerWidth - leftWidth) / 2 - leftColumn.offsetLeft;
        gsap.set(leftColumn, { 
          x: centerOffset,
          textAlign: "center"
        });
        
        // Calculate where divider needs to be to act as right margin
        // It should be just to the right of the centered left column
        if (divider) {
          const dividerCurrentPos = divider.offsetLeft;
          const leftColumnCenteredRight = leftColumn.offsetLeft + centerOffset + leftWidth + 24; // 24px gap
          dividerMarginOffset = leftColumnCenteredRight - dividerCurrentPos;
        }
      }
      
      // Position divider as right margin initially (next to centered left text)
      // Will draw from top like a pen
      if (divider) {
        gsap.set(divider, { 
          autoAlpha: 0, 
          scaleY: 0, 
          x: dividerMarginOffset,
          transformOrigin: "top center"
        });
      }

      // Hide all source chars initially
      allSourceChars.forEach((char) => {
        gsap.set(char, { autoAlpha: 0, y: 30, filter: "blur(8px)" });
      });

      // === ANIMATION SEQUENCE - Each moment gets its time to shine ===

      // 1. Fade in container
      timeline.to(container, {
        autoAlpha: 1,
        duration: 0.6,
        ease: "power2.out",
      });

      // 2. Reveal left text chars with stagger (CENTERED)
      timeline.to(
        leftChars,
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.015,
        },
        "<+=0.2"
      );

      // 3. Hold for reading FIRST - let them read the text
      timeline.to({}, { duration: 2.0 });

      // 4. MARGIN LINES draw in like a pen stroke (from top to bottom)
      timeline.addLabel("margins");
      
      if (leftMargin) {
        // Quick fade in
        timeline.to(
          leftMargin,
          {
            autoAlpha: 1,
            duration: 0.1,
          },
          "margins"
        );
        // Then draw down like a pen
        timeline.to(
          leftMargin,
          {
            scaleY: 1,
            duration: 0.6,
            ease: "power1.out", // Linear-ish like pen drawing
          },
          "margins+=0.1"
        );
      }
      // Divider draws as RIGHT MARGIN
      if (divider) {
        timeline.to(
          divider,
          {
            autoAlpha: 1,
            duration: 0.1,
          },
          "margins+=0.15" // Slight delay for staggered pen effect
        );
        timeline.to(
          divider,
          {
            scaleY: 1,
            duration: 0.6,
            ease: "power1.out",
          },
          "margins+=0.25"
        );
      }

      // 5. Hold with margins visible - let it breathe
      timeline.to({}, { duration: 1.5 });

      // 6. BOOM - left column hits wall and shifts, divider slides to center
      // Left margin disappears AS it hits the wall
      timeline.addLabel("shift");
      
      if (leftColumn) {
        // First overshoot past the target (hits the wall) - slower build up
        timeline.to(
          leftColumn,
          {
            x: -25, // Overshoot left
            duration: 0.9,
            ease: "power2.in",
          },
          "shift"
        );
        
        // Left margin fades out as text moves - disappears when hitting wall
        if (leftMargin) {
          timeline.to(
            leftMargin,
            {
              autoAlpha: 0,
              scaleY: 0,
              duration: 0.5,
              ease: "power2.in",
            },
            "shift+=0.4" // Starts fading partway through the shift
          );
        }
        
        // CAMERA SHAKE on wall impact!
        const shakeContainer = shakeRef.current;
        if (shakeContainer) {
          timeline.to(
            shakeContainer,
            {
              x: -3,
              y: 1,
              duration: 0.05,
              ease: "power2.out",
            },
            "shift+=0.85" // Right when it hits
          );
          timeline.to(
            shakeContainer,
            {
              x: 2,
              y: -1,
              duration: 0.05,
              ease: "power2.out",
            }
          );
          timeline.to(
            shakeContainer,
            {
              x: -1,
              y: 0,
              duration: 0.05,
              ease: "power2.out",
            }
          );
          timeline.to(
            shakeContainer,
            {
              x: 0,
              y: 0,
              duration: 0.1,
              ease: "power2.out",
            }
          );
        }
        
        // Then bounce back to final position
        timeline.to(
          leftColumn,
          {
            x: 0,
            textAlign: "left",
            duration: 0.8,
            ease: "elastic.out(1, 0.4)",
          },
          "shift+=0.9"
        );
      }
      
      // Divider transforms from right margin to center divider
      if (divider) {
        timeline.to(
          divider,
          {
            x: 0, // Back to its natural center position
            duration: 1.7,
            ease: "power2.inOut",
          },
          "shift"
        );
      }

      // 7. Right column container fades in
      timeline.addLabel("rightIn", ">+=0.3");
      
      if (rightColumn) {
        timeline.to(
          rightColumn,
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "rightIn"
        );
      }

      // 9. Reveal right text words one by one with dramatic pauses
      const rightWords = ["Pitched.", "Optioned.", "Noted.", "Parked."];
      let charIdx = 0;

      rightWords.forEach((word, wordIdx) => {
        const wordChars = rightChars.slice(charIdx, charIdx + word.length);
        charIdx += word.length;

        timeline.to(
          wordChars,
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.025,
          },
          wordIdx === 0 ? "rightIn+=0.1" : ">+=0.5"
        );
      });

      // 6. Hold after all words shown
      timeline.to({}, { duration: 1.8 });

      // 7. Dissolve source text
      timeline.addLabel("dissolve");

      // Fade out divider
      if (divider) {
        timeline.to(
          divider,
          {
            autoAlpha: 0,
            scaleY: 0,
            duration: 0.5,
            ease: "power2.in",
          },
          "dissolve"
        );
      }

      // Fade out source chars with scatter effect - SLOWED DOWN for drama
      allSourceChars.forEach((char, i) => {
        const randomX = (Math.random() - 0.5) * 150;
        const randomY = (Math.random() - 0.5) * 100;
        const randomRotate = (Math.random() - 0.5) * 45;
        const delay = i * 0.025;

        timeline.to(
          char,
          {
            autoAlpha: 0,
            x: randomX,
            y: randomY,
            rotation: randomRotate,
            scale: 0.3,
            filter: "blur(16px)",
            duration: 1.8,
            ease: "power2.inOut",
          },
          `dissolve+=${delay}`
        );
      });

      // 7. Bring in target text
      timeline.addLabel("reveal", ">-=0.3");

      // Show target container
      timeline.to(
        targetTextEl,
        {
          autoAlpha: 1,
          duration: 0.01,
        },
        "reveal"
      );

      // Reveal target chars with elegant stagger + GLOW
      allTargetChars.forEach((char, i) => {
        const delay = i * 0.03;

        gsap.set(char, {
          autoAlpha: 0,
          y: 40,
          filter: "blur(10px)",
          scale: 0.9,
        });

        timeline.to(
          char,
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
          },
          `reveal+=${delay}`
        );
      });
      
      // Add soft glow bloom to entire target text
      timeline.to(
        targetTextEl,
        {
          filter: "drop-shadow(0 0 20px rgba(255,255,255,0.3)) drop-shadow(0 0 40px rgba(255,255,255,0.15))",
          duration: 1.5,
          ease: "power2.out",
        },
        "reveal+=0.5"
      );

      // 8. Hold final text
      timeline.to({}, { duration: 2.5 });
    }, container);

    return () => ctx.revert();
  }, [timeline]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center overflow-hidden"
    >
      {/* Shake wrapper for camera shake effect */}
      <div ref={shakeRef} className="absolute inset-0 flex items-center justify-center">
        {/* Source text - tighter 2 column layout */}
        <div
          ref={sourceTextRef}
          className="pointer-events-auto flex w-full max-w-5xl items-center justify-center gap-12 px-8 md:gap-20 md:px-12"
        >
        {/* Left column with left margin line */}
        <div ref={leftColumnRef} className="relative select-text">
          {/* Left margin line */}
          <div
            ref={leftMarginRef}
            className="absolute -left-6 top-1/2 h-32 w-px -translate-y-1/2 bg-on-surface/30 md:-left-8 md:h-40"
          />
          
          <p className="font-body text-[22px] font-normal leading-[1.5] text-on-surface/90 md:text-[28px]">
            {leftLines.map((line, lineIdx) => (
              <span key={lineIdx} className="block">
                {line.split("").map((char, charIdx) => (
                  <span
                    key={`${lineIdx}-${charIdx}`}
                    className="left-char inline-block"
                    style={{ whiteSpace: char === " " ? "pre" : undefined }}
                  >
                    {char}
                  </span>
                ))}
              </span>
            ))}
          </p>
        </div>

        {/* Divider - starts as right margin, then slides to center */}
        <div 
          ref={dividerRef}
          className="divider hidden h-32 w-px bg-on-surface/30 md:block md:h-40" 
        />

        {/* Right column */}
        <div ref={rightColumnRef} className="select-text text-right">
          <p className="font-display text-[48px] font-medium leading-[1.15] tracking-[-1px] text-on-surface md:text-[75px] md:tracking-[-2px]">
            {rightLines.map((line, lineIdx) => (
              <span key={lineIdx} className="block">
                {line.split("").map((char, charIdx) => (
                  <span
                    key={`${lineIdx}-${charIdx}`}
                    className="right-char inline-block"
                    style={{ whiteSpace: char === " " ? "pre" : undefined }}
                  >
                    {char}
                  </span>
                ))}
              </span>
            ))}
          </p>
        </div>
      </div>

        {/* Target text - center italic with glow */}
        <div
          ref={targetTextRef}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <h2 className="text-center font-display text-[48px] font-medium italic leading-[1.1] tracking-[-1.2px] text-on-surface md:text-[75px] md:tracking-[-2px]">
            {targetText.split("").map((char, i) => (
              <span
                key={i}
                className="target-char inline-block"
                style={{ whiteSpace: char === " " ? "pre" : undefined }}
              >
                {char}
              </span>
            ))}
          </h2>
        </div>
      </div>
    </div>
  );
}
