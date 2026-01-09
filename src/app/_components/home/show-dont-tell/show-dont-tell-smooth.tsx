"use client";

import * as React from "react";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

// Images that stack horizontally
const stackImages = [
  "/placeholder/video-poster.png",
  "/placeholder/slide-2.png",
  "/placeholder/slide-3.png",
  "/placeholder/video-poster.png",
];

interface ShowDontTellSmoothProps {
  className?: string;
}

export function ShowDontTellSmooth({ className }: ShowDontTellSmoothProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const showRef = useRef<HTMLSpanElement>(null);
  const dontTellRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current || !panelRef.current) return;

      const panel = panelRef.current;
      const show = showRef.current;
      const dontTell = dontTellRef.current;
      const button = buttonRef.current;
      const images = imagesRef.current.filter(Boolean);
      const overlay = overlayRef.current;

      // Initial states - panel starts below and scaled down
      gsap.set(panel, {
        scale: 0.92,
        y: 150,
      });

      // Text starts hidden below
      if (show) gsap.set(show, { y: 40, opacity: 0 });
      if (dontTell) gsap.set(dontTell, { y: 40, opacity: 0 });
      if (button) gsap.set(button, { y: 30, opacity: 0 });
      if (overlay) gsap.set(overlay, { opacity: 0 });

      // Images start stacked (each taking 25% height) - offset below
      images.forEach((img, i) => {
        gsap.set(img, {
          top: `${i * 25}%`,
          height: "25%",
          opacity: 0,
          y: 60 + (i * 15), // Staggered from below
        });
      });

      // Main panel entrance animation
      const entranceTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          end: "top 30%",
          scrub: 0.5,
        },
      });

      // Panel scales up smoothly
      entranceTl.to(panel, {
        scale: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
      }, 0);

      // Images cascade in one by one
      images.forEach((img, i) => {
        entranceTl.to(img, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        }, 0.1 + (i * 0.15));
      });

      // Text reveal animation - triggers slightly after panel is visible
      const textTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 40%",
          end: "top 10%",
          scrub: 0.3,
        },
      });

      // Overlay fades in
      if (overlay) {
        textTl.to(overlay, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut",
        }, 0);
      }

      // "Show." rises up
      if (show) {
        textTl.to(show, {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        }, 0.1);
      }

      // "Don't tell." rises up
      if (dontTell) {
        textTl.to(dontTell, {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        }, 0.25);
      }

      // Button fades up
      if (button) {
        textTl.to(button, {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        }, 0.4);
      }

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      data-scriptfx-show-dont-tell="true"
      className={`relative w-screen min-h-screen ${className ?? ""}`}
      style={{ 
        width: "100vw", 
        marginLeft: "calc(50% - 50vw)",
      }}
    >
      {/* Panel container */}
      <div className="w-full min-h-screen flex items-center justify-center py-6 px-3 md:px-6">
        <div 
          ref={panelRef}
          className="relative w-full max-w-[calc(100%-20px)] min-h-[calc(100dvh-48px)] rounded-[24px] overflow-hidden shadow-2xl transform-gpu backface-hidden will-change-transform"
          style={{
            perspective: "1000px",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          {/* 4 Horizontal stacking images */}
          <div className="absolute inset-0 z-0">
            {stackImages.map((src, index) => (
              <div
                key={index}
                ref={(el) => { imagesRef.current[index] = el; }}
                className="absolute left-0 w-full overflow-hidden transform-gpu will-change-transform"
                style={{ 
                  top: `${index * 25}%`, 
                  height: "25%",
                }}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
            
            {/* Overlay for text readability */}
            <div 
              ref={overlayRef}
              className="absolute inset-0 z-10" 
              style={{ 
                background: "radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.3) 100%)" 
              }}
            />
          </div>

          {/* Text content - centered */}
          <div className="relative z-20 w-full h-full flex flex-col items-center justify-center min-h-[calc(100dvh-48px)] p-8 md:p-20">
            <div className="text-center">
              {/* Main headline */}
              <h2 className="font-display text-[60px] md:text-[120px] leading-[1.1] text-white tracking-[-2px] font-light mb-8">
                <span 
                  ref={showRef}
                  className="inline-block will-change-transform drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
                  style={{ WebkitFontSmoothing: "antialiased", textRendering: "optimizeLegibility" }}
                >
                  Show.
                </span>{" "}
                <span 
                  ref={dontTellRef}
                  className="inline-block will-change-transform drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
                  style={{ WebkitFontSmoothing: "antialiased", textRendering: "optimizeLegibility" }}
                >
                  Don&apos;t tell.
                </span>
              </h2>

              {/* CTA Button */}
              <div ref={buttonRef}>
                <Button href="/get-access" size="lg" className="py-6 text-[18px]">
                  Get Access
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
