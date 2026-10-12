"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HeroScreenplay } from "./hero-screenplay";

export function HomeHero({ videoSrc: initialVideoSrc = "/video/mountain-scene.mp4" }: { videoSrc?: string } = {}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [clip, setClip] = React.useState(0);
  const videoSrc = clip === 0 ? initialVideoSrc : "/video/bakers-dozen.mp4";
  const [time, setTime] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [muted, setMuted] = React.useState(true);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const motion = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: () => `top top+=${parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--masthead-height"))}`,
          end: "bottom top",
          scrub: 0.6,
        },
      });
      motion.to(".hero-media", { scale: 1.02, ease: "none" }, 0);
      motion.to(".hero-headline", { y: -24, ease: "none" }, 0.35);
    }, container);
    return () => ctx.revert();
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !("requestVideoFrameCallback" in video)) return;
    let frame: number;
    const update = (_now: number, metadata: VideoFrameCallbackMetadata) => {
      setTime(metadata.mediaTime);
      frame = video.requestVideoFrameCallback(update);
    };
    frame = video.requestVideoFrameCallback(update);
    return () => video.cancelVideoFrameCallback(frame);
  }, [videoSrc]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const intro = document.querySelector(".intro-reveal");
    let introComplete = !intro || getComputedStyle(intro).visibility === "hidden";
    const play = () => {
      introComplete = true;
      if (video.getBoundingClientRect().bottom > 0) void video.play().catch(() => {});
    };
    window.addEventListener("scriptfx-intro-complete", play);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && introComplete) void video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => { observer.disconnect(); video.pause(); window.removeEventListener("scriptfx-intro-complete", play); };
  }, [videoSrc]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: "calc(100dvh - var(--masthead-height))", width: "100vw", marginLeft: "calc(50% - 50vw)" }}
    >
      {/* One background with a subtle scroll transition. */}
      <div className="hero-wrapper relative left-0 top-0 w-full opacity-100" style={{ top: 0, height: "100%" }}>

        {/* Headline stays within the hero. */}
        <div 
          className="hero-headline absolute z-50 text-center text-white"
        >
          <h1 className="font-display font-medium">
            <span className="hero-line-1 block">Write your screenplay.</span>
            <span className="hero-line-2 block">Watch it come <em className="hero-alive">alive</em>.</span>
          </h1>
          <p className="hero-tagline mt-6 font-body text-[16px] leading-[22px] text-white/90 md:text-[18px] md:leading-[24px]">
            From screenplay to audio drama and cinema — all on one page.
          </p>
          <div className="hero-actions">
            <Button asChild size="lg" className="hero-cta" style={{ background: "#fff", color: "#111" }}><Link href="/get-access">Get access</Link></Button>
        <div className="hero-playback">
          <button className="hero-play-button" type="button" onClick={() => { const video = videoRef.current; if (video) { if (video.paused) void video.play().catch(() => {}); else video.pause(); } }} aria-label={playing ? "Pause film" : "Play film"}>{playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}</button>
          <button type="button" onClick={() => setMuted(!muted)} aria-label={muted ? "Unmute film" : "Mute film"} aria-pressed={!muted}>{muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}</button>
        </div>
          </div>

        </div>

        <section className="panel absolute inset-0 h-full w-full" style={{ opacity: 1, visibility: "visible" }}>
          <div className="relative h-full w-full overflow-hidden">
            {videoSrc ? <video
              key={videoSrc}
              ref={videoRef}
              src={videoSrc}
              poster={clip === 0 ? "/video/mountain-scene-poster.jpg" : "/video/bakers-dozen-poster.jpg"}
              muted={muted}
              onTimeUpdate={(event) => { if (typeof event.currentTarget.requestVideoFrameCallback !== "function") setTime(event.currentTarget.currentTime); }}
              onSeeked={(event) => setTime(event.currentTarget.currentTime)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => { setTime(0); setClip((current) => (current + 1) % 2); }}
              playsInline
              preload="metadata"
              aria-hidden="true"
              className="hero-media pointer-events-none h-full w-full object-cover"
            /> : <Image
              alt=""
              src="/placeholder/video-poster.png"
              fill
              sizes="100vw"
              className="hero-media pointer-events-none object-cover"
              priority
            />}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ backgroundImage: "linear-gradient(90deg, transparent 25%, rgba(5,10,12,0.28) 58%, rgba(5,10,12,0.65) 100%), linear-gradient(0deg, rgba(0,0,0,0.8), transparent 55%)" }}
            />
          </div>
        </section>
        <HeroScreenplay key={videoSrc} time={time} videoRef={videoRef} bakers={clip === 1} />

      </div>
    </div>
  );
}
