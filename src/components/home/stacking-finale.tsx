"use client";

import * as React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import Image from "next/image";
import { features } from "./features-data";
import { footerLinks } from "@/lib/footer-links";

gsap.registerPlugin(ScrollTrigger);

// ============== COMPONENT ==============

export function StackingFinale() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Panel 1: Features refs
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

  // Panel 2: Footer refs
  const panel2Ref = useRef<HTMLDivElement>(null);
  const showDontTellRef = useRef<HTMLDivElement>(null);
  const showRef = useRef<HTMLSpanElement>(null);
  const dontTellRef = useRef<HTMLSpanElement>(null);
  const waitlistTextRef = useRef<HTMLDivElement>(null);
  const joinRef = useRef<HTMLSpanElement>(null);
  const waitlistRef = useRef<HTMLSpanElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const footerContentRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

      const panel2 = panel2Ref.current;
      const isDesktop = window.innerWidth >= 768;

      // ===== INITIAL STATES =====
      
      // Panel 1 (Features) - starts visible
      if (finalMessageRef.current) gsap.set(finalMessageRef.current, { autoAlpha: 0 });
      if (finalPart1Ref.current) gsap.set(finalPart1Ref.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      if (finalPart2Ref.current) gsap.set(finalPart2Ref.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      if (finalPart3Ref.current) gsap.set(finalPart3Ref.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      if (finalSubtextRef.current) gsap.set(finalSubtextRef.current, { autoAlpha: 0, y: 20, filter: "blur(8px)" });

      // Panel 2 (Footer) - starts completely below viewport
      if (panel2) gsap.set(panel2, { yPercent: 110 });
      
      // Show Don't Tell - starts hidden, "Show." appears first
      if (showRef.current) gsap.set(showRef.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      if (dontTellRef.current) gsap.set(dontTellRef.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      
      // Waitlist text - starts hidden
      if (waitlistTextRef.current) gsap.set(waitlistTextRef.current, { autoAlpha: 0 });
      if (joinRef.current) gsap.set(joinRef.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      if (waitlistRef.current) gsap.set(waitlistRef.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      
      // Form - starts hidden, fades in with panel
      if (formRef.current) gsap.set(formRef.current, { autoAlpha: 0, y: 20 });

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
      // Total phases: 6 features + 6 final message hold + 3 footer slide + 3 show don't tell + 3 waitlist = 21
      const totalPhases = 21;

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
            
            // Reset panel 2 - keep it hidden below
            if (panel2) gsap.set(panel2, { yPercent: 110 });
            
            // Reset final message
            if (finalMessageRef.current) gsap.set(finalMessageRef.current, { autoAlpha: 0 });
            // Only animate desktop panels on desktop
            if (isDesktop && leftPanelRef.current) gsap.set(leftPanelRef.current, { autoAlpha: 1, x: 0, filter: "blur(0px)" });
            if (isDesktop && rightPanelRef.current) gsap.set(rightPanelRef.current, { autoAlpha: 1, x: 0, filter: "blur(0px)" });
            // Reset mobile content
            if (!isDesktop && mobileContentRef.current) gsap.set(mobileContentRef.current, { autoAlpha: 1, filter: "blur(0px)" });
          }
          // ===== PHASE 2: Final Message Reveal (6-12) =====
          else if (phase < 12) {
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

            // Reset panel 2 - keep it hidden below
            if (panel2) gsap.set(panel2, { yPercent: 110 });
          }
          // ===== PHASE 3: Footer slides up with "Show." first (12-15) =====
          else if (phase < 15) {
            const localProgress = (phase - 12) / 3;
            
            // Hide nav when footer starts appearing
            if (localProgress > 0.1) {
              window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { detail: { visible: false } }));
            }
            
            // Panel 2 (Footer) slides up from 110% to 0%
            if (panel2) {
              const yPercent = 110 * (1 - localProgress);
              gsap.set(panel2, { yPercent });
            }
            
            // Keep waitlist text hidden
            if (waitlistTextRef.current) gsap.set(waitlistTextRef.current, { autoAlpha: 0 });
            
            // "Show." appears early as panel slides up
            if (showRef.current) {
              const p = Math.max(0, Math.min((localProgress - 0.1) * 5, 1));
              gsap.set(showRef.current, { autoAlpha: p, y: 30 * (1 - p), filter: `blur(${12 * (1 - p)}px)` });
            }
            // "Don't Tell." stays hidden in this phase
            if (dontTellRef.current) {
              gsap.set(dontTellRef.current, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
            }
            
            // Form fades in with panel
            if (formRef.current) {
              const p = Math.max(0, Math.min((localProgress - 0.5) * 3, 1));
              gsap.set(formRef.current, { autoAlpha: p, y: 20 * (1 - p) });
            }
          }
          // ===== PHASE 4: Hold "Show." then reveal "Don't Tell." (15-18) =====
          else if (phase < 18) {
            const localProgress = (phase - 15) / 3;
            
            // Keep nav hidden while footer is visible
            window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { detail: { visible: false } }));
            
            // Keep panel 2 at top
            if (panel2) gsap.set(panel2, { yPercent: 0 });
            
            // Keep "Show." visible
            if (showRef.current) gsap.set(showRef.current, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
            
            // "Don't Tell." fades in partway through this phase
            if (dontTellRef.current) {
              const p = Math.max(0, Math.min((localProgress - 0.3) * 3, 1));
              gsap.set(dontTellRef.current, { autoAlpha: p, y: 30 * (1 - p), filter: `blur(${12 * (1 - p)}px)` });
            }
            
            // Keep waitlist text hidden
            if (waitlistTextRef.current) gsap.set(waitlistTextRef.current, { autoAlpha: 0 });
            
            // Keep form visible
            if (formRef.current) gsap.set(formRef.current, { autoAlpha: 1, y: 0 });
          }
          // ===== PHASE 5: Transition to Waitlist (18-21) =====
          else {
            const localProgress = (phase - 18) / 3;
            
            // Keep nav hidden while footer is visible
            window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { detail: { visible: false } }));
            
            // Keep panel 2 at top
            if (panel2) gsap.set(panel2, { yPercent: 0 });
            
            // Fade out Show Don't Tell
            if (showRef.current) {
              const p = 1 - localProgress;
              gsap.set(showRef.current, { autoAlpha: p, y: -20 * localProgress, filter: `blur(${10 * localProgress}px)` });
            }
            if (dontTellRef.current) {
              const p = 1 - localProgress;
              gsap.set(dontTellRef.current, { autoAlpha: p, y: -20 * localProgress, filter: `blur(${10 * localProgress}px)` });
            }
            
            // Fade in Waitlist text
            if (waitlistTextRef.current) {
              const p = Math.max(0, Math.min((localProgress - 0.2) * 2, 1));
              gsap.set(waitlistTextRef.current, { autoAlpha: p });
            }
            if (joinRef.current) {
              const p = Math.max(0, Math.min((localProgress - 0.25) * 3, 1));
              gsap.set(joinRef.current, { autoAlpha: p, y: 30 * (1 - p), filter: `blur(${12 * (1 - p)}px)` });
            }
            if (waitlistRef.current) {
              const p = Math.max(0, Math.min((localProgress - 0.4) * 3, 1));
              gsap.set(waitlistRef.current, { autoAlpha: p, y: 30 * (1 - p), filter: `blur(${12 * (1 - p)}px)` });
            }
            
            // Keep form visible
            if (formRef.current) gsap.set(formRef.current, { autoAlpha: 1, y: 0 });
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
        onLeave: (self) => {
          // Snap back to the end of the pin to prevent scrolling past it
          window.scrollTo({ top: self.end, behavior: "instant" });
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
    const progressPerFeature = 1 / 21;
    const targetProgress = index * progressPerFeature + progressPerFeature / 2;
    const scrollPos = st.start + totalDistance * targetProgress;
    window.scrollTo({ top: scrollPos, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <section
      ref={containerRef}
      data-scriptfx-stacking-finale="true"
      className="relative z-[80] h-screen w-screen bg-transparent"
      style={{
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        marginTop: "-100svh",
      }}
    >
      {/* Panels wrapper - viewport sized */}
      <div className="relative h-full w-full px-6 py-6 md:px-12 md:py-12 overflow-hidden">
        
        {/* ===== PANEL 1: Features (base layer) ===== */}
        <div
          ref={panel1Ref}
          data-scriptfx-features="true"
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
                    className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all duration-300 ${isActive ? 'bg-white/5 border border-white/10' : 'opacity-50'}`}
                  >
                    {/* Circled Number */}
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${isActive ? 'border-primary bg-primary text-white' : 'border-on-surface-variant/50 text-on-surface-vo Variant'}`}>
                      <span className="font-display text-[14px] font-semibold">
                        {feature.id}
                      </span>
                    </div>
                    
                    {/* Title & Description */}
                    <div className="flex flex-col gap-0.5 pt-1 min-w-0">
                      <h3 className={`font-display text-[16px] font-medium tracking-[-0.3px] uppercase ${isActive ? 'text-on-surface' : 'text-on-surface-variant'}`}>
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
              <h2 className="text-center font-display text-[48px] font-medium leading-[1.15] tracking-[-1.2px] text-on-surface md:text-[68px] md:tracking-[-2.4px]">
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

        {/* ===== PANEL 2: Footer (slides up on top) ===== */}
        <div
          ref={panel2Ref}
          className="absolute inset-6 md:inset-12 z-[76] rounded-[16px] shadow-2xl transform-gpu will-change-transform border border-border bg-secondary-container"
          style={{ 
            overflow: "hidden",
          }}
        >
          <div className="relative z-10 w-full h-full flex flex-col p-8 md:p-20 overflow-hidden">
            {/* Launch date - top right */}
            <div className="absolute top-8 right-8 md:top-12 md:right-12">
              <p className="font-body text-[11px] tracking-[0.3px] text-on-surface-variant text-right leading-tight">
                Launching Q1 2026
              </p>
            </div>

            {/* Center content - takes remaining space and centers */}
            <div className="flex-1 flex flex-col items-center justify-center relative">
              {/* Text container - holds both Show Don't Tell and Waitlist text */}
              <div className="relative h-[200px] md:h-[250px] w-full flex items-center justify-center mb-8">
                {/* Stop pitching ideas. Ship experiences. - centered */}
                <div ref={showDontTellRef} className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-center font-display text-[48px] md:text-[68px] font-medium leading-[1.15] tracking-[-1.2px] md:tracking-[-2.4px] text-on-surface">
                    <span ref={showRef} className="block">Stop pitching ideas.</span>
                    <span ref={dontTellRef} className="block">Ship <span className="italic">experiences.</span></span>
                  </h2>
                </div>
                
                {/* Join the Waitlist text - centered */}
                <div ref={waitlistTextRef} className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-center font-display text-[48px] md:text-[68px] font-medium leading-[1.15] tracking-[-1.2px] md:tracking-[-2.4px] text-on-surface">
                    <span ref={joinRef} className="block">Join the</span>
                    <span ref={waitlistRef} className="block"><span className="italic">Waitlist.</span></span>
                  </h2>
                </div>
              </div>

              {/* Email form - always below the text */}
              <form ref={formRef} onSubmit={handleSubmit} className="w-full max-w-[300px] flex flex-col items-center gap-4">
                {!submitted ? (
                  <>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border border-on-surface/30 rounded-full py-3 px-6 text-center text-on-surface font-body text-[14px] outline-none placeholder:text-on-surface-variant transition-all duration-200 disabled:opacity-50 focus:border-accent focus:ring-1 focus:ring-accent/30 focus:bg-accent/5 invalid:border-error invalid:focus:ring-error/30"
                      disabled={isSubmitting}
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !email}
                      className="w-full px-8 bg-on-surface text-surface py-3 rounded-full font-body text-[12px] tracking-[1px] uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-on-surface/90 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                  </>
                ) : (
                  <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <p className="text-on-surface font-body text-[14px] mb-2">✓ You&apos;re on the list!</p>
                    <p className="text-on-surface-variant font-body text-[12px]">We&apos;ll be in touch soon.</p>
                  </div>
                )}
              </form>
            </div>

            {/* Footer content */}
            <div ref={footerContentRef} className="grid grid-cols-3 lg:grid-cols-4 gap-4 text-on-surface pt-8 border-t border-border">
              <div className="col-span-3 lg:col-span-1 flex flex-col justify-between h-full order-first mb-4 lg:mb-0">
                <Link href="/" className="hover:opacity-80 transition-opacity">
                  <Image
                    src="/brand/scriptfx-logo.svg"
                    alt="ScriptFX"
                    width={88}
                    height={21}
                  />
                </Link>
                <p className="font-body text-[11px] text-on-surface-variant mt-2 lg:mt-0">© {new Date().getFullYear()} ScriptFX, Inc.</p>
              </div>
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category} className="col-span-1 flex flex-col gap-3 text-left">
                  <p className="font-body text-[11px] tracking-[0.5px] text-on-surface-variant">{category}</p>
                  {links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="font-body text-[11px] underline hover:text-on-surface-variant transition-colors"
                      {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
