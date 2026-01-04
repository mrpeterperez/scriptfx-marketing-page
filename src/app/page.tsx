"use client";

import { HomeHero } from "@/app/_components/home/home-hero";
import { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Home() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      gsap.set(section, { autoAlpha: 1 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    gsap.set(section, { autoAlpha: 0 });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        end: "top 20%",
        onEnter: () => {
          gsap.to(section, {
            autoAlpha: 1,
            duration: 1.2,
            ease: "power2.out",
          });
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <HomeHero />
      <section
        ref={sectionRef}
        className="relative left-1/2 h-[100svh] w-screen -translate-x-1/2 opacity-0"
      >
        <div className="relative h-full w-full px-6 py-6 md:px-12 md:py-12">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[16px] border border-border bg-secondary-container">
            <div className="font-display text-[48px] font-medium tracking-[-1.6px] text-on-surface md:text-[64px] md:tracking-[-2.4px]">
              TEST
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
