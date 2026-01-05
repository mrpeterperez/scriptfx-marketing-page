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
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!scrollContainerRef.current) return;

      // Create scroll trigger that changes active feature based on scroll position
      ScrollTrigger.create({
        trigger: scrollContainerRef.current,
        start: "top top",
        end: `+=${features.length * 100}%`,
        pin: containerRef.current,
        scrub: true,
        onUpdate: (self) => {
          // Calculate which feature should be active based on scroll progress
          const featureIndex = Math.min(
            Math.floor(self.progress * features.length),
            features.length - 1
          );
          setActiveFeature(featureIndex);
        },
      });
    }, scrollContainerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={scrollContainerRef}
      className={`relative ${className ?? ""}`}
      style={{ height: `${features.length * 100}vh` }}
    >
      <div
        ref={containerRef}
        className="h-screen w-full"
      >
        <div className="flex h-full w-full gap-5 p-5">
          {/* Left Panel - ~387px */}
          <div className="flex w-[320px] flex-shrink-0 flex-col justify-between rounded-2xl border border-border bg-secondary-container p-10 md:w-[387px]">
            {/* Active Feature - Top Section */}
            <div>
              {/* Number Badge */}
              <div className="mb-6 flex h-[34px] w-[50px] items-center justify-center rounded-2xl bg-primary">
                <span className="font-display text-[16px] font-medium tracking-[-0.64px] text-white">
                  {activeFeature + 1}
                </span>
              </div>

              {/* Headline */}
              <h2 className="mb-4 font-display text-[40px] font-medium italic leading-[1.05] tracking-[-1.92px] text-on-surface md:text-[48px]">
                {features[activeFeature].headline}
              </h2>

              {/* Description */}
              <p className="font-body text-[20px] font-light leading-[1.4] tracking-[-0.96px] text-on-surface-variant md:text-[24px]">
                {features[activeFeature].description}
              </p>
            </div>

            {/* Other Features List - Bottom */}
            <nav className="space-y-2">
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
                      <span className="font-display text-[16px] font-medium tracking-[-0.64px] text-white">
                        {feature.id}
                      </span>
                    </div>
                    {/* Title */}
                    <span className="font-display text-[24px] font-medium tracking-[-1.12px] text-on-surface-variant md:text-[28px]">
                      {feature.title}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Panel - App Preview */}
          <div className="flex flex-1 rounded-2xl border border-border bg-secondary-container">
            {/* Content placeholder - will show app UI */}
          </div>
        </div>
      </div>
    </div>
  );
}
