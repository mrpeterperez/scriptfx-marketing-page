"use client";

import * as React from "react";
import { NavLogo } from "@/components/nav/nav-logo";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Play } from "lucide-react";
import { gsap } from "gsap";

type TopNavMenuProps = {
  onClose: () => void;
  storyVideoSrc?: string;
  storyPosterSrc?: string;
};

export function TopNavMenu({
  onClose,
  storyVideoSrc,
  storyPosterSrc = "/placeholder/video-poster.png",
}: TopNavMenuProps) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const timelineRef = React.useRef<gsap.core.Timeline | null>(null);
  const isClosingRef = React.useRef(false);

  const requestClose = React.useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    const tl = timelineRef.current;
    if (!tl) {
      onClose();
      return;
    }

    tl.eventCallback("onReverseComplete", () => onClose());
    tl.reverse();
  }, [onClose]);

  React.useLayoutEffect(() => {
    const panel = panelRef.current;
    const content = contentRef.current;
    if (!panel || !content) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      gsap.set(panel, { clearProps: "all" });
      gsap.set(content, { clearProps: "all" });
      return;
    }

    const ctx = gsap.context(() => {
      // Measure the full height, then animate from a collapsed state.
      const targetHeight = panel.getBoundingClientRect().height;

      const closeButton = content.querySelectorAll("[data-close-button]");
      const closeLines = content.querySelectorAll("[data-close-line]");

      const navItems = content.querySelectorAll("[data-menu-item]");
      const media = content.querySelectorAll("[data-menu-media]");
      const footer = content.querySelectorAll("[data-menu-footer]");

      // Panel expands center-out (left + right) while growing vertically.
      gsap.set(panel, {
        height: 60,
        opacity: 0,
        y: -10,
        scaleX: 0.92,
        transformOrigin: "50% 0%",
        overflow: "hidden",
      });
      gsap.set(content, { opacity: 0 });
      gsap.set(navItems, { opacity: 0, y: 10 });
      gsap.set(media, { opacity: 0, y: 10, scale: 0.98 });
      gsap.set(footer, { opacity: 0, y: 8 });

      // Animate hamburger -> X (and reverse on close).
      gsap.set(closeButton, { rotate: -90, transformOrigin: "50% 50%" });
      gsap.set(closeLines, (index: number) => ({
        rotate: 0,
        y: index === 0 ? -4 : 4,
        transformOrigin: "50% 50%",
      }));

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power4.out" },
        onComplete: () => {
          // Let layout drive size after the open animation.
          gsap.set(panel, { clearProps: "height,overflow" });
        },
      });

      tl.to(panel, { height: targetHeight, opacity: 1, y: 0, scaleX: 1, duration: 0.32 }, 0)
        .to(closeButton, { rotate: 0, duration: 0.28 }, 0.02)
        .to(closeLines, { y: 0, duration: 0.22 }, 0.04)
        .to(closeLines[0], { rotate: 45, duration: 0.22 }, 0.06)
        .to(closeLines[1], { rotate: -45, duration: 0.22 }, 0.06)
        .to(content, { opacity: 1, duration: 0.12 }, 0.08)
        .to(navItems, { opacity: 1, y: 0, duration: 0.22, stagger: 0.035 }, 0.12)
        .to(media, { opacity: 1, y: 0, scale: 1, duration: 0.26 }, 0.16)
        .to(footer, { opacity: 1, y: 0, duration: 0.2 }, 0.18);

      timelineRef.current = tl;
      tl.play(0);
    }, panel);

    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
      ctx.revert();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[1000]" onClick={requestClose}>
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      <header className="pointer-events-none fixed left-0 right-0 top-0 z-[1001] mx-auto p-4 md:p-6">
        <div
          ref={panelRef}
          className="pointer-events-auto relative mx-auto overflow-hidden rounded-xl border border-border bg-black/60 text-on-surface backdrop-blur-xl transition-colors duration-200 [--menu-width-closed:100%] [--menu-width-open:100%] sm:[--menu-width-closed:330px] sm:[--menu-width-open:50vw] md:[--menu-width-open:70vw] xl:[--menu-width-open:50vw]"
          style={{ width: "var(--menu-width-open)" }}
          data-theme="nav-open"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pointer-events-none absolute inset-[-1px] rounded-xl shadow-[-11.15px_-10.392px_48px_-12px_rgba(0,0,0,0.15),-1.858px_-1.732px_12px_-8px_rgba(0,0,0,0.15)]" />

          <div className="relative flex w-full flex-col h-[min(735px,calc(100svh-32px))] md:h-[min(735px,calc(100svh-48px))] lg:h-[395px]">
            <div className="relative flex h-[60px] w-full items-center justify-between">
              <div className="h-[60px] w-[60px]" aria-hidden="true" />

              <NavLogo className="flex h-[60px] items-center p-5" onClick={() => requestClose()} />

              <div className="flex items-center">
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={requestClose}
                  className="group relative h-[60px] w-[60px] cursor-pointer p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  data-close-button
                >
                  <div className="absolute inset-0 m-2.5 flex items-center justify-center rounded-lg transition-colors duration-200 group-hover:bg-container/40" />
                  <span
                    className="absolute left-1/2 top-1/2 h-[2px] w-[20px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-on-surface"
                    data-close-line
                  />
                  <span
                    className="absolute left-1/2 top-1/2 h-[2px] w-[20px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-on-surface"
                    data-close-line
                  />
                </button>
              </div>
            </div>

            <div
              ref={contentRef}
              className="flex w-full flex-1 min-h-0 flex-col justify-between gap-8 overflow-auto p-6"
              style={{
                opacity: 1,
              }}
            >
              <div className="grid grid-cols-4 gap-8">
                <div className="col-span-4 flex flex-col lg:col-span-2">
                  <nav aria-label="Menu" className="flex flex-col items-start gap-2 pb-8 text-on-surface lg:pb-0">
                    {[
                      "Technology",
                      "Company",
                      "Careers",
                      "Journal",
                      "Beta",
                    ].map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={requestClose}
                        className="font-body text-[24px] font-light tracking-[-0.24px] text-on-surface transition-colors duration-200 hover:text-on-surface/80"
                        data-menu-item
                      >
                        {label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="col-span-4 lg:col-span-2">
                  <div
                    className="group relative flex items-center justify-center overflow-hidden rounded-md bg-inverse-surface/15"
                    data-menu-media
                  >
                    <div className="relative aspect-video w-full opacity-90">
                      <Image
                        src={storyPosterSrc}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="pointer-events-none object-cover"
                        priority
                      />

                      <video
                        className="relative z-10 h-full w-full cursor-pointer object-cover"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        poster={storyPosterSrc}
                        autoPlay={Boolean(storyVideoSrc)}
                      >
                        {storyVideoSrc ? <source src={storyVideoSrc} /> : null}
                      </video>

                      

                      <div className="absolute inset-0 z-10 flex items-center justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            // Placeholder action; hook up to your player later.
                          }}
                          className="h-10 rounded-full bg-container/40 px-4 text-on-surface backdrop-blur-xl hover:bg-container/60"
                        >
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-container/50">
                            <Play className="h-3 w-3" aria-hidden="true" />
                          </span>
                          <span>Our story</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid w-full grid-cols-4" data-menu-footer>
                <div className="hidden lg:col-span-2 lg:block">
                  <p className="font-body text-sm text-on-surface/60">The helpful robotics company</p>
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <p className="font-body text-sm text-on-surface/60">Launching 2026</p>
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <button
                    type="button"
                    onClick={requestClose}
                    className="flex w-full items-center justify-end text-right font-body text-sm text-on-surface/60 hover:text-on-surface"
                  >
                    <span className="pr-1">Beta Application</span>
                    <span className="inline-block h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
