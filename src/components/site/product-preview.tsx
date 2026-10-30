"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "classic" | "tools" | "ai";
export function ProductPreview({ mode, onInteract, enabled = true, fit = false, compactCanvas = false, compactBelow = 420, label = "Animated ScriptFX product demonstration. Choose Classic, With tools, or With AI above." }: { mode: Mode; onInteract?: () => void; enabled?: boolean; fit?: boolean; compactCanvas?: boolean; compactBelow?: number; label?: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const active = useRef(false);
  const [initialMode] = useState(mode);
  const [mounted, setMounted] = useState(false);
  const [tap, setTap] = useState<{ x: number; y: number; id: number } | null>(null);
  const [canvas, setCanvas] = useState<{ scale: number; height: number } | null>(null);
  useEffect(() => {
    if (!compactCanvas || !container.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width <= 0 || height <= 0) return;
      setCanvas(width < compactBelow ? { scale: width / 960, height: height / (width / 960) } : null);
    });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [compactCanvas, compactBelow]);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      active.current = enabled && entry.isIntersecting;
      if (active.current) setMounted(true);
      frame.current?.contentWindow?.postMessage({ type: "scriptfx-preview-visibility", active: active.current }, location.origin);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled]);
  useEffect(() => {
    frame.current?.contentWindow?.postMessage({ type: "scriptfx-preview-mode", mode }, location.origin);
    const ready = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow || event.data?.type !== "scriptfx-preview-ready") return;
      frame.current?.contentWindow?.postMessage({ type: "scriptfx-preview-mode", mode }, location.origin);
      frame.current?.contentWindow?.postMessage({ type: "scriptfx-preview-visibility", active: active.current }, location.origin);
    };
    window.addEventListener("message", ready);
    return () => window.removeEventListener("message", ready);
  }, [mode]);
  return <div ref={container} className="platform-product-live" role="img" aria-label={label} onPointerDown={event => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setTap({ x: event.clientX - bounds.left, y: event.clientY - bounds.top, id: Date.now() });
    onInteract?.();
  }}>
    {mounted && <iframe ref={frame} inert tabIndex={-1} aria-hidden="true" src={`/product-preview/index.html?mode=${initialMode}${fit ? "&fit=1" : ""}`} style={canvas ? { position: "absolute", left: 0, top: 0, width: 960, height: canvas.height, transform: `scale(${canvas.scale})`, transformOrigin: "0 0" } : undefined} title="Animated ScriptFX screenwriting preview" />}
    {tap && <span key={tap.id} className="platform-preview-tap" style={{ left: tap.x, top: tap.y }} onAnimationEnd={() => setTap(null)} />}
  </div>;
}
