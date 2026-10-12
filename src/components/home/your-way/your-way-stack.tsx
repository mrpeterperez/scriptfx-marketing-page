import { yourWayFrames } from "./your-way-data";
import { YourWayCard } from "./your-way-card";

/**
 * The "Any Setup" cards — two straight cards side by side.
 *
 * The row carries a fixed height on desktop and each card fills it (h-full),
 * so card dimensions never depend on `aspect-ratio` resolving through the
 * flex chain. That chain was unstable inside the scroll-animated, auto-height
 * container and thrashed layout on every scroll frame.
 */
export function YourWayStack({
  registerCard,
}: {
  registerCard?: (index: number, el: HTMLDivElement | null) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 md:h-[clamp(260px,34vh,340px)] md:flex-row md:gap-6">
      {yourWayFrames.map((frame, i) => (
        <div
          key={frame.id}
          ref={(el) => registerCard?.(i, el)}
          className="flex-1 will-change-transform md:h-full"
        >
          <YourWayCard frame={frame} />
        </div>
      ))}
    </div>
  );
}
