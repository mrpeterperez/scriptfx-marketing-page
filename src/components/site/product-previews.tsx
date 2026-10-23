"use client";

import { useState } from "react";
import { MousePointer2 } from "lucide-react";

/**
 * Static look-alikes of the app's coverage and audience components, for the
 * product pages. Same shapes, colors, and wording as in ScriptFX; no data.
 */

/** A professional reader's photo (Unsplash, free license; hotlinked as Unsplash asks), the same one the app shows. */
const HUMAN_READER = "https://images.unsplash.com/photo-1581065178047-8ee15951ede6?w=160&h=160&fit=crop&crop=faces&q=80";

/** The app's margin-note colors. */
const MARKS = {
  premise: { label: "Premise", color: "#8a52c9" },
  plot: { label: "Story", color: "#c8423a" },
  characters: { label: "Characters", color: "#2f6fd0" },
  dialogue: { label: "Dialogue", color: "#b8892f" },
  setting: { label: "Setting", color: "#23896a" },
} as const;

/** A reader's avatar, a two-hue orb like the app's cast voices, with their number on it. */
function ReaderAvatar({ hues, number, size = 32 }: { hues: [number, number]; number: number; size?: number }) {
  return <span aria-hidden="true" className="grid shrink-0 place-items-center rounded-full font-semibold text-white [text-shadow:0_1px_2px_rgb(0_0_0/.35)]" style={{ width: size, height: size, fontSize: Math.round(size * 0.38), background: `radial-gradient(circle at 30% 25%, hsl(${hues[0]} 85% 72%), hsl(${hues[1]} 70% 46%))` }}>#{number}</span>;
}

const Panel = ({ children }: { children: React.ReactNode }) => <div className="w-full max-w-[440px] rounded-2xl bg-white p-5 text-left text-[#202020] shadow-[0_12px_40px_#0003]">{children}</div>;
const Label = ({ children }: { children: React.ReactNode }) => <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[#6b6b6b]">{children}</p>;

/** Coverage from a person: their photo, genre, verdict, a few ratings, and a note on the page. */
export function HumanCoveragePreview() {
  const ratings = [["Premise", 8], ["Story", 7], ["Characters", 9], ["Dialogue", 6]] as const;
  return <Panel>
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={HUMAN_READER} alt="" className="size-12 shrink-0 rounded-full object-cover" style={{ boxShadow: `0 0 0 2px ${MARKS.plot.color}` }} />
      <div className="min-w-0 flex-1"><p className="font-semibold">Script reader · Thrillers</p><p className="text-sm text-[#6b6b6b]">Read all 104 pages</p></div>
      <span className="rounded-full bg-[#202020] px-3 py-1 text-xs font-semibold text-white">Consider</span>
    </div>
    <ul className="mt-5 space-y-2.5">{ratings.map(([name, score]) => <li key={name} className="flex items-center gap-3 text-sm"><span className="w-24 shrink-0">{name}</span><span className="h-1.5 flex-1 rounded-full bg-[#ececec]"><i className="block h-full rounded-full bg-[#202020]" style={{ width: `${score * 10}%` }} /></span><span className="w-5 text-right tabular-nums">{score}</span></li>)}</ul>
    <div className="mt-5 rounded-xl bg-[#f5f5f5] p-3.5 text-[15px] leading-snug"><span className="mb-1 flex items-center gap-1.5 text-xs text-[#6b6b6b]"><i className="size-2.5 rounded-full" style={{ background: MARKS.plot.color }} />Story · Scene 41</span>“Let your hero win the climax on his own.”</div>
  </Panel>;
}

/** Instant notes: numbered readers, their margin notes, and what they agree on. */
export function InstantNotesPreview() {
  const notes = [
    { number: 1, hues: [28, 330] as [number, number], mark: MARKS.dialogue, scene: 12, note: "Mara says what she wants twice. Cut the second time." },
    { number: 2, hues: [200, 280] as [number, number], mark: MARKS.characters, scene: 18, note: "We need to see Leo choose this, not be told." },
    { number: 3, hues: [140, 220] as [number, number], mark: MARKS.premise, scene: 1, note: "The hook lands on page one. Keep it." },
  ];
  return <Panel>
    <Label>On your pages</Label>
    <ol className="space-y-1">{notes.map(item => <li key={item.number} className="flex items-start gap-2.5 rounded-xl p-2">
      <span className="mt-0.5 rounded-full" style={{ boxShadow: `0 0 0 2px ${item.mark.color}` }}><ReaderAvatar hues={item.hues} number={item.number} /></span>
      <span className="min-w-0 flex-1"><span className="flex items-center gap-1.5 text-xs text-[#6b6b6b]"><span className="font-medium text-[#202020]">Reader #{item.number}</span><i className="size-2.5 rounded-full" style={{ background: item.mark.color }} />{item.mark.label} · Scene {item.scene}</span><span className="mt-0.5 block text-[15px] leading-snug">{item.note}</span></span>
    </li>)}</ol>
    <p className="mt-3 rounded-xl bg-[#f5f5f5] p-3 text-sm"><strong className="font-semibold">All 3 agree:</strong> the second act drifts after the wedding.</p>
  </Panel>;
}

/** The popcorn bucket, filling as the share of hooked viewers rises. */
function PopcornBucket({ percent, size = 44 }: { percent: number; size?: number }) {
  const level = 18 - 16 * percent / 100;
  return <svg width={size} height={size * 1.2} viewBox="0 0 40 48" aria-hidden="true" className="shrink-0">
    <defs><clipPath id="popcorn-level"><rect x="0" y={level} width="40" height={20 - level} /></clipPath></defs>
    <g clipPath="url(#popcorn-level)" fill="#f2cf73" stroke="#d4a64a" strokeWidth=".8">{[[9, 16, 5], [31, 16, 5], [15, 11, 5.5], [25, 11, 5.5], [20, 15, 5.5], [11, 6, 4], [29, 6, 4], [20, 5, 5]].map(([cx, cy, r]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />)}</g>
    <path d="M5 18h30l-4 28H9z" fill="#c8423a" /><path d="M13 18h3.5l.5 28h-3zM23.5 18H27l-1.5 28h-3z" fill="#fff6ea" /><rect x="3.5" y="16" width="33" height="3.5" rx="1.75" fill="#c8423a" />
  </svg>;
}

const SCENES = ["INT. DINER – NIGHT", "EXT. PIER – DAWN", "INT. MARA’S CAR – DAY", "INT. PRECINCT – DAY", "EXT. ROOFTOP – NIGHT", "INT. CHAPEL – DAY", "INT. BAR – NIGHT", "EXT. HIGHWAY – NIGHT", "INT. WAREHOUSE – NIGHT", "EXT. DOCKS – DAWN"];
/** Each crowd's scores by metric, scene by scene, 1 to 10, with the first draft's interest for the popcorn change. */
const CROWDS = {
  everyday: { label: "Everyday", draftOne: [5, 5, 4, 5, 3, 5, 6, 5, 6, 6], engagement: [6, 7, 6, 8, 5, 7, 8, 9, 8, 9], tension: [3, 5, 4, 6, 7, 4, 6, 8, 9, 7], connection: [5, 5, 7, 6, 6, 8, 7, 7, 8, 9] },
  tough: { label: "Tough", draftOne: [4, 3, 3, 4, 2, 4, 4, 4, 5, 5], engagement: [5, 6, 4, 7, 4, 6, 7, 8, 7, 8], tension: [2, 4, 3, 5, 6, 3, 5, 7, 8, 6], connection: [4, 4, 6, 5, 4, 7, 6, 6, 7, 8] },
};
/** The app's journey wording: the question each dial line answers, and its three zones. */
const METRICS = {
  engagement: { tab: "Interest", question: "How interested are they?", levels: ["Bored", "Interested", "Hooked"] },
  tension: { tab: "Suspense", question: "How tense does it feel?", levels: ["Calm", "Uneasy", "On edge"] },
  connection: { tab: "Connection", question: "How much do they care?", levels: ["Distant", "Involved", "Invested"] },
} as const;
const VIEWERS = [{ name: "Genre fan", art: "/art/audience/genre-fan.jpg", shift: 1 }, { name: "Casual viewer", art: "/art/audience/casual-viewer.jpg", shift: -1 }, { name: "Character fan", art: "/art/audience/character-fan.jpg", shift: 0 }];
const feeling = (levels: readonly string[], value: number) => levels[value >= 7 ? 2 : value >= 4 ? 1 : 0];
/** The popcorn rating: the share of the crowd's interest, as a percent. */
const popcorn = (scores: number[]) => Math.round(scores.reduce((sum, n) => sum + n, 0) / (scores.length * 10) * 100);
const GOLD = "#c79a3c";
/** 1 to 10, top to bottom of the chart's 0 to 100 box, as in the app. */
const dialY = (value: number) => 100 - (value - 1) / 9 * 100;

/** A smooth line through the points and the area under it, the app's dial-line curve. */
function dialPaths(values: number[]) {
  const at = values.map((value, index) => [(index + .5) / values.length * 100, dialY(value)]);
  const line = at.map(([px, py], index) => { if (!index) return `M${px},${py}`; const [ox, oy] = at[index - 1], mid = (ox + px) / 2; return `C${mid},${oy} ${mid},${py} ${px},${py}`; }).join(" ");
  return { line, area: `${line} L${at.at(-1)![0]},100 L${at[0][0]},100 Z` };
}

/**
 * A test screening you can play with, drawn like the app's dial line: pick the
 * crowd and the feeling, then point at a scene to hear how each viewer felt.
 */
export function AudiencePreview() {
  const [crowd, setCrowd] = useState<keyof typeof CROWDS>("everyday");
  const [metric, setMetric] = useState<keyof typeof METRICS>("engagement");
  const [picked, setPicked] = useState(7);
  const [hovered, setHovered] = useState<number | null>(null);
  const scores = CROWDS[crowd], values = scores[metric], language = METRICS[metric];
  const shown = hovered ?? picked;
  const { line, area } = dialPaths(values);
  const score = popcorn(scores.engagement), change = score - popcorn(scores.draftOne);
  const marker = { left: `${(shown + .5) / values.length * 100}%`, top: `${dialY(values[shown])}%` };
  return <Panel>
    <div className="flex items-center gap-3"><PopcornBucket percent={score} /><div className="min-w-0 flex-1"><p className="text-lg"><strong className="font-semibold">{score}%</strong> <span className="text-[#6b6b6b]">hooked</span></p><p className="text-sm text-[#2f9e5b]">+{change} since Draft 1</p></div>
      <div role="group" aria-label="Audience" className="flex shrink-0 rounded-full bg-[#f0f0f0] p-1 text-xs">{(Object.keys(CROWDS) as (keyof typeof CROWDS)[]).map(key => <button key={key} type="button" aria-pressed={crowd === key} onClick={() => setCrowd(key)} className={`cursor-pointer rounded-full px-2.5 py-1 font-medium transition-colors ${crowd === key ? "bg-white text-[#202020] shadow-sm" : "text-[#6b6b6b]"}`}>{CROWDS[key].label}</button>)}</div>
    </div>
    <div role="group" aria-label="Feeling" className="mt-4 flex gap-1.5">{(Object.keys(METRICS) as (keyof typeof METRICS)[]).map(key => <button key={key} type="button" aria-pressed={metric === key} onClick={() => setMetric(key)} className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${metric === key ? "bg-[#202020] text-white" : "bg-[#f0f0f0] text-[#6b6b6b]"}`}>{METRICS[key].tab}</button>)}</div>
    <section className="mt-3 flex flex-col gap-3 rounded-2xl bg-[#f7f7f7] p-4" aria-label={language.question}>
      <p className="text-sm font-semibold">{language.question}</p>
      <div className="flex gap-2">
        <div className="flex w-16 shrink-0 flex-col justify-between py-1 text-[11px] text-[#6b6b6b] [&>span]:flex [&>span]:flex-1 [&>span]:items-center" style={{ height: 128 }} aria-hidden="true"><span>{language.levels[2]}</span><span>{language.levels[1]}</span><span>{language.levels[0]}</span></div>
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-lg bg-[#ebebeb]/60" style={{ height: 128 }} onMouseLeave={() => setHovered(null)}>
          <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs><linearGradient id="dial-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GOLD} stopOpacity=".35" /><stop offset="100%" stopColor={GOLD} stopOpacity="0" /></linearGradient></defs>
            <rect x="0" y="0" width="100" height="33.33" fill={GOLD} fillOpacity=".12" />
            <rect x="0" y="66.67" width="100" height="33.33" fill="#c8423a" fillOpacity=".06" />
            <path d={area} fill="url(#dial-fill)" />
            <path d={line} fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <line x1={parseFloat(marker.left)} x2={parseFloat(marker.left)} y1="0" y2="100" stroke="#202020" strokeOpacity=".25" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
          </svg>
          <i className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#f7f7f7] bg-[#202020] transition-all duration-200" style={marker} aria-hidden="true" />
          <div className="absolute inset-0 flex">{values.map((value, index) => <button key={index} type="button" aria-label={`Scene ${index + 1}`} aria-pressed={index === picked} className="h-full min-w-0 flex-1 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#202020]" onMouseEnter={() => setHovered(index)} onFocus={() => setHovered(index)} onBlur={() => setHovered(null)} onClick={() => setPicked(index)} />)}</div>
        </div>
      </div>
      <p className="text-xs leading-snug" aria-live="polite"><strong>Scene {shown + 1}</strong> · {SCENES[shown]} · <strong>{feeling(language.levels, values[shown])}</strong></p>
      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#6b6b6b]">{VIEWERS.map(viewer => <li key={viewer.name} className="flex items-center gap-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={viewer.art} alt="" className="size-6 rounded-full object-cover" /><span><span className="text-[#202020]">{viewer.name}</span> {feeling(language.levels, Math.max(1, Math.min(10, values[shown] + viewer.shift))).toLowerCase()}</span></li>)}</ul>
    </section>
  </Panel>;
}

/** Gray placeholder lines, standing in for a beat's or scene's text. */
const Lines = ({ widths }: { widths: string[] }) => <span className="mt-1.5 grid gap-1">{widths.map((width, i) => <i key={i} className="block h-1.5 rounded-full bg-[#e6e6e6]" style={{ width }} />)}</span>;

const ACTS = [
  { act: 1, beats: [{ title: "Opening Image", scenes: ["#f2b544"] }, { title: "Catalyst", scenes: ["#5b8def", "#f2b544"] }] },
  { act: 2, beats: [{ title: "Fun and Games", scenes: ["#5b8def", "#2f9e5b", "#f2b544"] }, { title: "Midpoint", scenes: ["#8a52c9"] }] },
  { act: 3, beats: [{ title: "Finale", scenes: ["#c8423a", "#5b8def"] }, { title: "Final Image", scenes: ["#f2b544"] }] },
];

/** The Beats board: acts, the story guide's beats, and each beat's scenes, colored by time of day like the app's scene cards. */
export function BeatsPreview() {
  return <div className="w-full max-w-[520px] rounded-2xl bg-white p-4 text-left text-[#202020] shadow-[0_12px_40px_#0002]">
    <div className="mb-3 flex items-center justify-between text-xs"><span className="text-[#6b6b6b]">15 beats · every scene has a beat</span><span className="rounded-full bg-[#f0f0f0] px-2.5 py-1 font-medium">Save the Cat!®</span></div>
    <div className="grid grid-cols-3 gap-2.5">{ACTS.map(({ act, beats }) => <section key={act} className="rounded-xl bg-[#f6f6f6] p-2">
      <p className="mb-2 flex justify-between px-1 text-[11px] font-medium uppercase tracking-wide text-[#6b6b6b]"><span>Act {act}</span><span className="tabular-nums">{beats.length}</span></p>
      <div className="grid gap-2">{beats.map(beat => <div key={beat.title} className="rounded-lg bg-white p-2 shadow-[0_1px_2px_#0000000f]">
        <p className="text-[12px] font-semibold leading-tight">{beat.title}</p><Lines widths={["90%", "60%"]} />
        <div className="mt-2 grid gap-1">{beat.scenes.map((color, i) => <span key={i} className="flex items-center gap-1.5 rounded-md bg-[#f6f6f6] px-1.5 py-1"><i className="h-5 w-1 shrink-0 rounded-full" style={{ background: color }} /><Lines widths={["70%"]} /></span>)}</div>
      </div>)}</div>
    </section>)}</div>
  </div>;
}

const PAGE_NOTES = [
  { top: "18%", mark: MARKS.premise, who: "Reader #3", note: "The hook lands on page one. Keep it." },
  { top: "47%", mark: MARKS.dialogue, who: "Script reader · Thrillers", note: "She says what she wants twice. Cut the second time." },
  { top: "74%", mark: MARKS.characters, who: "Reader #2", note: "We need to see Leo choose this, not be told." },
];

/** A screenplay page with readers' notes as dots in the margin; pick a dot to read its note, like the app's page overlay. */
export function ScriptPageNotesPreview() {
  const [open, setOpen] = useState(1);
  return <div className="relative w-full max-w-[440px] rounded-md bg-white px-10 py-8 text-left font-mono text-[11px] leading-[1.55] text-[#202020] shadow-[0_12px_40px_#0003]">
    <p className="font-bold">INT. DINER – NIGHT</p>
    <p className="mt-2">Rain on the glass. MARA (30s) slides into the booth across from LEO.</p>
    <p className="mt-3 ml-[38%]">MARA</p>
    <p className="ml-[22%] mr-[18%]">I want the car. I want the money. I want the car, Leo.</p>
    <p className="mt-3 ml-[38%]">LEO</p>
    <p className="ml-[22%] mr-[18%]">You always did.</p>
    <p className="mt-3">He slides the keys across the table. She doesn’t take them.</p>
    <Lines widths={["100%", "85%", "92%"]} />
    {PAGE_NOTES.map((item, index) => <button key={index} type="button" aria-label={`${item.who}: ${item.mark.label}`} aria-pressed={open === index} onClick={() => setOpen(index)} onMouseEnter={() => setOpen(index)} className="absolute -left-2.5 grid size-5 cursor-pointer place-items-center rounded-full bg-white shadow" style={{ top: item.top }}><i className="size-2.5 rounded-full" style={{ background: item.mark.color }} /></button>)}
    <div className="absolute -right-6 w-56 rounded-xl bg-[#202020] p-3 font-sans text-[13px] leading-snug text-white shadow-xl transition-all duration-300" style={{ top: `calc(${PAGE_NOTES[open].top} + 18px)` }} aria-live="polite">
      <span className="mb-1 flex items-center gap-1.5 text-[11px] text-white/60"><i className="size-2 rounded-full" style={{ background: PAGE_NOTES[open].mark.color }} />{PAGE_NOTES[open].who} · {PAGE_NOTES[open].mark.label}</span>{PAGE_NOTES[open].note}
    </div>
  </div>;
}

/** Two writers in one script: who's here, their cursors, and a producer's note on the line. */
export function TogetherPreview() {
  return <div className="relative w-full max-w-[440px] rounded-md bg-white px-10 py-8 font-mono text-[12px] leading-[1.55] text-[#202020] shadow-[0_12px_40px_#0002]">
    <span className="absolute right-4 top-3 flex -space-x-1.5">{[["K", "#5b8def"], ["A", "#2f9e5b"], ["Y", "#c8423a"]].map(([who, color]) => <span key={who} className="grid size-6 place-items-center rounded-full border-2 border-white font-sans text-[10px] font-semibold text-white" style={{ background: color }}>{who}</span>)}</span>
    <p className="font-bold">INT. DINER – NIGHT</p>
    <p className="mt-2">Rain on the glass. MARA slides into the booth across from LEO.</p>
    <p className="mt-3 ml-[38%]">MARA</p>
    <p className="ml-[22%] mr-[18%] rounded bg-[#5b8def1f]">I want the car, Leo.</p>
    <p className="mt-3 ml-[38%]">LEO</p>
    <p className="ml-[22%] mr-[18%]">You always did.</p>
    <span className="absolute left-[46%] top-[52%] flex items-center gap-1 font-sans text-[10px] font-semibold text-white"><MousePointer2 size={16} className="fill-[#5b8def] text-[#5b8def]" /><span className="rounded bg-[#5b8def] px-1.5 py-0.5">Kim</span></span>
    <span className="absolute left-[18%] top-[80%] flex items-center gap-1 font-sans text-[10px] font-semibold text-white"><MousePointer2 size={16} className="fill-[#2f9e5b] text-[#2f9e5b]" /><span className="rounded bg-[#2f9e5b] px-1.5 py-0.5">Alex</span></span>
    <div className="absolute -right-6 top-[36%] w-44 rounded-xl bg-[#202020] p-3 font-sans text-[12px] leading-snug text-white shadow-xl"><span className="mb-1 block text-[10px] text-white/60">Kim · Producer</span>Can she ask for the keys instead?</div>
  </div>;
}
