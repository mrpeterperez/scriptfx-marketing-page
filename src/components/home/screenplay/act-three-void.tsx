"use client";

import * as React from "react";
import { gsap } from "gsap";

interface ActThreeVoidProps {
  timeline: gsap.core.Timeline | null;
  grayBoxRef?: React.RefObject<HTMLDivElement | null>;
  paddingContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export function ActThreeVoid({ timeline, grayBoxRef, paddingContainerRef }: ActThreeVoidProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const sourceTextRef = React.useRef<HTMLDivElement>(null);
  const targetTextRef = React.useRef<HTMLDivElement>(null);
  const leftColumnRef = React.useRef<HTMLDivElement>(null);
  const rightColumnRef = React.useRef<HTMLDivElement>(null);
  const leftMarginRef = React.useRef<HTMLDivElement>(null);
  const dividerRef = React.useRef<HTMLDivElement>(null);
  const grainRef = React.useRef<HTMLDivElement>(null);
  const shakeRef = React.useRef<HTMLDivElement>(null);
  const shakeTimelineRef = React.useRef<gsap.core.Timeline | null>(null);
  
  // Curtain refs
  const leftCurtainRef = React.useRef<HTMLDivElement>(null);
  const rightCurtainRef = React.useRef<HTMLDivElement>(null);

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
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;

      // Initial states
      gsap.set(container, { autoAlpha: 0 });
      gsap.set(targetTextEl, { autoAlpha: 0 });
      gsap.set(allTargetChars, { autoAlpha: 0 });
      
      // Hide right column initially
      if (rightColumn) {
        gsap.set(rightColumn, { autoAlpha: 0, x: isDesktop ? 40 : 0 });
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
        
        // Only modify position on desktop where we do the shift animation
        if (isDesktop) {
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
        } else {
          // On mobile, ensure valid defaults
          gsap.set(leftColumn, { x: 0, textAlign: "center" });
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
        // Only apply shift on desktop
        if (isDesktop) {
          timeline.to(
            leftColumn,
            {
              x: -25, // Overshoot left
              duration: 0.9,
              ease: "power2.in",
            },
            "shift"
          );
        }
        
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
        
        // Wall impact - just a soft thud sound, no shake
        // The confinement is felt through the elastic bounce, not violence
        
        // Then bounce back to final position
        timeline.to(
          leftColumn,
          {
            x: 0,
            textAlign: isDesktop ? "left" : "center",
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
      const grayBox = grayBoxRef?.current;

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

      // Hold so user can read all words
      timeline.to({}, { duration: 1.2 });
      
      // === SHAKE ZONE START ===
      timeline.addLabel("shakeStart");
      
      // Brief moment of shaking before letters fall
      timeline.to({}, { duration: 0.5 });

      // Dissolve - letters fall
      timeline.addLabel("dissolve");
      
      // Fade out divider
      if (divider) {
        timeline.to(divider, { autoAlpha: 0, scaleY: 0, duration: 0.3, ease: "power2.in" }, "dissolve");
      }

      // Letters fall
      allSourceChars.forEach((char, i) => {
        const randomX = (Math.random() - 0.5) * 60;
        const fallY = 400 + Math.random() * 200;
        const randomRotate = (Math.random() - 0.5) * 120;
        const delay = Math.random() * 0.25;

        timeline.to(
          char,
          {
            autoAlpha: 0,
            x: randomX,
            y: fallY,
            rotation: randomRotate,
            scale: 0.1,
            filter: "blur(6px)",
            duration: 0.7,
            ease: "power2.in",
          },
          `dissolve+=${delay}`
        );
      });

      // === SHAKE ZONE END === (must end BEFORE reveal)
      timeline.addLabel("shakeEnd", "dissolve+=0.8");

      // Stillness - shake has stopped
      timeline.to({}, { duration: 1.0 }, ">");
      
      // Bring in target text (NO SHAKE during this)
      timeline.addLabel("reveal");
      
      // Soft chime for "That era is ending."

      // Show target container
      timeline.to(
        targetTextEl,
        {
          autoAlpha: 1,
          duration: 0.01,
        },
        "reveal+=0.2"
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
      
      // Get curtain elements
      const leftCurtain = leftCurtainRef.current;
      const rightCurtain = rightCurtainRef.current;
      
      // Initial states for curtains
      if (leftCurtain) gsap.set(leftCurtain, { xPercent: -100 });
      if (rightCurtain) gsap.set(rightCurtain, { xPercent: 100 });
      
      // === CURTAIN CLOSE ===
      timeline.addLabel("curtainClose");
      
      // Fade out "That era is ending." text
      timeline.to(
        targetTextEl,
        {
          autoAlpha: 0,
          filter: "blur(8px)",
          duration: 0.8,
          ease: "power2.in",
        },
        "curtainClose"
      );
      
      // Curtains slide in from edges
      if (leftCurtain && rightCurtain) {
        timeline.to(
          leftCurtain,
          {
            xPercent: 0,
            duration: 2.5,
            ease: "power2.inOut",
            onStart: () => {
              // Dispatch event to hide nav when curtains start closing
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { 
                  detail: { visible: false } 
                }));
              }
            },
            onReverseComplete: () => {
              // Show nav again if we reverse back
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { 
                  detail: { visible: true } 
                }));
              }
            }
          },
          "curtainClose+=0.3"
        );
        timeline.to(
          rightCurtain,
          {
            xPercent: 0,
            duration: 2.5,
            ease: "power2.inOut",
          },
          "curtainClose+=0.3"
        );
      }

      // Label the exact moment the curtains are fully closed
      // (0.3s delay + 2.5s close duration)
      timeline.addLabel("curtainsClosed", "curtainClose+=2.8");
      
      // Fade out gray box border/background when curtains close
      if (grayBox) {
        timeline.to(
          grayBox,
          {
            borderColor: "transparent",
            backgroundColor: "black",
            borderRadius: 0,
            duration: 1.0,
            ease: "power2.inOut",
          },
          "curtainClose+=1.5"
        );
      }
      
      // Shrink padding container to 0 padding for seamless transition
      const paddingContainer = paddingContainerRef?.current;
      if (paddingContainer) {
        timeline.to(
          paddingContainer,
          {
            padding: 0,
            duration: 1.0,
            ease: "power2.inOut",
          },
          "curtainClose+=1.5"
        );
      }

      // No extra hold on black — next act should hit immediately
      
      // Get shake zone boundaries as ABSOLUTE times (not progress-based)
      // This way Act Four adding to timeline won't mess up the shake timing
      const shakeStartTime = timeline.labels["shakeStart"];
      const shakeEndTime = timeline.labels["shakeEnd"];
      
      // Simple shake control via onUpdate - runs every scroll frame
      timeline.eventCallback("onUpdate", () => {
        const currentTime = timeline.time();
        const shouldShake = currentTime >= shakeStartTime && currentTime <= shakeEndTime;
        
        if (shouldShake && !shakeTimelineRef.current && grayBox) {
          // Start shake
          shakeTimelineRef.current = gsap.timeline({ repeat: -1 })
            .to(grayBox, { x: -6, y: 2, duration: 0.04, ease: "none" })
            .to(grayBox, { x: 5, y: -3, duration: 0.04, ease: "none" })
            .to(grayBox, { x: -4, y: 3, duration: 0.04, ease: "none" })
            .to(grayBox, { x: 6, y: -2, duration: 0.04, ease: "none" })
            .to(grayBox, { x: -5, y: 2, duration: 0.04, ease: "none" })
            .to(grayBox, { x: 4, y: -3, duration: 0.04, ease: "none" });
        } else if (!shouldShake && shakeTimelineRef.current) {
          // Stop shake
          shakeTimelineRef.current.kill();
          shakeTimelineRef.current = null;
          if (grayBox) gsap.set(grayBox, { x: 0, y: 0 });
        }
      });
      
    }, container);

    return () => {
      // Kill shake timeline on cleanup
      if (shakeTimelineRef.current) {
        shakeTimelineRef.current.kill();
        shakeTimelineRef.current = null;
      }
      // Reset grayBox position
      if (grayBoxRef?.current) {
        gsap.set(grayBoxRef.current, { x: 0, y: 0 });
      }
      ctx.revert();
    };
  }, [timeline, grayBoxRef]);

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
          className="pointer-events-auto flex w-full max-w-4xl flex-col items-center justify-center gap-8 px-6 md:flex-row md:gap-16 md:px-12"
        >
        {/* Left column with left margin line */}
        <div ref={leftColumnRef} className="relative w-full select-text text-center md:w-auto md:text-left">
          {/* Left margin line */}
          <div
            ref={leftMarginRef}
            className="absolute -left-6 top-1/2 hidden h-32 w-px -translate-y-1/2 bg-on-surface/30 md:block"
          />
          
          <p className="font-body text-[18px] font-normal leading-[1.5] text-on-surface/90 md:text-[24px]">
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
          className="divider hidden h-32 w-px bg-on-surface/30 md:block" 
        />

        {/* Right column */}
        <div ref={rightColumnRef} className="w-full select-text text-center md:w-auto md:text-right">
          <p className="font-display text-[48px] font-medium leading-[1.15] tracking-[-1px] text-on-surface md:text-[68px] md:tracking-[-2px]">
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
          className="pointer-events-none absolute inset-0 flex items-center justify-center px-6"
        >
          <h2 className="text-center font-display text-[48px] font-medium italic leading-[1.15] tracking-[-1px] text-on-surface md:text-[68px] md:tracking-[-2px]">
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
      
      {/* Curtains - slide in from edges to close */}
      <div
        ref={leftCurtainRef}
        className="pointer-events-none absolute inset-y-0 left-0 z-[60] w-1/2 bg-black"
      />
      <div
        ref={rightCurtainRef}
        className="pointer-events-none absolute inset-y-0 right-0 z-[60] w-1/2 bg-black"
      />
    </div>
  );
}
