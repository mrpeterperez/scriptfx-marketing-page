"use client";

import * as React from "react";
import { useRef, useLayoutEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { features } from "./features-data";

gsap.registerPlugin(ScrollTrigger);

interface FeaturesSectionProps {
  className?: string;
}

export function FeaturesSection({ className }: FeaturesSectionProps) {
  const [activeFeature, setActiveFeature] = useState(0);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const finalMessageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!scrollContainerRef.current) return;

      // Set initial states for GSAP animations
      if (finalMessageRef.current) {
        gsap.set(finalMessageRef.current, {
          autoAlpha: 0,
          y: 40,
          filter: "blur(10px)",
        });
      }

      // Total scroll phases: 6 features + 1 final message = 7
      const totalPhases = features.length + 1;

      // Create scroll trigger that changes active feature based on scroll position
      ScrollTrigger.create({
        trigger: scrollContainerRef.current,
        start: "top top",
        end: `+=${totalPhases * 100}%`,
        pin: containerRef.current,
        scrub: true,
        onUpdate: (self) => {
          // Calculate which feature should be active based on scroll progress
          const phase = self.progress * totalPhases;
          
          if (phase >= features.length) {
            // Final message phase
            setShowFinalMessage(true);
            setActiveFeature(features.length - 1);
          } else {
            setShowFinalMessage(false);
            const featureIndex = Math.min(
              Math.floor(phase),
              features.length - 1
            );
            setActiveFeature(featureIndex);
          }
        },
      });
    }, scrollContainerRef);

    return () => ctx.revert();
  }, []);

  // Animate panels based on showFinalMessage state
  useLayoutEffect(() => {
    if (!leftPanelRef.current || !rightPanelRef.current || !finalMessageRef.current) return;

    // Kill any existing animations on these elements
    gsap.killTweensOf([leftPanelRef.current, rightPanelRef.current, finalMessageRef.current]);

    if (showFinalMessage) {
      // Fade out left and right panels
      gsap.to(leftPanelRef.current, {
        autoAlpha: 0,
        x: -50,
        filter: "blur(10px)",
        duration: 0.6,
        ease: "power2.inOut",
      });
      gsap.to(rightPanelRef.current, {
        autoAlpha: 0,
        x: 50,
        filter: "blur(10px)",
        duration: 0.6,
        ease: "power2.inOut",
      });
      // Fade in final message
      gsap.to(finalMessageRef.current, {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power2.out",
        delay: 0.3,
      });
    } else {
      // Fade in panels
      gsap.to(leftPanelRef.current, {
        autoAlpha: 1,
        x: 0,
        filter: "blur(0px)",
        duration: 0.5,
        ease: "power2.out",
      });
      gsap.to(rightPanelRef.current, {
        autoAlpha: 1,
        x: 0,
        filter: "blur(0px)",
        duration: 0.5,
        ease: "power2.out",
      });
      // Fade out final message
      gsap.to(finalMessageRef.current, {
        autoAlpha: 0,
        y: 40,
        filter: "blur(10px)",
        duration: 0.4,
        ease: "power2.inOut",
      });
    }
  }, [showFinalMessage]);

  // Total scroll phases: 6 features + 1 final message = 7
  const totalPhases = features.length + 1;

  return (
    <div
      ref={scrollContainerRef}
      className={`relative ${className ?? ""}`}
      style={{ height: `${totalPhases * 100}vh` }}
    >
      <div
        ref={containerRef}
        className="h-screen w-full"
      >
        <div className="relative flex h-full w-full flex-col gap-3 overflow-y-auto p-4 md:flex-row md:gap-5 md:overflow-visible md:p-5">
          {/* Left Panel - ~387px (Desktop Only) */}
          <div
            ref={leftPanelRef}
            className="hidden w-full flex-shrink-0 flex-col justify-between rounded-2xl md:flex md:border md:border-border md:bg-secondary-container md:p-10 md:w-[387px]"
          >
            {/* Desktop Layout (Hidden on Mobile) */}
            <div className="hidden h-full flex-col justify-between md:flex">
              {/* Active Feature - Top Section */}
              <div>
                {/* Number Badge */}
                <div className="mb-4 flex h-[34px] w-[50px] items-center justify-center rounded-2xl bg-primary md:mb-6">
                  <span className="font-body text-[16px] font-medium tracking-[-0.64px] text-white">
                    {activeFeature + 1}
                  </span>
                </div>

                {/* Headline */}
                <h2 className="mb-3 font-display text-[32px] font-medium italic leading-[1.1] tracking-[-1.2px] text-on-surface md:mb-4 md:text-[48px] md:tracking-[-1.92px]">
                  {features[activeFeature].headline}
                </h2>

                {/* Description */}
                <p className="font-body text-[18px] font-light leading-[1.4] tracking-[-0.6px] text-on-surface-variant md:text-[24px] md:tracking-[-0.96px]">
                  {features[activeFeature].description}
                </p>
              </div>

              {/* Other Features List - Bottom */}
              <nav className="mt-6 space-y-2 md:mt-0">
                {features.map((feature, index) => {
                  // Skip the active feature
                  if (index === activeFeature) return null;

                  return (
                    <button
                      key={feature.id}
                      onClick={() => setActiveFeature(index)}
                      className="flex w-full items-center gap-3 text-left transition-all duration-200 hover:opacity-80"
                    >
                      {/* Number Badge */}
                      <div className="flex h-[34px] w-[42px] items-center justify-center rounded-2xl bg-primary">
                        <span className="font-body text-[16px] font-medium tracking-[-0.64px] text-white">
                          {feature.id}
                        </span>
                      </div>
                      {/* Title */}
                      <span className="font-body text-[20px] font-medium tracking-[-0.8px] text-on-surface-variant md:text-[28px] md:tracking-[-1.12px]">
                        {feature.title}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Layout - Hidden (see new mobile layout below) */}
            <div className="hidden">
              {/* Desktop controls mobile via scroll on desktop */}
            </div>
          </div>

          {/* Right Panel - App Preview (Desktop) */}
          <div
            ref={rightPanelRef}
            className="hidden flex-1 shrink-0 items-center justify-center rounded-2xl border border-border bg-secondary-container md:flex"
          >
            {/* Content placeholder - will show app UI */}
            <span className="text-on-surface-variant opacity-50">Feature Visual {activeFeature + 1}</span>
          </div>

          {/* Mobile Layout - Image on top, numbered steps below */}
          <div className="flex h-full w-full flex-col gap-4 md:hidden">
            {/* Hero Image/Visual Area */}
            <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-border bg-secondary-container">
              <span className="text-on-surface-variant opacity-50">Image Placeholder</span>
            </div>

            {/* Numbered Steps - Vertical Stack */}
            <div className="flex flex-col gap-3">
              {features.map((feature, index) => {
                const isActive = index === activeFeature;
                return (
                  <button
                    key={feature.id}
                    onClick={() => setActiveFeature(index)}
                    className={`flex w-full items-start gap-4 rounded-xl p-3 text-left transition-all duration-300 ${isActive ? 'bg-secondary-container border border-border' : 'opacity-60'}`}
                  >
                    {/* Circled Number */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${isActive ? 'border-primary bg-primary text-white' : 'border-on-surface-variant text-on-surface-variant'}`}>
                      <span className="font-body text-[16px] font-semibold">
                        {feature.id}
                      </span>
                    </div>
                    
                    {/* Title & Description */}
                    <div className="flex flex-col gap-1 pt-1">
                      <h3 className={`font-display text-[18px] font-medium tracking-[-0.5px] ${isActive ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {feature.headline}
                      </h3>
                      {isActive && (
                        <p className="font-body text-[14px] font-light leading-[1.4] text-on-surface-variant">
                          {feature.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Final Message - Centered */}
          <div
            ref={finalMessageRef}
            className="pointer-events-none absolute inset-0 flex items-center justify-center px-6"
            style={{ visibility: "hidden" }}
          >
            <div className="max-w-3xl text-center">
              <h2 className="mb-4 font-display text-[48px] font-medium leading-[1.15] tracking-[-1.2px] text-on-surface md:mb-6 md:text-[64px] md:tracking-[-2.4px]">
                All of this in one workflow, with the latest models.
              </h2>
              <p className="font-body text-[18px] font-light leading-[1.5] text-on-surface/90 md:text-[24px]">
                ScriptFX handles the model churn so you don't have to.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
