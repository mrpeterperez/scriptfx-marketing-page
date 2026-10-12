"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { features } from "./features-data";
import { YourWayStack } from "../your-way/your-way-stack";

gsap.registerPlugin(ScrollTrigger);

export function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  // Panel refs
  const panel1Ref = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const mobileContentRef = useRef<HTMLDivElement>(null);
  const [activeFeature, setActiveFeature] = useState(0);

  // "One workflow" message refs
  const workflowMessageRef = useRef<HTMLDivElement>(null);
  const workflowPart1Ref = useRef<HTMLSpanElement>(null);
  const workflowPart2Ref = useRef<HTMLSpanElement>(null);
  const workflowPart3Ref = useRef<HTMLSpanElement>(null);
  const workflowSubtextRef = useRef<HTMLParagraphElement>(null);

  // "Your Script. Any Setup." refs
  const yourWaySectionRef = useRef<HTMLDivElement>(null);
  const yourWayHeadline1Ref = useRef<HTMLSpanElement>(null);
  const yourWayHeadline2Ref = useRef<HTMLSpanElement>(null);
  const yourWaySubtextRef = useRef<HTMLParagraphElement>(null);
  const yourWayColumnsRef = useRef<HTMLDivElement>(null);
  const yourWayColumnRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const isDesktop = window.innerWidth >= 768;

      // ===== INITIAL STATES =====
      // "One workflow" message - hidden
      if (workflowMessageRef.current) gsap.set(workflowMessageRef.current, { autoAlpha: 0 });
      if (workflowPart1Ref.current) gsap.set(workflowPart1Ref.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      if (workflowPart2Ref.current) gsap.set(workflowPart2Ref.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      if (workflowPart3Ref.current) gsap.set(workflowPart3Ref.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      if (workflowSubtextRef.current) gsap.set(workflowSubtextRef.current, { autoAlpha: 0, y: 20, filter: "blur(8px)" });

      // "Your Script. Any Setup." - hidden, columns start with height 0 so headline can be centered
      if (yourWaySectionRef.current) gsap.set(yourWaySectionRef.current, { autoAlpha: 0 });
      if (yourWayHeadline1Ref.current) gsap.set(yourWayHeadline1Ref.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      if (yourWayHeadline2Ref.current) gsap.set(yourWayHeadline2Ref.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      if (yourWaySubtextRef.current) gsap.set(yourWaySubtextRef.current, { autoAlpha: 0, y: 20, filter: "blur(8px)" });
      if (yourWayColumnsRef.current) gsap.set(yourWayColumnsRef.current, { autoAlpha: 0, height: 0, marginTop: 0, overflow: "hidden" });
      yourWayColumnRefs.current.forEach((col) => {
        if (col) gsap.set(col, { autoAlpha: 0, y: 50, filter: "blur(8px)" });
      });

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
      // Total phases: 6 features + 4 workflow + 2 headline + 2 hold + 2 laptop + 2 hold + 2 gear + 2 hold + 2 studio + 2 hold = 26
      const totalPhases = 26;

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

            // Reset messages
            if (workflowMessageRef.current) gsap.set(workflowMessageRef.current, { autoAlpha: 0 });
            if (yourWaySectionRef.current) gsap.set(yourWaySectionRef.current, { autoAlpha: 0 });

            // Only animate desktop panels on desktop
            if (isDesktop && leftPanelRef.current) gsap.set(leftPanelRef.current, { autoAlpha: 1, x: 0, filter: "blur(0px)" });
            if (isDesktop && rightPanelRef.current) gsap.set(rightPanelRef.current, { autoAlpha: 1, x: 0, filter: "blur(0px)" });
            // Reset mobile content
            if (!isDesktop && mobileContentRef.current) gsap.set(mobileContentRef.current, { autoAlpha: 1, filter: "blur(0px)" });
          }
          // ===== PHASE 2: "One workflow" Message Reveal (6-10) =====
          else if (phase < 10) {
            const localProgress = (phase - 6) / 4;
            setActiveFeature(features.length - 1);

            // Show nav on desktop, hide on mobile
            window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { detail: { visible: isDesktop } }));

            // Panels slide out, workflow message fades in
            const panelProgress = Math.min(localProgress * 4, 1);
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

            // Workflow message fades in
            if (workflowMessageRef.current) {
              gsap.set(workflowMessageRef.current, { autoAlpha: Math.min(panelProgress * 2, 1) });
            }

            // Staggered text reveals
            if (workflowPart1Ref.current) {
              const p = Math.max(0, Math.min((localProgress - 0.1) * 8, 1));
              gsap.set(workflowPart1Ref.current, { autoAlpha: p, y: 30 * (1 - p), filter: `blur(${12 * (1 - p)}px)` });
            }
            if (workflowPart2Ref.current) {
              const p = Math.max(0, Math.min((localProgress - 0.18) * 8, 1));
              gsap.set(workflowPart2Ref.current, { autoAlpha: p, y: 30 * (1 - p), filter: `blur(${12 * (1 - p)}px)` });
            }
            if (workflowPart3Ref.current) {
              const p = Math.max(0, Math.min((localProgress - 0.26) * 8, 1));
              gsap.set(workflowPart3Ref.current, { autoAlpha: p, y: 30 * (1 - p), filter: `blur(${12 * (1 - p)}px)` });
            }
            if (workflowSubtextRef.current) {
              const p = Math.max(0, Math.min((localProgress - 0.34) * 8, 1));
              gsap.set(workflowSubtextRef.current, { autoAlpha: p, y: 20 * (1 - p), filter: `blur(${8 * (1 - p)}px)` });
            }

            // Your Way stays hidden
            if (yourWaySectionRef.current) gsap.set(yourWaySectionRef.current, { autoAlpha: 0 });
          }
          // ===== PHASE 3: Fade out workflow, fade in Your Script headline CENTERED (10-12) =====
          else if (phase < 12) {
            const localProgress = (phase - 10) / 2;

            // Show nav on desktop, hide on mobile
            window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { detail: { visible: isDesktop } }));

            // Fade out "One workflow" message
            const fadeOutProgress = Math.min(localProgress * 2, 1);
            if (workflowMessageRef.current) {
              gsap.set(workflowMessageRef.current, { autoAlpha: 1 - fadeOutProgress });
            }

            // Fade in "Your Script. Any Setup." section
            if (yourWaySectionRef.current) {
              gsap.set(yourWaySectionRef.current, { autoAlpha: Math.min(localProgress * 2, 1) });
            }

            // Headline reveals - CENTERED (columns hidden with height 0)
            if (yourWayHeadline1Ref.current) {
              const p = Math.max(0, Math.min((localProgress - 0.1) * 4, 1));
              gsap.set(yourWayHeadline1Ref.current, { autoAlpha: p, y: 30 * (1 - p), filter: `blur(${12 * (1 - p)}px)` });
            }
            if (yourWayHeadline2Ref.current) {
              const p = Math.max(0, Math.min((localProgress - 0.3) * 4, 1));
              gsap.set(yourWayHeadline2Ref.current, { autoAlpha: p, y: 30 * (1 - p), filter: `blur(${12 * (1 - p)}px)` });
            }
            if (yourWaySubtextRef.current) {
              const p = Math.max(0, Math.min((localProgress - 0.5) * 4, 1));
              gsap.set(yourWaySubtextRef.current, { autoAlpha: p, y: 20 * (1 - p), filter: `blur(${8 * (1 - p)}px)` });
            }

            // Columns stay hidden (height: 0 so headline stays centered)
            if (yourWayColumnsRef.current) {
              gsap.set(yourWayColumnsRef.current, { autoAlpha: 0, height: 0, marginTop: 0, overflow: "hidden" });
            }
            yourWayColumnRefs.current.forEach((col) => {
              if (col) gsap.set(col, { autoAlpha: 0, y: 50, filter: "blur(8px)" });
            });
          }
          // ===== PHASE 4: HOLD headline centered (12-14) =====
          else if (phase < 14) {
            window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { detail: { visible: isDesktop } }));
            if (workflowMessageRef.current) gsap.set(workflowMessageRef.current, { autoAlpha: 0 });
            if (yourWaySectionRef.current) gsap.set(yourWaySectionRef.current, { autoAlpha: 1 });
            if (yourWayHeadline1Ref.current) gsap.set(yourWayHeadline1Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (yourWayHeadline2Ref.current) gsap.set(yourWayHeadline2Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (yourWaySubtextRef.current) gsap.set(yourWaySubtextRef.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            // Columns hidden
            if (yourWayColumnsRef.current) gsap.set(yourWayColumnsRef.current, { autoAlpha: 0, height: 0, marginTop: 0, overflow: "hidden" });
            yourWayColumnRefs.current.forEach((col) => {
              if (col) gsap.set(col, { autoAlpha: 0, y: 50, filter: "blur(8px)" });
            });
          }
          // ===== PHASE 5: Card 1 (Laptop) appears, pushes headline up (14-16) =====
          else if (phase < 16) {
            const p = (phase - 14) / 2;
            const eased = 1 - Math.pow(1 - p, 3);
            window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { detail: { visible: isDesktop } }));
            if (workflowMessageRef.current) gsap.set(workflowMessageRef.current, { autoAlpha: 0 });
            if (yourWaySectionRef.current) gsap.set(yourWaySectionRef.current, { autoAlpha: 1 });
            if (yourWayHeadline1Ref.current) gsap.set(yourWayHeadline1Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (yourWayHeadline2Ref.current) gsap.set(yourWayHeadline2Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (yourWaySubtextRef.current) gsap.set(yourWaySubtextRef.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            // Container expands
            if (yourWayColumnsRef.current) gsap.set(yourWayColumnsRef.current, { autoAlpha: 1, height: "auto", marginTop: 48 * eased, overflow: "visible" });
            // Only card 0 fades in
            yourWayColumnRefs.current.forEach((col, i) => {
              if (!col) return;
              if (i === 0) {
                gsap.set(col, { autoAlpha: eased, y: 50 * (1 - eased), filter: `blur(${8 * (1 - eased)}px)` });
              } else {
                gsap.set(col, { autoAlpha: 0, y: 50, filter: "blur(8px)" });
              }
            });
          }
          // ===== PHASE 6: HOLD - Laptop moment (16-18) =====
          else if (phase < 18) {
            window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { detail: { visible: isDesktop } }));
            if (workflowMessageRef.current) gsap.set(workflowMessageRef.current, { autoAlpha: 0 });
            if (yourWaySectionRef.current) gsap.set(yourWaySectionRef.current, { autoAlpha: 1 });
            if (yourWayHeadline1Ref.current) gsap.set(yourWayHeadline1Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (yourWayHeadline2Ref.current) gsap.set(yourWayHeadline2Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (yourWaySubtextRef.current) gsap.set(yourWaySubtextRef.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (yourWayColumnsRef.current) gsap.set(yourWayColumnsRef.current, { autoAlpha: 1, height: "auto", marginTop: 48, overflow: "visible" });
            yourWayColumnRefs.current.forEach((col, i) => {
              if (!col) return;
              gsap.set(col, i === 0 ? { autoAlpha: 1, y: 0, filter: "blur(0px)" } : { autoAlpha: 0, y: 50, filter: "blur(8px)" });
            });
          }
          // ===== PHASE 7: Card 2 (Gear) appears (18-20) =====
          else if (phase < 20) {
            const p = (phase - 18) / 2;
            const eased = 1 - Math.pow(1 - p, 3);
            window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { detail: { visible: isDesktop } }));
            if (workflowMessageRef.current) gsap.set(workflowMessageRef.current, { autoAlpha: 0 });
            if (yourWaySectionRef.current) gsap.set(yourWaySectionRef.current, { autoAlpha: 1 });
            if (yourWayHeadline1Ref.current) gsap.set(yourWayHeadline1Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (yourWayHeadline2Ref.current) gsap.set(yourWayHeadline2Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (yourWaySubtextRef.current) gsap.set(yourWaySubtextRef.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (yourWayColumnsRef.current) gsap.set(yourWayColumnsRef.current, { autoAlpha: 1, height: "auto", marginTop: 48, overflow: "visible" });
            yourWayColumnRefs.current.forEach((col, i) => {
              if (!col) return;
              if (i === 0) {
                gsap.set(col, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
              } else if (i === 1) {
                gsap.set(col, { autoAlpha: eased, y: 50 * (1 - eased), filter: `blur(${8 * (1 - eased)}px)` });
              } else {
                gsap.set(col, { autoAlpha: 0, y: 50, filter: "blur(8px)" });
              }
            });
          }
          // ===== PHASE 8: HOLD - Gear moment (20-22) =====
          else if (phase < 22) {
            window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { detail: { visible: isDesktop } }));
            if (workflowMessageRef.current) gsap.set(workflowMessageRef.current, { autoAlpha: 0 });
            if (yourWaySectionRef.current) gsap.set(yourWaySectionRef.current, { autoAlpha: 1 });
            if (yourWayHeadline1Ref.current) gsap.set(yourWayHeadline1Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (yourWayHeadline2Ref.current) gsap.set(yourWayHeadline2Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (yourWaySubtextRef.current) gsap.set(yourWaySubtextRef.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (yourWayColumnsRef.current) gsap.set(yourWayColumnsRef.current, { autoAlpha: 1, height: "auto", marginTop: 48, overflow: "visible" });
            yourWayColumnRefs.current.forEach((col, i) => {
              if (!col) return;
              gsap.set(col, i <= 1 ? { autoAlpha: 1, y: 0, filter: "blur(0px)" } : { autoAlpha: 0, y: 50, filter: "blur(8px)" });
            });
          }
          // ===== PHASE 9: Card 3 (Studio) appears (22-24) =====
          else if (phase < 24) {
            const p = (phase - 22) / 2;
            const eased = 1 - Math.pow(1 - p, 3);
            window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { detail: { visible: isDesktop } }));
            if (workflowMessageRef.current) gsap.set(workflowMessageRef.current, { autoAlpha: 0 });
            if (yourWaySectionRef.current) gsap.set(yourWaySectionRef.current, { autoAlpha: 1 });
            if (yourWayHeadline1Ref.current) gsap.set(yourWayHeadline1Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (yourWayHeadline2Ref.current) gsap.set(yourWayHeadline2Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (yourWaySubtextRef.current) gsap.set(yourWaySubtextRef.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (yourWayColumnsRef.current) gsap.set(yourWayColumnsRef.current, { autoAlpha: 1, height: "auto", marginTop: 48, overflow: "visible" });
            yourWayColumnRefs.current.forEach((col, i) => {
              if (!col) return;
              if (i <= 1) {
                gsap.set(col, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
              } else {
                gsap.set(col, { autoAlpha: eased, y: 50 * (1 - eased), filter: `blur(${8 * (1 - eased)}px)` });
              }
            });
          }
          // ===== PHASE 10: HOLD - All cards final (24+) =====
          else {
            window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { detail: { visible: isDesktop } }));
            if (workflowMessageRef.current) gsap.set(workflowMessageRef.current, { autoAlpha: 0 });
            if (yourWaySectionRef.current) gsap.set(yourWaySectionRef.current, { autoAlpha: 1 });
            if (yourWayHeadline1Ref.current) gsap.set(yourWayHeadline1Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (yourWayHeadline2Ref.current) gsap.set(yourWayHeadline2Ref.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (yourWaySubtextRef.current) gsap.set(yourWaySubtextRef.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            if (yourWayColumnsRef.current) gsap.set(yourWayColumnsRef.current, { autoAlpha: 1, height: "auto", marginTop: 48, overflow: "visible" });
            yourWayColumnRefs.current.forEach((col) => {
              if (col) gsap.set(col, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            });
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
    const progressPerFeature = 1 / 16;
    const targetProgress = index * progressPerFeature + progressPerFeature / 2;
    const scrollPos = st.start + totalDistance * targetProgress;
    window.scrollTo({ top: scrollPos, behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      data-cinematic-features="true"
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
          className="absolute inset-x-6 inset-y-[calc(5%+21.6px)] md:inset-x-12 md:inset-y-[calc(5%+43.2px)] z-[75] rounded-[16px] border border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl ring-1 ring-white/5 overflow-hidden"
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

          {/* ===== "One workflow. Any model. Zero churn." Message ===== */}
          <div ref={workflowMessageRef} className="absolute inset-0 flex items-center justify-center invisible z-10">
            <div className="max-w-4xl text-center px-6 md:px-8">
              <h2 className="text-center font-display text-5xl font-medium leading-[1.15] tracking-tighter text-on-surface md:text-6xl">
                <span ref={workflowPart1Ref} className="block transform-gpu will-change-transform">One workflow.</span>
                <span ref={workflowPart2Ref} className="block transform-gpu will-change-transform">Any model.</span>
                <span ref={workflowPart3Ref} className="block transform-gpu will-change-transform">Zero <span className="italic">churn.</span></span>
              </h2>
              <p ref={workflowSubtextRef} className="mt-6 font-body text-[16px] font-light leading-[1.5] tracking-[-0.16px] text-on-surface/90 md:mt-8 md:text-[18px] md:leading-[24px] md:tracking-[-0.18px]">
                ScriptFX handles the models so you don&apos;t have to.
              </p>
            </div>
          </div>

          {/* ===== "Your Script. Any Setup." + Columns ===== */}
          <div ref={yourWaySectionRef} className="absolute inset-0 flex flex-col items-center justify-center invisible z-10 overflow-hidden">
            {/* Headline - no bottom margin so it's truly centered when columns are hidden */}
            <div className="text-center max-w-3xl px-6">
              <h2 className="font-display text-5xl font-medium leading-[1.15] tracking-tighter text-on-surface md:text-6xl">
                <span ref={yourWayHeadline1Ref} className="block transform-gpu will-change-transform">Your Script.</span>
                <span ref={yourWayHeadline2Ref} className="block transform-gpu will-change-transform">Any <span className="italic">Setup.</span></span>
              </h2>
              <p ref={yourWaySubtextRef} className="mt-4 font-body text-[16px] font-light leading-[1.5] tracking-[-0.16px] text-on-surface/80 md:mt-6 md:text-[18px]">
                Generate it straight from the script, or shoot it for real.
              </p>
            </div>

            {/* Columns */}
            <div
              ref={yourWayColumnsRef}
              className="w-full px-6 md:px-12 lg:px-20"
            >
              <YourWayStack registerCard={(i, el) => { yourWayColumnRefs.current[i] = el; }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
