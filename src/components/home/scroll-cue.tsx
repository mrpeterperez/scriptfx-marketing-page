"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

export function ScrollCue({ ref, className = "" }: { ref?: React.Ref<HTMLButtonElement>; className?: string }) {
  return <button ref={ref} type="button" className={`scroll-cue ${className}`} onClick={() => window.scrollBy({ top: window.innerHeight * 0.6, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })}>
    <span>Scroll to continue</span>
    <ChevronDown size={20} aria-hidden="true" />
  </button>;
}
