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
  const pixelOverlayRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    const textContainer = textContainerRef.current;
    const videoContainer = videoContainerRef.current;
    const video = videoRef.current;
    const pixelOverlay = pixelOverlayRef.current;

    if (!container || !textContainer || !videoContainer || !video || !pixelOverlay) return;

    const ctx = gsap.context(() => {
      // In timeline-driven mode, we start fully hidden and reveal at `startLabel`.
      // In standalone mode, we behave like the previous pinned section.
      const isTimelineDriven = !!timeline;

      gsap.set(container, { autoAlpha: isTimelineDriven ? 0 : 1 });
      gsap.set(textContainer, { autoAlpha: 1, scale: 1, filter: "none" });
      textLinesRef.current.forEach((line) => {
        if (line) gsap.set(line, { autoAlpha: 0, y: 30, filter: "blur(12px)" });
      });
      gsap.set(videoContainer, { autoAlpha: 0 });
      gsap.set(video, { filter: "blur(18px)", scale: 1.02, transformOrigin: "center" });
      gsap.set(pixelOverlay, { autoAlpha: 1, backgroundSize: "44px 44px" });

      const reveal = (tl: gsap.core.Timeline, at: gsap.Position) => {
        const base = "__act5Start";
        tl.addLabel(base, at);

        // Black screen + Meet first
        tl.to(container, { autoAlpha: 1, duration: 0.01 }, base);

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
              y: 0,
              filter: "blur(0px)",
              duration: 0.01,
              ease: "none",
            },
            base
          );
        }

        // Hold on black w/ "Meet" for a beat
        tl.to({}, { duration: 1.2 }, base);

        // After Meet, reveal ScriptFX (logo)
        if (logoLine) {
          tl.to(
            logoLine,
            {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 1.0,
              ease: "power2.out",
            },
            ">"
          );
        }

        // Hold on black w/ "Meet ScriptFX" longer
        tl.to({}, { duration: 1.4 });

        // Video fades in as pixels resolve (no particle confetti)
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
          pixelOverlay,
          {
            backgroundSize: "10px 10px",
            duration: 0.9,
            ease: "power2.out",
          },
          "<"
        );
        tl.to(
          pixelOverlay,
          {
            autoAlpha: 0,
            duration: 0.7,
            ease: "power2.out",
          },
          "<+=0.25"
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

        // Let it breathe, then fade the text away (video keeps looping)
        tl.to({}, { duration: 1.1 });
        tl.to(textContainer, {
          autoAlpha: 0,
          scale: 0.95,
          filter: "blur(8px)",
          duration: 1.2,
          ease: "power2.inOut",
        });
      };

      if (timeline) {
        reveal(timeline, startLabel);
        return;
      }

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
  }, [timeline, startLabel]);

  const isTimelineDriven = !!timeline;

  const overlay = (
    <div
      ref={containerRef}
      className={
        isTimelineDriven
          ? "pointer-events-none absolute inset-0 z-[70] overflow-hidden bg-black opacity-0"
          : "absolute inset-0 overflow-hidden bg-black opacity-100"
      }
    >
      {/* Pixel overlay used during video fade-in */}
      <div
        ref={pixelOverlayRef}
        className="pointer-events-none absolute inset-0 z-20 opacity-100"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.10) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Video (inside the same screen box container) */}
      <div
        ref={videoContainerRef}
        className="absolute inset-0 overflow-hidden opacity-0"
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

      {/* Meet ScriptFX Text */}
      <div
        ref={textContainerRef}
        className="absolute inset-0 z-30 flex items-center justify-center p-8"
      >
        <div className="text-center">
          <h2 className="font-display text-[36px] font-medium leading-[1.1] tracking-[-1.2px] text-on-surface md:text-[75px] md:tracking-[-2.4px]">
            <span
              ref={(el) => {
                textLinesRef.current[0] = el;
              }}
              className="block font-body text-[18px] font-normal tracking-[0.05em] text-white/80 md:text-[22px] mb-4"
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
