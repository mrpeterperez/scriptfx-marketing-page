"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/** The "i" by a plan's credits: opens on hover with a mouse, on tap on a phone. */
export function CreditsInfo({ video, className }: { video?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  // Mouse only: a tap also fires pointer events, and the trigger's own click handles it.
  const hover = {
    onPointerEnter: (event: React.PointerEvent) => { if (event.pointerType === "mouse") setOpen(true); },
    onPointerLeave: (event: React.PointerEvent) => { if (event.pointerType === "mouse") setOpen(false); },
  };
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger {...hover} className={`mt-1 rounded-full ${className ?? ""}`} aria-label="What credits go toward"><Info className="size-4" strokeWidth={1.6} aria-hidden="true" /></PopoverTrigger>
    <PopoverContent {...hover} align="end" className="w-64 text-sm leading-6">Credits go toward {video ? "video, " : ""}table reads, audio dramas, sound effects, AI coverage, and more. Every button shows the cost before you generate.</PopoverContent>
  </Popover>;
}
