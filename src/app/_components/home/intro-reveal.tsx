"use client";

import * as React from "react";
import Image from "next/image";
import { gsap } from "gsap";

/**
 * IntroReveal - Pill-to-fullscreen reveal animation on page load
 * 
 * Shows a surface background with a pill-shaped preview of the hero image.
 * The pill expands to reveal the full hero, then this component unmounts.
 * Fully decoupled from other components.
 */
export function IntroReveal() {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const windowRef = React.useRef<HTMLDivElement | null>(null);
  const [isComplete, setIsComplete] = React.useState(false);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    const windowEl = windowRef.current;
    if (!container || !windowEl) return;

    // Respect reduced motion preference
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setIsComplete(true);
      return;
    }

    // Get viewport dimensions
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Match hero padding: px-6 py-6 on mobile, px-12 py-12 on desktop (md:)
    const isMobile = vw < 768;
    const paddingX = isMobile ? 24 : 48; // 6*4 or 12*4
    const paddingY = isMobile ? 24 : 48;
    
    // Get the image inside for parallax zoom effect
    const img = windowEl.querySelector("img");

    // Small delay to ensure page has painted
    const timer = setTimeout(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsComplete(true);
        },
      });

      // Brief hold to let user see the small frame
      tl.to({}, { duration: 0.15 });

      // Smooth expansion with custom cubic bezier feel
      tl.to(windowEl, {
        width: vw - (paddingX * 2),
        height: vh - (paddingY * 2),
        borderRadius: 16,
        duration: 1.4,
        ease: "power3.out",
      });

      // Image zooms out as frame expands (parallax depth effect)
      if (img) {
        tl.to(img, {
          scale: 1,
          duration: 1.6,
          ease: "power2.out",
        }, "<");
      }

      // Fade out surface background - perfectly timed with expansion end
      tl.to(container, {
        opacity: 0,
        duration: 0.3,
        ease: "power1.out",
        onComplete: () => {
          // Dispatch only after the overlay is actually out of the way.
          // This prevents the nav/headline animations from running "behind" the intro.
          window.dispatchEvent(new CustomEvent("scriptfx-intro-complete"));
        },
      }, "-=0.35");
    }, 80);

    return () => clearTimeout(timer);
  }, []);

  // Remove from DOM after animation completes
  if (isComplete) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center"
      aria-hidden="true"
    >
      {/* Surface background */}
      <div className="absolute inset-0 bg-surface" />
      
      {/* Preview window - shows hero image inside 16:9 movie frame */}
      <div
        ref={windowRef}
        className="relative overflow-hidden"
        style={{
          // 16:9 movie aspect ratio, small centered frame
          width: "min(160px, 22vw)",
          height: "min(90px, 12.4vw)", // 16:9 ratio
          borderRadius: "6px",
        }}
      >
        {/* Hero image preview */}
        <Image
          src="/placeholder/video-poster.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          style={{ transform: "scale(1.3)" }}
          priority
        />
        
        {/* Gradient overlay matching hero */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.25) 65.968%, rgba(0, 0, 0, 0.75) 79.979%, rgba(0, 0, 0, 0.8) 100%)",
          }}
        />

        {/* Film grain / noise overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'url("/brand/grain.png")',
            backgroundRepeat: "repeat",
            backgroundSize: "220px",
            backgroundPosition: "center",
            opacity: 0.35,
            mixBlendMode: "soft-light",
          }}
        />
      </div>
    </div>
  );
}
