"use client";

import * as React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    id: 1,
    title: "Write",
    description: "Familiar. Focused. Out of your way.",
  },
  {
    id: 2,
    title: "Hear it.",
    description: "AI-powered voice generation brings your characters to life instantly.",
  },
  {
    id: 3,
    title: "Build it.",
    description: "Generate concept art, storyboards, and visual references from your script.",
  },
  {
    id: 4,
    title: "Direct it.",
    description: "Control camera angles, lighting, and composition with simple commands.",
  },
  {
    id: 5,
    title: "Act it.",
    description: "Create animated previews with AI-generated performances.",
  },
  {
    id: 6,
    title: "Watch it.",
    description: "Export polished previsualization videos to share with your team.",
  },
];

export function ActFourSolution() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollTriggerRef = React.useRef<ScrollTrigger | null>(null);
  const [activeFeature, setActiveFeature] = React.useState(0);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${features.length * 100}vh`,
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          const index = Math.min(
            Math.floor(self.progress * features.length),
            features.length - 1
          );
          setActiveFeature(index);
        },
        onEnter: () => {
          // Show nav when entering features section
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { 
              detail: { visible: true } 
            }));
          }
        },
        onLeaveBack: () => {
          // Hide nav when going back to void/logo section
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("scriptfx-toggle-nav", { 
              detail: { visible: false } 
            }));
          }
        }
      });
      scrollTriggerRef.current = st;
    }, container);

    return () => ctx.revert();
  }, []);

  const handleFeatureClick = (index: number) => {
    const st = scrollTriggerRef.current;
    if (!st || !st.end) return;
    
    // Calculate scroll position exactly in the middle of that feature's section
    const totalDistance = st.end - st.start;
    const progressPerFeature = 1 / features.length;
    const targetProgress = (index * progressPerFeature) + (progressPerFeature / 2); // Center of the slot
    const scrollPos = st.start + (totalDistance * targetProgress);

    window.scrollTo({
      top: scrollPos,
      behavior: "smooth"
    });
  };

  return (
    <>
      {/* Features - pins and scrolls through */}
      <section
        ref={containerRef}
        className="relative h-screen w-screen bg-black"
        style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
      >
        <div className="h-full w-full px-6 py-6 md:px-12 md:py-12">
          <div className="flex h-full w-full overflow-hidden rounded-[16px] border border-border bg-secondary-container">
            {/* Left Panel - Feature List */}
            <div className="flex w-[320px] flex-shrink-0 flex-col border-r border-border p-8 md:w-[387px] md:p-12">
              {/* Completed */}
              <div className="space-y-2">
                {features.slice(0, activeFeature).map((f) => {
                  const originalIndex = features.findIndex(item => item.id === f.id);
                  return (
                    <div 
                      key={f.id} 
                      onClick={() => handleFeatureClick(originalIndex)}
                      className="flex cursor-pointer items-center gap-3 opacity-50 transition-opacity hover:opacity-100"
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
                  <span className="font-display text-[20px] font-medium text-white">
                    {features[activeFeature].id}
                  </span>
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
                  const originalIndex = features.findIndex(item => item.id === f.id);
                  return (
                    <div 
                      key={f.id} 
                      onClick={() => handleFeatureClick(originalIndex)}
                      className="flex cursor-pointer items-center gap-3 opacity-50 transition-opacity hover:opacity-100"
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
            <div className="flex flex-1 items-center justify-center p-8">
              <p className="font-display text-[24px] text-on-surface-variant">
                {features[activeFeature].title} - Content
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
