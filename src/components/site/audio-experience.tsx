"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Headphones, Music2, Wind, Volume2, RotateCcw } from "lucide-react";
import { SpatialBlob } from "./spatial-blob";

const modes = [
  { title: "Table Read", blurb: "Hear your characters." },
  { title: "Audio Drama", blurb: "Hear the whole scene." },
  { title: "Immersion", blurb: "Put every sound in its place." },
];
const initialSounds = [
  { name: "Dialogue", x: 32, y: 35, level: 80, color: "gold" },
  { name: "Rain", x: 76, y: 30, level: 45, color: "cyan" },
  { name: "Footsteps", x: 68, y: 73, level: 65, color: "rose" },
];
const clamp = (n: number) => Math.max(12, Math.min(88, n));

export function AudioExperience({ initialMode = 0 }: { initialMode?: number }) {
  const [mode, setMode] = useState(initialMode);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [sounds, setSounds] = useState(initialSounds);
  const [selected, setSelected] = useState(0);
  const [cast, setCast] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const drag = useRef<number | null>(null);
  const sound = sounds[selected];

  useEffect(() => {
    if (!root.current) return;
    let visible = false, frame = 0, elapsed = 0, previous = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: .25 });
    observer.observe(root.current);
    const tick = (now: number) => {
      if (previous && visible && !document.hidden && !paused && !reduced.matches) elapsed += Math.min(now - previous, 100);
      previous = now;
      if (progress.current) progress.current.style.transform = `scaleX(${elapsed / 8000})`;
      if (elapsed >= 8000) { setMode(current => (current + 1) % 3); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [mode, cycle, paused]);

  const update = (index: number, patch: Partial<typeof sound>) => {
    setPaused(true);
    setSounds(current => current.map((s, i) => i === index ? { ...s, ...patch } : s));
  };
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag.current === null || !stage.current) return;
    const box = stage.current.getBoundingClientRect();
    update(drag.current, { x: clamp((event.clientX - box.left) / box.width * 100), y: clamp((event.clientY - box.top) / box.height * 100) });
  };

  return <section className="audio-experience" aria-label="Explore the audio workspace">
    <div className="writing-mode-layout audio-mode-layout" ref={root}>
      <div className="writing-mode-options" role="group" aria-label="Audio experiences">
        {modes.map((item, i) => <button key={item.title} aria-pressed={mode === i} aria-controls="audio-preview" onClick={() => { setMode(i); setCycle(c => c + 1); }}>
          <span className="writing-mode-progress" aria-hidden="true"><span ref={mode === i ? progress : undefined}/></span>
          <strong>{item.title}</strong><span>{item.blurb}</span>
        </button>)}
      </div>
      <div id="audio-preview" className={`audio-mat audio-mat-${mode}`}>
        <div className="audio-app">
          <div className="platform-app-titlebar"><div className="platform-traffic" aria-hidden="true"><i/><i/><i/></div><span>ScriptFX / {modes[mode].title}</span></div>
          {mode === 2 ? <div className="immersion-workspace">
            <div className="immersion-stage" ref={stage} aria-label="Spatial sound playground">
              <div className="immersion-stage-label"><span>THE LAST TRAIN</span><small>Drag a sound. Make room for the scene.</small></div>
              <div className="immersion-rings" aria-hidden="true"><i/><i/><i/></div>
              <div className="immersion-listener"><Headphones size={26}/><span>You</span></div>
              {sounds.map((s, i) => <button key={s.name} className={`immersion-source source-${s.color}`} style={{ left: `${s.x}%`, top: `${s.y}%`, opacity: s.level === 0 ? .4 : 1 }} aria-label={`${s.name} position. Use arrow keys to move.`} aria-pressed={selected === i}
                onPointerDown={e => { drag.current = i; setSelected(i); setPaused(true); e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={move} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
                onFocus={() => { setSelected(i); setPaused(true); }}
                onKeyDown={e => { const delta = e.shiftKey ? 8 : 2; if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) { e.preventDefault(); update(i, { x: clamp(s.x + (e.key === "ArrowRight" ? delta : e.key === "ArrowLeft" ? -delta : 0)), y: clamp(s.y + (e.key === "ArrowDown" ? delta : e.key === "ArrowUp" ? -delta : 0)) }); } }}>
                <SpatialBlob/><span>{s.name}</span>
              </button>)}
              <small className="immersion-stage-foot">TOP VIEW · INTERACTIVE PREVIEW</small>
            </div>
            <aside className="immersion-inspector"><span className="audio-eyebrow">Sound position</span><h3>{sound.name}</h3><p>Move it closer. Give it space.</p>
              <div className="audio-source-picker">{sounds.map((s, i) => <button key={s.name} aria-pressed={selected === i} onClick={() => { setSelected(i); setPaused(true); }}>{s.name}</button>)}</div>
              <label>Left / right <span>{Math.round(sound.x)}%</span><input aria-label="Left / right" type="range" min="12" max="88" value={sound.x} onChange={e => update(selected, { x: +e.target.value })}/></label>
              <label>Front / back <span>{Math.round(sound.y)}%</span><input aria-label="Front / back" type="range" min="12" max="88" value={sound.y} onChange={e => update(selected, { y: +e.target.value })}/></label>
              <label>Level <span>{sound.level}%</span><input aria-label="Sound level" type="range" min="0" max="100" value={sound.level} onChange={e => update(selected, { level: +e.target.value })}/></label>
              <button className="audio-reset" onClick={() => { setSounds(initialSounds); setPaused(true); }}><RotateCcw size={14}/>Reset positions</button>
              <small>Visual playground. No audio playback.</small>
            </aside>
          </div> : <div className="audio-scene-workspace" key={mode}>
            <aside className="audio-cast"><span className="audio-eyebrow">{mode === 0 ? "Your cast" : "Scene layers"}</span>
              {(mode === 0 ? ["Mara", "Eli"] : ["Dialogue", "Station ambience", "Passing train"]).map((name, i) => <button key={name} aria-pressed={cast === i} onClick={() => { setCast(i); setPaused(true); }}><span className="audio-cast-icon">{mode === 0 ? name[0] : i === 0 ? <Volume2 size={18}/> : i === 1 ? <Wind size={18}/> : <Music2 size={18}/>}</span><span>{name}<small>{mode === 0 ? "Character voice" : i === 0 ? "Performance" : "Sound design"}</small></span></button>)}
              <div className="audio-skeleton" aria-hidden="true"><i/><i/><i/></div>
            </aside>
            <div className="audio-scene-main"><div className="audio-script"><span className="audio-eyebrow">THE LAST TRAIN / SCENE 04</span><h3>INT. TRAIN STATION — NIGHT</h3><div className="audio-skeleton" aria-hidden="true"><i/><i/></div><div className={`audio-dialogue ${cast === 1 ? "is-selected" : ""}`}><b>ELI</b><p>You said the door would be open.</p></div><div className={`audio-dialogue ${cast === 0 ? "is-selected" : ""}`}><b>MARA</b><p>It was.</p></div><div className="audio-skeleton" aria-hidden="true"><i/><i/></div></div>
              <div className="audio-timeline"><div><span>{mode === 0 ? "Table read" : "Scene mix"}</span><small>00:12 / 00:38</small></div>{Array.from({ length: mode === 0 ? 1 : 3 }, (_, row) => <div className={`audio-wave audio-wave-${row} ${cast === row ? "is-selected" : ""}`} key={row} aria-hidden="true">{Array.from({ length: 60 }, (_, i) => <i key={i} style={{ height: `${18 + (i * 23 + row * 17) % 70}%` }}/>)}</div>)}<small>Illustrative scene · No audio playback</small></div>
            </div>
          </div>}
        </div>
      </div>
      <button className="writing-cycle-control" onClick={() => setPaused(p => !p)}>{paused ? "Resume preview" : "Pause preview"}</button>
    </div>
  </section>;
}
