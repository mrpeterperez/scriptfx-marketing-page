"use client";

import * as React from "react";

// Sound effect URLs - using Web Audio API for low latency
const SOUNDS = {
  typewriter: "/sounds/typewriter-click.mp3",
  rumble: "/sounds/impact-rumble.mp3", 
  chime: "/sounds/soft-chime.mp3",
} as const;

type SoundType = keyof typeof SOUNDS;

interface SoundContextType {
  playSound: (type: SoundType, volume?: number) => void;
  setMuted: (muted: boolean) => void;
  isMuted: boolean;
}

const SoundContext = React.createContext<SoundContextType | null>(null);

export function useSounds() {
  const context = React.useContext(SoundContext);
  if (!context) {
    throw new Error("useSounds must be used within SoundProvider");
  }
  return context;
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = React.useState(true); // Start muted by default
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const buffersRef = React.useRef<Map<SoundType, AudioBuffer>>(new Map());
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Initialize AudioContext on first user interaction
  React.useEffect(() => {
    const initAudio = async () => {
      if (audioContextRef.current) return;
      
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Preload all sounds
        await Promise.all(
          Object.entries(SOUNDS).map(async ([key, url]) => {
            try {
              const response = await fetch(url);
              const arrayBuffer = await response.arrayBuffer();
              const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
              buffersRef.current.set(key as SoundType, audioBuffer);
            } catch (e) {
              console.warn(`Could not load sound: ${key}`);
            }
          })
        );
        
        setIsLoaded(true);
      } catch (e) {
        console.warn("Web Audio API not supported");
      }
    };

    // Initialize on first click/touch
    const handleInteraction = () => {
      initAudio();
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  const playSound = React.useCallback((type: SoundType, volume = 0.3) => {
    if (isMuted || !audioContextRef.current || !isLoaded) return;
    
    const buffer = buffersRef.current.get(type);
    if (!buffer) return;

    const source = audioContextRef.current.createBufferSource();
    const gainNode = audioContextRef.current.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    source.start(0);
  }, [isMuted, isLoaded]);

  const setMuted = React.useCallback((muted: boolean) => {
    setIsMuted(muted);
  }, []);

  return (
    <SoundContext.Provider value={{ playSound, setMuted, isMuted }}>
      {children}
    </SoundContext.Provider>
  );
}

// Sound toggle button component
export function SoundToggle() {
  const [isMuted, setIsMuted] = React.useState(true);

  // Sync with localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem("scriptfx-sound-muted");
    if (stored !== null) {
      setIsMuted(stored === "true");
    }
  }, []);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem("scriptfx-sound-muted", String(newMuted));
  };

  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-6 right-6 z-[100] flex h-10 w-10 items-center justify-center rounded-full bg-surface/80 backdrop-blur-sm transition-all hover:bg-surface hover:scale-110 border border-on-surface/10"
      aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
    >
      {isMuted ? (
        <svg className="h-5 w-5 text-on-surface/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      ) : (
        <svg className="h-5 w-5 text-on-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      )}
    </button>
  );
}
