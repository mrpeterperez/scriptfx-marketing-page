"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Volume2, VolumeX } from "lucide-react";

const LandingSound = createContext<{ sound: boolean; setSound: (sound: boolean) => void; toggleSound: () => void } | null>(null);
export const useLandingSound = () => useContext(LandingSound);

export function LandingSoundProvider({ children }: { children: ReactNode }) {
  const [sound, setSound] = useState(false);
  const [floating, setFloating] = useState(false);
  const toggleSound = useCallback(() => setSound(current => !current), []);
  const value = useMemo(() => ({ sound, setSound, toggleSound }), [sound, toggleSound]);
  useEffect(() => {
    const heroButton = document.querySelector("[data-hero-sound]");
    if (!heroButton) return;
    const observer = new IntersectionObserver(([entry]) => setFloating(!entry.isIntersecting && window.scrollY > 0), { rootMargin: "-64px 0px 0px" });
    observer.observe(heroButton);
    return () => observer.disconnect();
  }, []);
  return <LandingSound.Provider value={value}>{children}<button type="button" className="landing-global-sound" data-visible={floating} aria-hidden={!floating} tabIndex={floating ? 0 : -1} aria-label={sound ? "Mute landing page" : "Unmute landing page"} aria-pressed={sound} onClick={toggleSound}>{sound ? <Volume2 size={19} /> : <VolumeX size={19} />}</button></LandingSound.Provider>;
}
