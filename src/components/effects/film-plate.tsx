"use client";

import { useEffect, useRef } from "react";

export function FilmPlate() {
  const plate = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = plate.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const surface = video.closest(".intro-reveal, [data-film-reveal]");
    let visible = false;
    const update = () => {
      if (visible && !reduced.matches && !document.hidden && (!surface || getComputedStyle(surface).visibility !== "hidden")) {
        if (video.paused) void video.play().catch(() => {});
      } else if (!video.paused) video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer.observe(video);
    const mutations = new MutationObserver(update);
    if (surface) mutations.observe(surface, { attributes: true, attributeFilter: ["style"] });
    document.addEventListener("visibilitychange", update);
    reduced.addEventListener("change", update);
    return () => { observer.disconnect(); mutations.disconnect(); video.pause(); document.removeEventListener("visibilitychange", update); reduced.removeEventListener("change", update); };
  }, []);
  return <video ref={plate} className="art-plate hero-film-plate" muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1}><source src="/grain/holygrain-35mm-dirty.mp4" type="video/mp4" /></video>;
}
