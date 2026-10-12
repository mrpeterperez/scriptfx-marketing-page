import type { ReactNode } from "react";

export function materialFor(slug: string) {
  return ["video", "table-reads", "audio-drama", "filmmakers", "audio-storytellers"].includes(slug) ? "velvet" : "gold";
}

export function MaterialFrame({ slug, children, className = "" }: { slug: string; children: ReactNode; className?: string }) {
  return <div className={`material-frame material-${materialFor(slug)} ${className}`}>{children}</div>;
}
