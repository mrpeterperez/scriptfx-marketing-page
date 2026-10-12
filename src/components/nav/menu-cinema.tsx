"use client";
import { useEffect, useRef } from "react";

export function MenuCinema() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let visible = false;
    const sync = () => {
      if (visible && !document.hidden && !motion.matches && !connection?.saveData) {
        if (!video.getAttribute("src")) video.src = "/video/menu-cinema.mp4";
        void video.play().catch(() => {});
      } else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(video);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    return () => { observer.disconnect(); video.pause(); document.removeEventListener("visibilitychange", sync); motion.removeEventListener("change", sync); };
  }, []);
  return <span className="menu-cinema" aria-hidden="true"><video ref={ref} muted loop playsInline preload="none" poster="/video/mountain-scene-poster.jpg" /><span /></span>;
}
