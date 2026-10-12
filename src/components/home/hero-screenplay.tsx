"use client";

import * as React from "react";
import mountainDialogue from "./hero-dialogue.json";
import bakersDialogue from "./bakers-dialogue.json";
import { bakersCues } from "./bakers-screenplay";

// Shot boundaries are the presentation timestamps of the first frame after each cut.
const mountainCues = [
  { at: 0, shot: 1, lines: [
    ["scene", "EXT. MOUNTAIN RANGE – AERIAL – LATE AFTERNOON"],
    ["action", "An endless sea of pine. Snow clings to the distant peaks. A single road coils up the mountainside."],
    ["action", "On it, a black SUV. A speck. Climbing."],
    ["action", "Wind. The faint hiss of tires. Nothing else."],
    ["action", "CHRISTMAS WEEK."],
  ] },
  { at: 25088 / 15360, shot: 2, lines: [
    ["scene", "INT. BLACK SUV – MOVING – CONTINUOUS"],
    ["action", "Travel clutter. Foil-wrapped leftovers on the console. A dog collar jingles."],
    ["action", "MIGUEL (40s), behind the wheel, holds a practiced calm."],
    ["action", "SOFIA (40s), passenger seat, thumbs a dead phone. Sighs."],
    ["action", "In back: ALEX (12) slumps against the window. JAMIE (8), deaf, sits beside a GOLDENDOODLE that takes up more than its share of the seat."],
  ] },
  { at: 1.66, shot: 2, lines: [
    ["character", "SOFIA"], ["dialogue", "Ninety percent off."],
    ["character", "MIGUEL"], ["dialogue", "Executive retreat program."],
    ["character", "SOFIA"], ["dialogue", "Stop laying pipe. We're already driving up the creepy mountain. People get it."],
    ["action", "The Goldendoodle barks."],
    ["action", "Miguel glances at her. Doesn't follow. Lets it go."],
    ["action", "Jamie presses her forehead to the glass."],
  ] },
  { at: 96000 / 15360, shot: 3, lines: [
    ["scene", "EXT. MOUNTAINSIDE – JAMIE'S POV – MOVING"],
    ["action", "Across the valley, a scattering of isolated houses."],
    ["action", "Outside one, a FIGURE stands at the edge of a lawn. Its face is white. Smooth. Blank."],
    ["action", "It holds a pie on a tray."],
    ["action", "It does not move."],
    ["action", "The SUV rounds a bend. Another house. Another white face. Another pie."],
    ["action", "Then another."],
    ["action", "A low tone creeps in beneath the engine."],
  ] },
  { at: 136448 / 15360, shot: 4, lines: [
    ["scene", "INT. BLACK SUV – MOVING – CONTINUOUS"],
    ["action", "The Goldendoodle lifts its head. Ears up. Silent."],
    ["action", "Jamie spins to Alex. Signs fast, urgent: LOOK. LOOK."],
    ["action", "Alex rolls his eyes. Glances out anyway."],
  ] },
  { at: 9.84, shot: 4, lines: [
    ["scene", "INT. BLACK SUV – MOVING – CONTINUOUS"],
    ["action", "Alex goes still."],
    ["action", "Sofia catches the kids in the mirror. Turns around."],
    ["character", "SOFIA"], ["dialogue", "What?"],
    ["action", "Neither child answers."],
  ] },
  { at: 11.8, shot: 4, lines: [
    ["scene", "EXT. ROADSIDE HOUSE – ALEX'S POV – MOVING"],
    ["action", "The nearest figure. White face. Pie held perfectly level."],
    ["action", "As the SUV passes, its head turns."],
    ["action", "Slowly."],
    ["action", "Following them."],
  ] },
  { at: 195328 / 15360, shot: 5, lines: [
    ["scene", "EXT. MOUNTAIN ROAD – WIDE – LATE AFTERNOON"],
    ["action", "The SUV continues its climb, tiny against the mountain."],
    ["action", "Across the hills, white faces dot the landscape. Dozens. Each holding a pie."],
    ["action", "Each one watching."],
    ["transition", "CUT TO BLACK."],
  ] },
];

type ScrollPoint = { time: number; position: number };

function interpolate(points: ScrollPoint[], value: number, from: "time" | "position", to: "time" | "position") {
  if (from === "position") {
    const exact = points.find((point) => Math.abs(point.position - value) < .5);
    if (exact) return exact.time;
  }
  const next = points.findIndex((point) => point[from] > value);
  if (next === 0) return points[0][to];
  if (next < 0) return points.at(-1)?.[to] ?? 0;
  const before = points[next - 1];
  const after = points[next];
  const distance = after[from] - before[from];
  let progress = distance ? (value - before[from]) / distance : 0;
  if (from === "time") progress = progress * progress * (3 - 2 * progress);
  else {
    let low = 0;
    let high = 1;
    for (let i = 0; i < 20; i++) {
      const middle = (low + high) / 2;
      if (middle * middle * (3 - 2 * middle) < progress) low = middle;
      else high = middle;
    }
    progress = (low + high) / 2;
  }
  return before[to] + (after[to] - before[to]) * progress;
}

export function HeroScreenplay({ time, videoRef, bakers = false }: { time: number; videoRef: React.RefObject<HTMLVideoElement | null>; bakers?: boolean }) {
  const cues = bakers ? bakersCues : mountainCues;
  const dialogueTimings = bakers ? bakersDialogue : mountainDialogue;
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const pageRef = React.useRef<HTMLDivElement>(null);
  const pointsRef = React.useRef<ScrollPoint[]>([]);
  const scrubbingRef = React.useRef(false);
  const active = Math.max(0, cues.findLastIndex((cue) => time >= cue.at));

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const page = pageRef.current;
    const video = videoRef.current;
    if (!viewport || !page || !video) return;
    const measure = () => {
      page.style.paddingTop = `${viewport.clientHeight * .5}px`;
      page.style.paddingBottom = `${viewport.clientHeight * .5}px`;
      const points: ScrollPoint[] = [{ time: 0, position: 0 }];
      const speechRanges: { start: number; end: number }[] = [];
      page.querySelectorAll<HTMLElement>("[data-dialogue]").forEach((line) => {
        const words = Array.from(line.querySelectorAll<HTMLElement>("[data-start]"));
        if (!words.length) return;
        const position = line.getBoundingClientRect().top - page.getBoundingClientRect().top + line.clientHeight / 2 - viewport.clientHeight / 2;
        speechRanges.push({ start: Number(words[0].dataset.start), end: Number(words.at(-1)?.dataset.end) });
        points.push({ time: Number(words[0].dataset.start), position });
        points.push({ time: Number(words.at(-1)?.dataset[words.length === 1 ? "end" : "start"]), position });
      });
      page.querySelectorAll<HTMLElement>("[data-cue]").forEach((passage) => {
        const cueTime = Number(passage.dataset.cue);
        if (cueTime > 0 && !speechRanges.some((range) => cueTime >= range.start - .3 && cueTime <= range.end)) {
          points.push({ time: cueTime, position: passage.getBoundingClientRect().top - page.getBoundingClientRect().top - viewport.clientHeight * .5 });
        }
      });
      points.push({ time: Number.isFinite(video.duration) ? video.duration : 15.069751, position: viewport.scrollHeight - viewport.clientHeight });
      points.sort((a, b) => a.time - b.time);
      pointsRef.current = points.map((point, index) => ({ ...point, position: Math.max(0, ...points.slice(0, index + 1).map((entry) => entry.position)) }));
      if (!scrubbingRef.current) viewport.scrollTop = interpolate(pointsRef.current, video.currentTime, "time", "position");
    };
    const resume = () => { scrubbingRef.current = false; };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(page);
    video.addEventListener("loadedmetadata", measure);
    video.addEventListener("play", resume);
    measure();
    return () => {
      observer.disconnect();
      video.removeEventListener("loadedmetadata", measure);
      video.removeEventListener("play", resume);
    };
  }, [videoRef]);

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (viewport && !scrubbingRef.current && pointsRef.current.length) {
      viewport.scrollTop = interpolate(pointsRef.current, time, "time", "position");
    }
  }, [time]);

  const beginScrub = () => {
    scrubbingRef.current = true;
    videoRef.current?.pause();
  };

  return (
    <aside className="hero-screenplay" aria-label="Screenplay synchronized with the film">
      <div
        ref={viewportRef}
        className="hero-script-viewport"
        tabIndex={0}
        aria-label="Scroll screenplay to scrub the film"
        onWheel={beginScrub}
        onTouchStart={beginScrub}
        onPointerDown={beginScrub}
        onKeyDown={(event) => { if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) beginScrub(); }}
        onScroll={() => {
          if (scrubbingRef.current && videoRef.current && viewportRef.current && pointsRef.current.length) {
            videoRef.current.currentTime = interpolate(pointsRef.current, viewportRef.current.scrollTop, "position", "time");
          }
        }}
      >
        <div ref={pageRef} className="hero-script-page">
          {cues.map((cue, index) => (
            <div key={cue.at} className={`hero-script-passage${index === active ? " is-active" : ""}`} data-cue={cue.at}>
              {cue.lines.map(([type, text], line) => {
                const timing = type === "dialogue" ? dialogueTimings.find((entry) => entry.text === text) : undefined;
                return <p key={line} className={`hero-script-${type}`} data-dialogue={timing ? text : undefined}>
                  {timing ? <span className="hero-script-dialogue-text">{timing.words.map((word, wordIndex) => (
                    <React.Fragment key={wordIndex}>
                      {wordIndex > 0 && " "}
                      <span className={time >= word.start && time < word.end ? "hero-script-word is-speaking" : "hero-script-word"} data-start={word.start} data-end={word.end}>{word.word}</span>
                    </React.Fragment>
                  ))}</span> : text}
                </p>;
              })}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
