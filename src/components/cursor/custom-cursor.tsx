"use client";

import * as React from "react";
import { gsap } from "gsap";

interface CustomCursorProps {
  // Which scene indices should show the cursor (based on scroll progress)
  activeScenes?: { start: number; end: number }[];
}

export function CustomCursor({ activeScenes }: CustomCursorProps) {
  const cursorRef = React.useRef<HTMLDivElement>(null);
  const cursorDotRef = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);
  const [cursorType, setCursorType] = React.useState<"default" | "pen" | "pointer">("default");

  // Follow mouse with smooth interpolation
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    if (!cursor || !dot) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // Smooth follow animation
    const animate = () => {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      
      cursorX += dx * 0.15; // Smooth factor
      cursorY += dy * 0.15;
      
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      
      requestAnimationFrame(animate);
    };

    // Detect hoverable elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.closest("a, button, [role='button'], .hoverable")) {
        setIsHovering(true);
        setCursorType("pointer");
      } else if (target.closest(".text-content, p, h1, h2, h3, .left-char, .right-char")) {
        setCursorType("pen");
        setIsHovering(false);
      } else {
        setIsHovering(false);
        setCursorType("default");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  // Control visibility based on scroll progress (scenes)
  React.useEffect(() => {
    if (!activeScenes || activeScenes.length === 0) {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      
      const isInActiveScene = activeScenes.some(
        (scene) => scrollProgress >= scene.start && scrollProgress <= scene.end
      );
      
      setIsVisible(isInActiveScene);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeScenes]);

  // Hide on touch devices
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);
  React.useEffect(() => {
    setIsTouchDevice("ontouchstart" in window);
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Main cursor ring */}
      <div
        ref={cursorRef}
        className={`pointer-events-none fixed left-0 top-0 z-[9999] -ml-5 -mt-5 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 ${
            isHovering
              ? "scale-150 border-on-surface/40 bg-on-surface/5"
              : "scale-100 border-on-surface/20 bg-transparent"
          }`}
        >
          {/* Pen icon when over text */}
          {cursorType === "pen" && (
            <svg
              className="h-3 w-3 text-on-surface/60"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
          )}
        </div>
      </div>

      {/* Center dot - follows instantly */}
      <div
        ref={cursorDotRef}
        className={`pointer-events-none fixed left-0 top-0 z-[9999] -ml-1 -mt-1 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`h-2 w-2 rounded-full bg-on-surface transition-all duration-200 ${
            isHovering ? "scale-0" : "scale-100"
          }`}
        />
      </div>

      {/* Hide default cursor when custom cursor is visible */}
      <style jsx global>{`
        ${isVisible ? `
          * {
            cursor: none !important;
          }
        ` : ""}
      `}</style>
    </>
  );
}
