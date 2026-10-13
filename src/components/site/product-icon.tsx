import { AudioLines, Clapperboard, FileText, Headphones, SlidersHorizontal } from "lucide-react";

export const scriptfxProducts = [
  { id: "screenplay", name: "Screenplay", description: "Write & revise", icon: FileText },
  { id: "audio", name: "Audio", description: "Voices & table reads", icon: AudioLines },
  { id: "immersion", name: "Full immersion", description: "Music, FX & spatial audio", icon: Headphones },
  { id: "video", name: "Video", description: "Generate shots & scenes", icon: Clapperboard },
  { id: "post", name: "Post-production", description: "AI edits & finishing", icon: SlidersHorizontal },
] as const;

export type ScriptFXProduct = typeof scriptfxProducts[number]["id"];

export function ProductIcon({ product, size = "default" }: { product: ScriptFXProduct; size?: "default" | "small" | "inline" }) {
  const Icon = scriptfxProducts.find(item => item.id === product)!.icon;
  return <span data-product={product} aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center bg-container text-on-surface ${size === "inline" ? "size-5 rounded-md" : size === "small" ? "size-8 rounded-xl" : "size-12 rounded-xl"}`}><Icon className={size === "inline" ? "size-3" : size === "small" ? "size-4" : "size-6"} strokeWidth={1.6} /></span>;
}
