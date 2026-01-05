"use client";

// Simple audio utility for triggering sounds from GSAP timelines
// Works without React context - creates audio elements on demand

const audioCache = new Map<string, HTMLAudioElement>();

export function triggerSound(
  soundPath: string, 
  volume = 0.3,
  playbackRate = 1
) {
  // Check if user has interacted (required for autoplay)
  if (typeof window === "undefined") return;
  
  // Check localStorage for mute preference
  const isMuted = localStorage.getItem("scriptfx-sound-muted") === "true";
  if (isMuted) return;

  try {
    let audio = audioCache.get(soundPath);
    
    if (!audio) {
      audio = new Audio(soundPath);
      audioCache.set(soundPath, audio);
    }
    
    // Clone for overlapping sounds
    const audioClone = audio.cloneNode() as HTMLAudioElement;
    audioClone.volume = volume;
    audioClone.playbackRate = playbackRate;
    audioClone.play().catch(() => {
      // Autoplay blocked - silently fail
    });
  } catch (e) {
    // Audio not supported
  }
}

// Predefined sounds
export const sounds = {
  typewriterClick: () => triggerSound("/sounds/typewriter-click.mp3", 0.15),
  impactRumble: () => triggerSound("/sounds/impact-rumble.mp3", 0.4),
  softChime: () => triggerSound("/sounds/soft-chime.mp3", 0.25),
  whoosh: () => triggerSound("/sounds/whoosh.mp3", 0.2),
} as const;
