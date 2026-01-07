"use client";

import * as React from "react";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

// Images that stack like building a deck
const stackImages = [
  "/placeholder/video-poster.png",
  "/placeholder/slide-2.png",
  "/placeholder/slide-3.png",
  "/placeholder/video-poster.png", // Duplicate for 4th card
];

interface ShowDontTellProps {
  className?: string;
}

export function ShowDontTell({ className }: ShowDontTellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const showRef = useRef<HTMLSpanElement>(null);
  const dontTellRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlay2Ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current || !contentRef.current || !imageWrapperRef.current) return;

      const show = showRef.current;
      const dontTell = dontTellRef.current;
      const button = buttonRef.current;
      const images = imagesRef.current.filter(Boolean);
      const wrapper = imageWrapperRef.current;
      const overlay = overlayRef.current;
      const overlay2 = overlay2Ref.current;
      const wrapperHeight = wrapper.offsetHeight;

      gsap.set(contentRef.current, { autoAlpha: 1, y: 0 });

      // Text starts hidden and slightly below
      if (show) gsap.set(show, { autoAlpha: 0, y: 30 });
      if (dontTell) gsap.set(dontTell, { autoAlpha: 0, y: 30 });
      if (button) gsap.set(button, { autoAlpha: 0, y: 20, scale: 0.98 });
      
      // Two-stage overlay - both start invisible
      if (overlay) gsap.set(overlay, { autoAlpha: 0 });
      if (overlay2) gsap.set(overlay2, { autoAlpha: 0 });

      // Initial state: first image slightly scaled/faded for soft entrance, others hidden below
      images.forEach((img, i) => {
        if (i === 0) {
          gsap.set(img, {
            height: wrapperHeight,
            top: 0,
            autoAlpha: 0.7,
            scale: 1.08,
          });
        } else {
          gsap.set(img, {
            height: wrapperHeight,
            top: wrapperHeight,
            autoAlpha: 0,
            scale: 1.02,
          });
        }
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=500%",
          scrub: 1.5,
          pin: true,
          anticipatePin: 1,
          pinSpacing: true,
          ease: "none",
        },
      });

      // Soft entrance - eases into the pin
      tl.fromTo(images[0], 
        { scale: 1.08, autoAlpha: 0.7 },
        { scale: 1, autoAlpha: 1, duration: 0.08, ease: "power2.out" },
        0
      );

      // Small buffer before stacking begins
      tl.to({}, { duration: 0.02 });

      // Image 2 comes in, pushes image 1 up, both shrink to 50%
      tl.to(images[0], {
        height: wrapperHeight / 2,
        top: 0,
        duration: 0.1,
        ease: "power3.inOut",
      }, 0.1);
      tl.to(images[1], {
        height: wrapperHeight / 2,
        top: wrapperHeight / 2,
        autoAlpha: 1,
        scale: 1,
        duration: 0.1,
        ease: "power3.inOut",
      }, 0.1);

      // Image 3 comes in, all shrink to 33%
      tl.to(images[0], {
        height: wrapperHeight / 3,
        top: 0,
        duration: 0.1,
        ease: "power3.inOut",
      }, 0.22);
      tl.to(images[1], {
        height: wrapperHeight / 3,
        top: wrapperHeight / 3,
        duration: 0.1,
        ease: "power3.inOut",
      }, 0.22);
      tl.to(images[2], {
        height: wrapperHeight / 3,
        top: (wrapperHeight / 3) * 2,
        autoAlpha: 1,
        scale: 1,
        duration: 0.1,
        ease: "power3.inOut",
      }, 0.22);

      // Image 4 comes in - THE FINAL PIECE
      tl.to(images[0], {
        height: wrapperHeight / 4,
        top: 0,
        duration: 0.12,
        ease: "power3.inOut",
      }, 0.34);
      tl.to(images[1], {
        height: wrapperHeight / 4,
        top: wrapperHeight / 4,
        duration: 0.12,
        ease: "power3.inOut",
      }, 0.34);
      tl.to(images[2], {
        height: wrapperHeight / 4,
        top: (wrapperHeight / 4) * 2,
        duration: 0.12,
        ease: "power3.inOut",
      }, 0.34);
      tl.to(images[3], {
        height: wrapperHeight / 4,
        top: (wrapperHeight / 4) * 3,
        autoAlpha: 1,
        scale: 1,
        duration: 0.12,
        ease: "power3.inOut",
      }, 0.34);

      // LONGER HOLD - Let the user appreciate the full visual
      tl.to({}, { duration: 0.12 });

      // Stage 1: Light dim (30%) after deck completes
      if (overlay) {
        tl.to(overlay, {
          autoAlpha: 1,
          duration: 0.12,
          ease: "power2.inOut",
        });
      }

      // Slight blur on images as we transition to text
      images.forEach((img) => {
        tl.to(img, {
          filter: "blur(2px)",
          duration: 0.15,
          ease: "power2.inOut",
        }, "<");
      });

      // Stage 2: Deeper darken (70%) right before text
      if (overlay2) {
        tl.to(overlay2, {
          autoAlpha: 1,
          duration: 0.12,
          ease: "power2.inOut",
        });
      }

      // "Show." fades up and in - HANGS ALONE for a beat
      if (show) {
        tl.to(show, {
          autoAlpha: 1,
          y: 0,
          duration: 0.15,
          ease: "power2.out",
        });
      }

      // Dramatic pause - let "Show." land
      tl.to({}, { duration: 0.08 });

      // "Don't tell." fades up - THE PUNCHLINE
      if (dontTell) {
        tl.to(dontTell, {
          autoAlpha: 1,
          y: 0,
          duration: 0.15,
          ease: "power2.out",
        });
      }

      // Hold before button appears
      tl.to({}, { duration: 0.06 });

      // Button appears with Y movement
      if (button) {
        tl.to(
          button,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.14,
            ease: "power2.out",
          }
        );
      }

      // Hold at end
      tl.to({}, { duration: 0.18 });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      data-scriptfx-show-dont-tell="true"
      className={`relative z-[100] h-[100svh] w-screen bg-transparent ${className ?? ""}`}
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
    >
      <div className="relative h-full w-full px-6 py-6 md:px-12 md:py-12">
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[16px] border border-border bg-secondary-container">
          
          {/* Stacking images container */}
          <div ref={imageWrapperRef} className="absolute inset-0 z-0 overflow-hidden">
            {stackImages.map((src, index) => (
              <div
                key={index}
                ref={(el) => { imagesRef.current[index] = el; }}
                className="absolute left-0 w-full overflow-hidden"
                style={{ top: 0, height: "100%" }}
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
            {/* Stage 1 overlay - light dim (30%) */}
            <div 
              ref={overlayRef}
              className="absolute inset-0 z-10 bg-black/30" 
            />
            {/* Stage 2 overlay - gradient, darker center for text focus */}
            <div 
              ref={overlay2Ref}
              className="absolute inset-0 z-20" 
              style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.3) 100%)" }}
            />
          </div>

          {/* Text content */}
          <div ref={contentRef} className="relative z-30 mx-auto max-w-5xl text-center">
            <h2 className="mb-6 font-display text-[48px] font-medium leading-[1.15] tracking-[-1px] text-white md:text-[75px] md:tracking-[-2px] drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              <span ref={showRef} className="inline-block">Show.</span>{" "}
              <span ref={dontTellRef} className="inline-block">Don't tell.</span>
            </h2>
            <div ref={buttonRef}>
              <Button href="/get-access" size="lg" className="py-6 text-[18px]">
                Get Access
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
