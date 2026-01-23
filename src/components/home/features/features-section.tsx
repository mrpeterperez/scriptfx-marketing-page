"use client";

import * as React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { features } from "./features-data";

gsap.registerPlugin(ScrollTrigger);

export function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Panel refs
  const panel1Ref = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const mobileContentRef = useRef<HTMLDivElement>(null);
  const finalMessageRef = useRef<HTMLDivElement>(null);
  const finalPart1Ref = useRef<HTMLSpanElement>(null);
  const finalPart2Ref = useRef<HTMLSpanElement>(null);
  const finalPart3Ref = useRef<HTMLSpanElement>(null);
  const finalSubtextRef = useRef<HTMLParagraphElement>(null);
  const [activeFeature, setActiveFeature] = useState(0);

  // Mobile detection
  useLayoutEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current) return;

      const isDesktop = window.innerWidth >= 768;

      // ===== INITIAL STATES =====
      if (finalMessageRef.current) gsap.set(finalMessageRef.current, { autoAlpha: 0 });
      if (finalPart1Ref.current) gsap.set(finalPart1Ref.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      if (finalPart2Ref.current) gsap.set(finalPart2Ref.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      if (finalPart3Ref.current) gsap.set(finalPart3Ref.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      if (finalSubtextRef.current) gsap.set(finalSubtextRef.current, { autoAlpha: 0, y: 20, filter: "blur(8px)" });

      // Bring the top nav back
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom-=120",
        onEnter: () => {
          window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { detail: { visible: true } }));
        },
        onEnterBack: () => {
          window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { detail: { visible: true } }));
        },
        onLeaveBack: () => {
          window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { detail: { visible: false } }));
        },
      });

      // ===== MAIN SCROLL TRIGGER =====
      // Total phases: 6 features + 6 final message hold = 12
      const totalPhases = 12;

      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: `+=${totalPhases * 100}vh`,
        pin: true,
        scrub: 1.2,
        onUpdate: (self) => {
          const progress = self.progress;
          const phase = progress * totalPhases;

          // ===== PHASE 1: Features (0-6) =====
          if (phase < 6) {
            const index = Math.min(Math.floor(phase), features.length - 1);
            setActiveFeature(index);

            // Show nav on desktop during features, hide on mobile
            window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { detail: { visible: isDesktop } }));

            // Reset final message
            if (finalMessageRef.current) gsap.set(finalMessageRef.current, { autoAlpha: 0 });
            // Only animate desktop panels on desktop
            if (isDesktop && leftPanelRef.current) gsap.set(leftPanelRef.current, { autoAlpha: 1, x: 0, filter: "blur(0px)" });
            if (isDesktop && rightPanelRef.current) gsap.set(rightPanelRef.current, { autoAlpha: 1, x: 0, filter: "blur(0px)" });
            // Reset mobile content
            if (!isDesktop && mobileContentRef.current) gsap.set(mobileContentRef.current, { autoAlpha: 1, filter: "blur(0px)" });
          }
          // ===== PHASE 2: Final Message Reveal (6-12) =====
          else {
            const localProgress = (phase - 6) / 6;
            setActiveFeature(features.length - 1);

            // Show nav on desktop during final message, hide on mobile
            window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { detail: { visible: isDesktop } }));

            // Panels slide out, final message fades in
            const panelProgress = Math.min(localProgress * 3, 1);
            if (isDesktop && leftPanelRef.current) {
              gsap.set(leftPanelRef.current, {
                autoAlpha: 1 - panelProgress,
                x: -50 * panelProgress,
                filter: `blur(${10 * panelProgress}px)`,
              });
            }
            if (isDesktop && rightPanelRef.current) {
              gsap.set(rightPanelRef.current, {
                autoAlpha: 1 - panelProgress,
                x: 50 * panelProgress,
                filter: `blur(${10 * panelProgress}px)`,
              });
            }
            // Fade out mobile content
            if (!isDesktop && mobileContentRef.current) {
              gsap.set(mobileContentRef.current, {
                autoAlpha: 1 - panelProgress,
                filter: `blur(${10 * panelProgress}px)`,
              });
            }
            if (finalMessageRef.current) {
              gsap.set(finalMessageRef.current, { autoAlpha: Math.min(panelProgress * 2, 1) });
            }

            // Staggered text reveals
            if (finalPart1Ref.current) {
              const p = Math.max(0, Math.min((localProgress - 0.15) * 10, 1));
              gsap.set(finalPart1Ref.current, { autoAlpha: p, y: 30 * (1 - p), filter: `blur(${12 * (1 - p)}px)` });
            }
            if (finalPart2Ref.current) {
              const p = Math.max(0, Math.min((localProgress - 0.22) * 10, 1));
              gsap.set(finalPart2Ref.current, { autoAlpha: p, y: 30 * (1 - p), filter: `blur(${12 * (1 - p)}px)` });
            }
            if (finalPart3Ref.current) {
              const p = Math.max(0, Math.min((localProgress - 0.29) * 10, 1));
              gsap.set(finalPart3Ref.current, { autoAlpha: p, y: 30 * (1 - p), filter: `blur(${12 * (1 - p)}px)` });
            }
            if (finalSubtextRef.current) {
              const p = Math.max(0, Math.min((localProgress - 0.36) * 10, 1));
              gsap.set(finalSubtextRef.current, { autoAlpha: p, y: 20 * (1 - p), filter: `blur(${8 * (1 - p)}px)` });
            }
          }
        },
        onEnter: () => {
          window.dispatchEvent(new CustomEvent("scriptfx-features-pinned", { detail: { pinned: true } }));
        },
        onEnterBack: () => {
          window.dispatchEvent(new CustomEvent("scriptfx-features-pinned", { detail: { pinned: true } }));
        },
        onLeaveBack: () => {
          window.dispatchEvent(new CustomEvent("scriptfx-features-pinned", { detail: { pinned: false } }));
        },
      });
      scrollTriggerRef.current = st;
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleFeatureClick = (index: number) => {
    const st = scrollTriggerRef.current;
    if (!st || !st.end) return;
    const totalDistance = st.end - st.start;
    const progressPerFeature = 1 / 12;
    const targetProgress = index * progressPerFeature + progressPerFeature / 2;
    const scrollPos = st.start + totalDistance * targetProgress;
    window.scrollTo({ top: scrollPos, behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      data-scriptfx-features="true"
      className="relative z-[80] h-screen w-screen bg-transparent"
      style={{
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        marginTop: "-100svh",
      }}
    >
      {/* Panels wrapper - viewport sized */}
      <div className="relative h-full w-full px-6 py-6 md:px-12 md:py-12 overflow-hidden">
        {/* ===== PANEL: Features ===== */}
        <div
          ref={panel1Ref}
          className="absolute inset-6 md:inset-12 z-[75] rounded-[16px] border border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl ring-1 ring-white/5 overflow-hidden"
        >
          {/* ===== MOBILE LAYOUT ===== */}
          <div ref={mobileContentRef} className="flex h-full w-full flex-col overflow-y-auto p-4 md:hidden">
            {/* Hero Image/Visual Area */}
            <div className="flex aspect-[4/3] w-full shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30 mb-4">
              <div className="text-center">
                <p className="font-display text-[14px] text-on-surface-variant/60 font-light tracking-wide">
                  <span className="text-primary/60 text-xs block mb-1 font-mono uppercase tracking-widest">
                    Scene {features[activeFeature].id}
                  </span>
                  {features[activeFeature].title} - Content Placeholder
                </p>
              </div>
            </div>

            {/* Numbered Steps - Vertical Stack */}
            <div className="flex flex-col gap-2">
              {features.map((feature, index) => {
                const isActive = index === activeFeature;
                return (
                  <button
                    key={feature.id}
                    onClick={() => handleFeatureClick(index)}
                    className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all duration-300 ${isActive ? "bg-white/5 border border-white/10" : "opacity-50"}`}
                  >
                    {/* Circled Number */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${isActive ? "border-primary bg-primary text-white" : "border-on-surface-variant/50 text-on-surface-variant"}`}
                    >
                      <span className="font-display text-[14px] font-semibold">{feature.id}</span>
                    </div>

                    {/* Title & Description */}
                    <div className="flex flex-col gap-0.5 pt-1 min-w-0">
                      <h3
                        className={`font-display text-[16px] font-medium tracking-[-0.3px] uppercase ${isActive ? "text-on-surface" : "text-on-surface-variant"}`}
                      >
                        {feature.title}
                      </h3>
                      {isActive && (
                        <p className="font-body text-[13px] font-light leading-[1.4] text-on-surface-variant">
                          {feature.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ===== DESKTOP LAYOUT ===== */}
          <div className="relative hidden h-full w-full md:flex">
            {/* Left Panel - Feature List */}
            <div
              ref={leftPanelRef}
              className="flex w-[320px] flex-shrink-0 flex-col border-r border-white/10 p-8 md:w-[387px] md:p-12"
            >
              {/* Completed */}
              <div className="space-y-2">
                {features.slice(0, activeFeature).map((f) => {
                  const originalIndex = features.findIndex((item) => item.id === f.id);
                  return (
                    <div
                      key={f.id}
                      onClick={() => handleFeatureClick(originalIndex)}
                      className="flex cursor-pointer items-center gap-3 opacity-50 transition-all duration-200 hover:opacity-100 hover:translate-x-1"
                    >
                      <div className="flex h-[34px] w-[42px] items-center justify-center rounded-2xl bg-primary">
                        <span className="font-display text-[16px] font-medium text-white">{f.id}</span>
                      </div>
                      <span className="font-display text-[14px] font-medium uppercase tracking-[0.05em] text-on-surface-variant">
                        {f.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Active */}
              <div className="my-6 flex-1">
                <div className="mb-4 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-primary">
                  <span className="font-display text-[20px] font-medium text-white">{features[activeFeature].id}</span>
                </div>
                <h2 className="mb-3 font-display text-[36px] font-medium leading-[1.05] tracking-[-1.5px] text-on-surface md:text-[42px]">
                  {features[activeFeature].title}
                </h2>
                <p className="font-body text-[14px] font-light leading-[1.5] text-on-surface-variant md:text-[16px]">
                  {features[activeFeature].description}
                </p>
              </div>

              {/* Upcoming */}
              <div className="space-y-2">
                {features.slice(activeFeature + 1).map((f) => {
                  const originalIndex = features.findIndex((item) => item.id === f.id);
                  return (
                    <div
                      key={f.id}
                      onClick={() => handleFeatureClick(originalIndex)}
                      className="flex cursor-pointer items-center gap-3 opacity-50 transition-all duration-200 hover:opacity-100 hover:translate-x-1"
                    >
                      <div className="flex h-[34px] w-[42px] items-center justify-center rounded-2xl bg-primary">
                        <span className="font-display text-[16px] font-medium text-white">{f.id}</span>
                      </div>
                      <span className="font-display text-[14px] font-medium uppercase tracking-[0.05em] text-on-surface-variant">
                        {f.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Panel */}
            <div ref={rightPanelRef} className="flex flex-1 items-center justify-center p-8 relative overflow-hidden group">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 opacity-0 transition-opacity duration-700 group-hover:opacity-100 blur-3xl pointer-events-none" />
              <div key={activeFeature} className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                <p className="font-display text-[24px] text-on-surface-variant font-light tracking-wide">
                  <span className="text-primary/60 text-sm block mb-2 font-mono uppercase tracking-widest">
                    Scene {features[activeFeature].id}
                  </span>
                  {features[activeFeature].title} - Content Placeholder
                </p>
              </div>
            </div>
          </div>

          {/* Final Message - Centered (works on both mobile & desktop) */}
          <div ref={finalMessageRef} className="absolute inset-0 flex items-center justify-center invisible z-10">
            <div className="max-w-4xl text-center px-6 md:px-8">
              <h2 className="text-center font-display text-5xl font-medium leading-[1.15] tracking-tighter text-on-surface md:text-6xl">
                <span ref={finalPart1Ref} className="block">One workflow.</span>
                <span ref={finalPart2Ref} className="block">Any model.</span>
                <span ref={finalPart3Ref} className="block">Zero <span className="italic">churn.</span></span>
              </h2>
              <p ref={finalSubtextRef} className="mt-6 font-body text-[16px] font-light leading-[1.5] tracking-[-0.16px] text-on-surface/90 md:mt-8 md:text-[18px] md:leading-[24px] md:tracking-[-0.18px]">
                ScriptFX handles the models so you don't have to.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
