import { AudioWaveform, Clapperboard, FileText, Headphones, Megaphone, Mic, Music, Orbit, SlidersHorizontal } from "lucide-react";

export const scriptfxProducts = [
  { id: "screenplay", name: "Screenplay", icon: FileText },
  { id: "video", name: "Video", icon: Clapperboard },
  { id: "directing", name: "Live Directing", icon: Megaphone },
  { id: "voices", name: "Voices", icon: Mic },
  { id: "sfx", name: "Sound effects", icon: AudioWaveform },
  { id: "music", name: "Music", icon: Music },
  { id: "drama", name: "Audio dramas", icon: Headphones },
  { id: "immersive", name: "Immersive", icon: Orbit },
  { id: "post", name: "Post-production", icon: SlidersHorizontal },
] as const;

export type ScriptFXProduct = typeof scriptfxProducts[number]["id"];

export function ProductIcon({ product, size = "default" }: { product: ScriptFXProduct; size?: "default" | "small" | "inline" }) {
  const Icon = scriptfxProducts.find(item => item.id === product)!.icon;
  return <span data-product={product} aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center bg-container text-on-surface ${size === "inline" ? "size-5 rounded-md" : size === "small" ? "size-8 rounded-xl" : "size-12 rounded-xl"}`}><Icon className={size === "inline" ? "size-3" : size === "small" ? "size-4" : "size-6"} strokeWidth={1.6} /></span>;
}
