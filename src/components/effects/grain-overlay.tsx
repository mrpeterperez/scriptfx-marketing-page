/**
 * Full-screen film grain layer — matches the humanexperiencelabs setup
 * exactly: a plain <video> with `.film-grain` styling (fixed, full
 * viewport, pointer-events: none, opacity-only, no blend mode).
 *
 * Tuning: the `--grain-opacity` CSS var in globals.css (default 0.32).
 */
export function GrainOverlay() {
  return (
    <video
      className="film-grain"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
    >
      <source src="/grain/grain.webm" type="video/webm" />
      <source src="/grain/grain.mp4" type="video/mp4" />
    </video>
  );
}
