"use client";

import * as React from "react";

// Audio toggle button (UI only)
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
      aria-label={isMuted ? "Enable audio" : "Disable audio"}
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
