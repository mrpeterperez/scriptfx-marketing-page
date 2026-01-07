"use client";

import * as React from "react";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ModelsSectionProps {
  className?: string;
}

const modelIcons = [
  { name: "Sora", symbol: "◆" },
  { name: "Kling", symbol: "◇" },
  { name: "Open Source", symbol: "○" },
  { name: "Custom Pipeline", symbol: "▽" },
];

export function ModelsSection({ className }: ModelsSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headlineLinesRef = useRef<(HTMLSpanElement | null)[]>([]);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const badgesRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current || !contentRef.current || !overlayRef.current) return;

      const headlineLines = headlineLinesRef.current.filter(Boolean) as HTMLSpanElement[];
      const description = descriptionRef.current;
      const badges = badgesRef.current.filter(Boolean) as HTMLDivElement[];

      gsap.set(overlayRef.current, { autoAlpha: 0 });
      gsap.set(contentRef.current, { autoAlpha: 1, y: 0 });

      gsap.set(headlineLines, { autoAlpha: 0, y: 20, filter: "blur(10px)" });
      if (description) gsap.set(description, { autoAlpha: 0, y: 20, filter: "blur(10px)" });
      gsap.set(badges, { autoAlpha: 0, y: 16, scale: 0.98, filter: "blur(8px)" });

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
          end: "+=200%",
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      });

      if (headlineLines[0]) {
        tl.to(headlineLines[0], {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power2.out",
        });
      }

      tl.to({}, { duration: 0.5 });

      if (headlineLines[1]) {
        tl.to(
          headlineLines[1],
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "power2.out",
          },
          ">-=0.2"
        );
      }

      tl.to({}, { duration: 0.6 });

      if (description) {
        tl.to(description, {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power2.out",
        });
      }

      tl.to({}, { duration: 0.6 });

      if (badges.length > 0) {
        tl.to(
          badges,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.1,
          },
          ">-=0.2"
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
      className={`relative z-[100] flex h-[100svh] w-screen items-center justify-center overflow-hidden bg-transparent p-8 ${className ?? ""}`}
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
    >
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-40 opacity-0 backdrop-blur-md"
      />

      <div ref={contentRef} className="relative z-[100] mx-auto max-w-5xl text-center">
        <h2 className="mb-8 font-display text-[48px] font-medium leading-[1.1] tracking-[-1.2px] text-on-surface md:text-[75px] md:tracking-[-2.4px]">
          <span
            ref={(el) => {
              headlineLinesRef.current[0] = el;
            }}
            className="block"
          >
            One workflow.
          </span>
          <span
            ref={(el) => {
              headlineLinesRef.current[1] = el;
            }}
            className="block"
          >
            Any model.
          </span>
        </h2>

        <p
          ref={descriptionRef}
          className="mb-12 font-body text-[22px] font-light leading-[1.5] text-on-surface/90 md:text-[24px]"
        >
          ScriptFX handles the model churn so you don't have to.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {modelIcons.map((model, i) => (
            <div
              key={model.name}
              ref={(el) => {
                badgesRef.current[i] = el;
              }}
              className="flex items-center gap-2 rounded-full border border-border bg-secondary-container px-5 py-3"
            >
              <span className="text-[24px] text-primary">{model.symbol}</span>
              <span className="font-body text-[18px] font-light tracking-[-0.72px] text-on-surface">
                {model.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
