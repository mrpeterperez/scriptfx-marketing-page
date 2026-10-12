import Image from "next/image";
import type { YourWayFrame } from "./your-way-data";

/**
 * Film-still card for the "Any Setup" section — full-bleed image with a
 * bottom-up dark gradient and the mode + title centered at the bottom.
 */
export function YourWayCard({ frame }: { frame: YourWayFrame }) {
  return (
    <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-[16px] border border-white/10 bg-white/5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] md:aspect-auto md:h-full">
      {/* Film still */}
      <Image
        src={frame.image}
        alt={frame.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Bottom-up dark gradient for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />

      {/* Bottom content — centered */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-5 text-center md:p-6">
        <span className="rounded-full bg-black px-3 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
          {frame.mode}
        </span>
        <h3 className="font-display text-3xl font-medium leading-[1.05] tracking-tight text-white md:text-4xl">
          {frame.title}
        </h3>
        <p className="font-body text-sm font-light leading-snug text-white/70">
          {frame.tagline}
        </p>
      </div>
    </div>
  );
}
