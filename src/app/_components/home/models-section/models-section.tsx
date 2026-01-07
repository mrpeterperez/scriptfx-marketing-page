"use client";

import * as React from "react";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger);

interface ModelsSectionProps {
  className?: string;
}

export function ModelsSection({ className }: ModelsSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const showRef = useRef<HTMLSpanElement>(null);
  const dontTellRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current || !contentRef.current || !overlayRef.current) return;

      const show = showRef.current;
      const dontTell = dontTellRef.current;
      const button = buttonRef.current;

      gsap.set(overlayRef.current, { autoAlpha: 0 });
      gsap.set(contentRef.current, { autoAlpha: 1, y: 0 });

      if (show) gsap.set(show, { autoAlpha: 0 });
      if (dontTell) gsap.set(dontTell, { autoAlpha: 0 });
      if (button) gsap.set(button, { autoAlpha: 0, y: 16, scale: 0.98 });

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom+=300",
        end: "bottom top-=100",
        onEnter: () =>
          gsap.to(overlayRef.current, { autoAlpha: 1, duration: 0.25, ease: "power2.out" }),
        onLeave: () =>
          gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.25, ease: "power2.inOut" }),
        onEnterBack: () =>
          gsap.to(overlayRef.current, { autoAlpha: 1, duration: 0.25, ease: "power2.out" }),
        onLeaveBack: () =>
          gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.25, ease: "power2.inOut" }),
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=350%",
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      });

      // "Show." fades in first
      if (show) {
        tl.to(show, {
          autoAlpha: 1,
          duration: 0.15,
          ease: "power2.out",
        }, 0);
      }

      // "Don't tell." fades in after
      if (dontTell) {
        tl.to(dontTell, {
          autoAlpha: 1,
          duration: 0.15,
          ease: "power2.out",
        }, 0.1);
      }

      // Hold before button appears
      tl.to({}, { duration: 0.2 });

      // Button appears
      if (button) {
        tl.to(
          button,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.2,
            ease: "power2.out",
          },
          ">"
        );
      }

      tl.to({}, { duration: 0.8 });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      data-scriptfx-models="true"
      className={`relative z-[100] h-[100svh] w-screen bg-transparent ${className ?? ""}`}
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
    >
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-40 opacity-0"
      />

      <div className="relative h-full w-full px-6 py-6 md:px-12 md:py-12">
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[16px] border border-border bg-secondary-container">
          <div ref={contentRef} className="relative z-[100] mx-auto max-w-5xl text-center">
        <h2
          ref={headlineRef}
          className="mb-12 font-display text-[48px] font-medium leading-[1.15] tracking-[-1px] text-on-surface md:text-[75px] md:tracking-[-2px]"
        >
          <span ref={showRef}>Show.</span> <span ref={dontTellRef}>Don't tell.</span>
        </h2>

        <div ref={buttonRef}>
          <Button href="/get-access" size="lg" className="px-10 py-6 text-[18px]">
            Get Access
          </Button>
        </div>
          </div>
        </div>
      </div>
    </section>
  );
}
