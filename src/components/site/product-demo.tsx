"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

import { useLandingSound } from "@/components/home/landing-sound";

type Demo = { active: boolean; visible: boolean; sound: boolean; time: number };
const ProductDemo = createContext<Demo | null>(null);

export const useProductDemo = () => useContext(ProductDemo);

/** Run a product preview only while its card is on screen. */
export function ProductDemoFrame({ sound: localSound, children }: { sound: boolean; children: ReactNode }) {
  const landingSound = useLandingSound();
  const sound = landingSound?.sound ?? localSound;
  const frame = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [time, setTime] = useState(0);
  useEffect(() => {
    const element = frame.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () => {
      const shown = visible && !document.hidden && !element.closest("[inert]");
      setOnScreen(shown);
      setActive(shown && !reduced.matches);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && entry.intersectionRatio >= .55; update(); }, { threshold: [0, .55] });
    const card = element.closest(".landing-card")!;
    const mutations = new MutationObserver(update);
    mutations.observe(card, { attributes: true, attributeFilter: ["inert"] });
    observer.observe(element);
    reduced.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); mutations.disconnect(); reduced.removeEventListener("change", update); document.removeEventListener("visibilitychange", update); };
  }, []);
  useEffect(() => {
    if (!active) return;
    let request = 0, started = 0, previous = 0;
    const tick = (now: number) => {
      if (!started) started = now;
      if (!previous || now - previous >= 80) { setTime((now - started) / 1000); previous = now; }
      request = requestAnimationFrame(tick);
    };
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [active]);
  return <div ref={frame} className="landing-demo-frame" data-demo-active={active}><ProductDemo.Provider value={{ active, visible: onScreen, sound, time }}>{children}</ProductDemo.Provider></div>;
}
