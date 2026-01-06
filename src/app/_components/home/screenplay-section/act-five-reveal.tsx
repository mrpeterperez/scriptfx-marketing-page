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
  const screenplayOverlayRef = React.useRef<HTMLDivElement>(null);

  const loremText = React.useMemo(() => 
    "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est qui dolorem ipsum quia dolor sit amet consectetur adipisci velit sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam quis nostrum exercitationem ullam corporis suscipit laboriosam nisi ut aliquid ex ea commodi consequatur. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident similique sunt in culpa qui officia deserunt mollitia animi id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus omnis voluptas assumenda est omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. ".repeat(15),
  []);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    const textContainer = textContainerRef.current;
    const videoContainer = videoContainerRef.current;
    const video = videoRef.current;
    const screenplayOverlay = screenplayOverlayRef.current;

    if (!container || !textContainer || !videoContainer || !video || !screenplayOverlay) return;

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
      gsap.set(screenplayOverlay, { autoAlpha: 0, filter: "blur(8px)", scale: 0.98 });

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

        // After Meet, reveal ScriptFX (logo) + screenplay pages at SAME TIME
        const logoStart = ">";
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
            logoStart
          );
        }

        // Vast text wall appears with ScriptFX
        tl.to(
          screenplayOverlay,
          {
            autoAlpha: 1,
            filter: "blur(0px)",
            scale: 1,
            duration: 0.7,
            ease: "power2.out",
          },
          logoStart
        );

        // Hold on black w/ "Meet ScriptFX" + screenplay pages longer
        tl.to({}, { duration: 1.4 });

        // Video fades in while screenplay pages dissolve
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

        // Dissolve screenplay overlay as video sharpens
        tl.to(
          screenplayOverlay,
          {
            autoAlpha: 0,
            duration: 0.9,
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
      {/* Vast lorem ipsum text wall overlay */}
      <div
        ref={screenplayOverlayRef}
        className="pointer-events-none absolute inset-0 z-20 overflow-hidden p-3 md:p-4 opacity-0"
      >
        <div className="h-full w-full select-none font-mono text-[8px] leading-[1.2] tracking-[0.01em] text-white/18 md:text-[9px] md:leading-[1.25] break-all">
          {loremText}
        </div>
      </div>

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
