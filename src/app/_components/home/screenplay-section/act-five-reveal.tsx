"use client";

import * as React from "react";
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
  const textLinesRef = React.useRef<(HTMLSpanElement | null)[]>([]);
  const videoContainerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const isTimelineDriven = !!timeline;

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    const textContainer = textContainerRef.current;
    const videoContainer = videoContainerRef.current;
    const video = videoRef.current;

    if (!container || !textContainer || !videoContainer || !video) return;

    const ctx = gsap.context(() => {
      gsap.set(container, { autoAlpha: isTimelineDriven ? 0 : 1 });
      gsap.set(textContainer, { autoAlpha: isTimelineDriven ? 0 : 1, scale: 1, filter: "none" });
      textLinesRef.current.forEach((line) => {
        if (line) gsap.set(line, { autoAlpha: 0, filter: "blur(12px)" });
      });
      gsap.set(videoContainer, { autoAlpha: 0 });
      gsap.set(video, { filter: "blur(18px)", scale: 1.02, transformOrigin: "center" });

      const reveal = (tl: gsap.core.Timeline, at: gsap.Position) => {
        const base = "__act5Start";
        tl.addLabel(base, at);

        // Black screen + Meet first
        tl.to(container, { autoAlpha: 1, duration: 0.01 }, base);
        tl.to(textContainer, { autoAlpha: 1, duration: 0.01 }, base);

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

        // Hold on black w/ "Meet" for a beat
        tl.to({}, { duration: 1.8 }, base);

        // After Meet, reveal ScriptFX (logo)
        const logoStart = ">";
        if (logoLine) {
          tl.to(
            logoLine,
            {
              autoAlpha: 1,
              filter: "blur(0px)",
              duration: 1.0,
              ease: "power2.out",
            },
            logoStart
          );
        }

        // Hold on black w/ "Meet ScriptFX"
        tl.to({}, { duration: 2.0 });

        // Video fades in
        const videoStart = ">";
        tl.to(
          videoContainer,
          {
            autoAlpha: 1,
            duration: 1.2,
            ease: "power2.out",
          },
          videoStart
        );
        tl.to(
          video,
          {
            filter: "blur(0px)",
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
    const textContainer = textContainerRef.current;
    if (!textContainer) return;

    const featuresSection = document.querySelector('[data-scriptfx-features="true"]');
    if (!featuresSection) return;

    const handleScroll = () => {
      const textRect = textContainer.getBoundingClientRect();
      const featuresRect = featuresSection.getBoundingClientRect();
      
      // Get the current transform so we can calculate natural position
      const currentY = gsap.getProperty(textContainer, "y") as number || 0;
      const naturalTextBottom = textRect.bottom - currentY;
      
      const featuresTop = featuresRect.top;
      
      // Only push when features panel actually touches the text (gap <= 0)
      if (featuresTop <= naturalTextBottom) {
        const pushAmount = naturalTextBottom - featuresTop;
        gsap.set(textContainer, { y: -pushAmount });
      } else {
        gsap.set(textContainer, { y: 0 });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Fade the video out when the features panel fully pins on top.
  React.useEffect(() => {
    const handler = (evt: Event) => {
      const custom = evt as CustomEvent<{ pinned?: boolean }>;
      const pinned = !!custom.detail?.pinned;
      const videoContainer = videoContainerRef.current;
      if (!videoContainer) return;

      gsap.to(videoContainer, {
        autoAlpha: pinned ? 0 : 1,
        duration: 0.6,
        ease: "power2.inOut",
        overwrite: true,
      });
    };

    window.addEventListener("scriptfx-features-pinned", handler as EventListener);
    return () => {
      window.removeEventListener("scriptfx-features-pinned", handler as EventListener);
    };
  }, []);

  const overlay = (
    <div
      ref={containerRef}
      className={
        isTimelineDriven
          ? "pointer-events-none absolute inset-0 z-[70] overflow-hidden bg-black opacity-0"
          : "absolute inset-0 overflow-hidden bg-black opacity-100"
      }
    >
      {/* Meet ScriptFX text */}
      <div
        ref={textContainerRef}
        className="absolute inset-0 z-20 flex items-center justify-center p-8"
      >
        <div className="text-center">
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
              className="block"
            >
              <img
                src="/brand/scriptfxlogolarge.svg"
                alt="ScriptFX"
                className="mx-auto h-auto w-full max-w-[500px]"
              />
            </span>
          </h2>
        </div>
      </div>

      {/* Video */}
      <div
        ref={videoContainerRef}
        className="absolute inset-0 z-10 overflow-hidden opacity-0"
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
    </div>
  );

  if (isTimelineDriven) {
    return overlay;
  }

  return (
    <section
      ref={scrollRootRef}
      className="relative h-screen w-screen bg-black"
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
    >
      <div className="h-full w-full px-6 py-6 md:px-12 md:py-12">
        <div className="relative h-full w-full overflow-hidden rounded-[16px] border border-border bg-secondary-container">
          {overlay}
        </div>
      </div>
    </section>
  );
}
