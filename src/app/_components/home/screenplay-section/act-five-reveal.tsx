"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ActFiveRevealProps {
  timeline?: gsap.core.Timeline | null;
  startLabel?: string;
}

export function ActFiveReveal({ timeline, startLabel = "curtainsClosed" }: ActFiveRevealProps) {
  const scrollRootRef = React.useRef<HTMLElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const textContainerRef = React.useRef<HTMLDivElement>(null);
  const textBlockRef = React.useRef<HTMLDivElement>(null);
  const textLinesRef = React.useRef<(HTMLSpanElement | null)[]>([]);
  const videoContainerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const scrimRef = React.useRef<HTMLDivElement>(null);

  const isTimelineDriven = !!timeline;

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    const textContainer = textContainerRef.current;
    const videoContainer = videoContainerRef.current;
    const video = videoRef.current;
    const scrim = scrimRef.current;

    if (!container || !textContainer || !videoContainer || !video || !scrim) return;

    const ctx = gsap.context(() => {
      gsap.set(container, { autoAlpha: isTimelineDriven ? 0 : 1 });
      gsap.set(textContainer, { autoAlpha: isTimelineDriven ? 0 : 1, scale: 1, filter: "none" });
      textLinesRef.current.forEach((line) => {
        if (line) gsap.set(line, { autoAlpha: 0, filter: "blur(12px)" });
      });
      gsap.set(videoContainer, { autoAlpha: 0 });
      gsap.set(video, { filter: "blur(20px)", scale: 1.02, transformOrigin: "center" });
      // Important: this layer is portaled + fixed; keep it hidden until Act 5 starts.
      gsap.set(scrim, { autoAlpha: 0 });

      const reveal = (tl: gsap.core.Timeline, at: gsap.Position) => {
        const base = "__act5Start";
        tl.addLabel(base, at);

        // Start Act 5 with the video already behind the title.
        tl.to(container, { autoAlpha: 1, duration: 0.01 }, base);
        tl.to(textContainer, { autoAlpha: 1, duration: 0.01 }, base);
        tl.to(videoContainer, { autoAlpha: 1, duration: 0.01 }, base);
        tl.to(scrim, { autoAlpha: 0.65, duration: 0.01 }, base);

        // Ensure autoplay kicks in reliably across browsers
        tl.call(() => {
          video.play().catch(() => {});
        }, [], base);

        const meetLine = textLinesRef.current[0];
        const logoLine = textLinesRef.current[1];

        if (meetLine) {
          tl.to(
            meetLine,
            {
              autoAlpha: 1,
              filter: "blur(0px)",
              duration: 0.01,
              ease: "none",
            },
            base
          );
        }

        // After Meet, reveal ScriptFX (logo)
        const logoStart = ">+=0.6";
        if (logoLine) {
          tl.to(
            logoLine,
            {
              autoAlpha: 1,
              filter: "blur(0px)",
              duration: 0.7,
              ease: "power2.out",
            },
            logoStart
          );
        }

        // One beat on black w/ both lines visible
        tl.to({}, { duration: 1.0 });

        // Video: deblur + slightly lift the scrim
        const videoStart = ">";
        tl.to(
          scrim,
          {
            autoAlpha: 0.35,
            duration: 0.5,
            ease: "power2.out",
          },
          videoStart
        );
        tl.to(
          video,
          {
            filter: "blur(2px)",
            scale: 1,
            duration: 1.2,
            ease: "power2.out",
          },
          "<"
        );

        // Let the fully revealed video breathe.
        tl.to({}, { duration: 1.6 });

        // Extra hold
        tl.to({}, { duration: 1.1 });
      };

      if (timeline) {
        reveal(timeline, startLabel);
        return;
      }

      // Standalone mode (fallback)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollRootRef.current ?? container,
          start: "top top",
          end: "+=260%",
          pin: true,
          scrub: 0.8,
          onEnter: () => {
            video.play().catch(() => {});
          },
          onEnterBack: () => {
            video.play().catch(() => {});
          },
        },
      });

      reveal(tl, 0);
    }, container);

    return () => ctx.revert();
  }, [timeline, startLabel, isTimelineDriven]);

  // Push the ScriptFX text up when features section pushes it (physics-based)
  React.useEffect(() => {
    const textBlock = textBlockRef.current;
    if (!textBlock) return;

    const featuresSection = document.querySelector('[data-scriptfx-features="true"]');
    if (!featuresSection) return;

    const handleScroll = () => {
      const textRect = textBlock.getBoundingClientRect();
      const featuresRect = featuresSection.getBoundingClientRect();
      
      // Get the current transform so we can calculate natural position
      const currentY = (gsap.getProperty(textBlock, "y") as number) || 0;
      const naturalTextBottom = textRect.bottom - currentY;
      
      const featuresTop = featuresRect.top;
      
      // Only push when features panel actually touches the text (gap <= 0)
      if (featuresTop <= naturalTextBottom) {
        const pushAmount = naturalTextBottom - featuresTop;
        gsap.set(textBlock, { y: -pushAmount });
      } else {
        gsap.set(textBlock, { y: 0 });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // When the Models section arrives, push the pinned Act 5 layers upward
  // so the Models panel displaces the video instead of overlapping it.
  React.useEffect(() => {
    const modelsSection = document.querySelector('[data-scriptfx-models="true"]');
    if (!modelsSection) return;

    const videoContainer = videoContainerRef.current;
    const scrim = scrimRef.current;
    const overlayContainer = containerRef.current;

    if (!videoContainer || !scrim || !overlayContainer) return;

    const handleScroll = () => {
      const modelsRect = (modelsSection as HTMLElement).getBoundingClientRect();
      const viewportHeight = window.innerHeight || 0;

      // When the top of Models enters the viewport, start displacing.
      // modelsRect.top === viewportHeight => 0 displacement
      // modelsRect.top === 0 => full viewport displacement
      const displacement = Math.min(
        Math.max(viewportHeight - modelsRect.top, 0),
        viewportHeight
      );

      gsap.set([videoContainer, scrim, overlayContainer], { y: -displacement });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      gsap.set([videoContainer, scrim, overlayContainer], { y: 0 });
    };
  }, []);

  const overlay = (
    <div
      ref={containerRef}
      className={
        isTimelineDriven
          ? "pointer-events-none fixed inset-0 z-[70] overflow-hidden opacity-0"
          : "fixed inset-0 overflow-hidden opacity-100"
      }
    >
      {/* Meet ScriptFX text */}
      <div
        ref={textContainerRef}
        className="absolute inset-0 z-20 flex items-center justify-center p-8"
      >
        <div ref={textBlockRef} className="text-center">
          <h2 className="font-display text-[36px] font-medium leading-[1.1] tracking-[-1.2px] text-on-surface md:text-[75px] md:tracking-[-2.4px]">
            <span
              ref={(el) => {
                textLinesRef.current[0] = el;
              }}
              className="mb-4 block font-body text-[18px] font-normal tracking-[0.05em] text-white/80 md:text-[22px]"
            >
              Meet
            </span>
            <span
              ref={(el) => {
                textLinesRef.current[1] = el;
              }}
              className="block relative"
            >
              <div className="absolute inset-0 z-[-1] animate-pulse blur-[40px] opacity-40 bg-white/20 rounded-full scale-110" />
              <img
                src="/brand/scriptfxlogolarge.svg"
                alt="ScriptFX"
                className="relative z-10 mx-auto h-auto w-full max-w-[500px] drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
              />
            </span>
          </h2>
        </div>
      </div>
    </div>
  );

  const pinnedLayers = (
    <>
      {/* Video (pinned/fixed so it can continue beyond later sections) */}
      <div
        ref={videoContainerRef}
        className="pointer-events-none fixed inset-0 z-[60] overflow-hidden opacity-0"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-secondary-container via-secondary-container/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-black via-black/80 to-transparent" />

        <div className="relative h-full w-full overflow-hidden">
          <video
            ref={videoRef}
            src="/brand/scriptfxtest.mp4"
            className="h-full w-full object-cover"
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/30" />
          
        </div>
      </div>

      {/* Scrim for readability (behind video) */}
      <div
        ref={scrimRef}
        className="pointer-events-none fixed inset-0 z-[65] bg-black opacity-0"
      />
    </>
  );

  if (isTimelineDriven) {
    return (
      <>
        {typeof document !== "undefined" ? createPortal(overlay, document.body) : null}
        {typeof document !== "undefined" ? createPortal(pinnedLayers, document.body) : null}
      </>
    );
  }

  return (
    <section
      ref={scrollRootRef}
      className="relative h-screen w-screen bg-black"
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
    >
      {typeof document !== "undefined" ? createPortal(pinnedLayers, document.body) : null}
      <div className="h-full w-full px-6 py-6 md:px-12 md:py-12">
        <div className="relative h-full w-full overflow-hidden rounded-[16px] border border-border bg-secondary-container">
          {overlay}
        </div>
      </div>
    </section>
  );
}
