"use client";

import { FilmPlate } from "@/components/effects/film-plate";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { Check, Film, LayoutGrid } from "lucide-react";
import { Workspace } from "@/components/site/writing-features";
import { BeatsPreview, TogetherPreview } from "@/components/site/product-previews";
import { ImmersiveStage, ListenBack, SceneBuilder, VoiceCast, WriteListenRewrite } from "@/components/site/feature-showcases";
import { useProductDemo } from "@/components/site/product-demo";
import { HeroScreenplay } from "./hero-screenplay";

export type MomentKind = "elements" | "beats" | "revisions" | "together" | "voices" | "table-read" | "rewrite" | "sound-film" | "immersive" | "storyboard" | "film" | "cut";

const stills = [
  { src: "/video/mountain-scene-poster.jpg", label: "01 / Wide", position: "50% 50%" },
  { src: "/video/bakers-dozen-poster.jpg", label: "02 / Two shot", position: "50% 50%" },
  { src: "/video/bakers-dozen-poster.jpg", label: "03 / Close", position: "80% 50%" },
];

function WorkspaceMoment() {
  const demo = useProductDemo();
  const [selected, setSelected] = useState<number | null>(null);
  const index = selected ?? (demo?.active ? Math.floor(demo.time / 4) % 3 : 0);
  const modes = ["classic", "tools", "ai"];
  return <div className={`landing-workspace writing-mode-layout mode-${modes[index]}`}>
    <div className="writing-mode-options" role="group" aria-label="Workspace preview">{["Classic", "With tools", "With AI"].map((label, i) => <button key={label} type="button" aria-pressed={index === i} onClick={() => setSelected(i)}><strong>{label}</strong><span>{["Just you and the page.", "Structure and perspective.", "You direct. It helps."][i]}</span><i className="landing-preview-progress" style={{ transform: `scaleX(${index === i ? (demo?.time ?? 0) % 4 / 4 : 0})` }} /></button>)}</div>
    <div className={`writing-simple-demo platform-pinned ${index > 0 ? "writing-tools-open" : ""} ${index === 2 ? "writing-ai-open" : ""}`}><Workspace active={0} toolsOpen={index > 0} aiOpen={index === 2} /></div>
  </div>;
}

function StoryboardMoment() {
  const demo = useProductDemo();
  const selected = demo?.active ? Math.floor(demo.time / 2.5) % 3 : 0;
  return <div className="landing-storyboard-app"><div className="landing-demo-bar"><span><LayoutGrid size={15} /> Storyboard</span><span>Scene 01</span></div><div className="landing-shot-large"><Image src={stills[selected].src} alt="Shot reference from the example films" width={960} height={540} style={{ objectPosition: stills[selected].position }} /><span>{stills[selected].label}</span></div><div className="landing-shot-list">{stills.map((still, index) => <div key={still.label} className={selected === index ? "is-selected" : ""} data-moment-reveal><Image src={still.src} alt="" width={240} height={135} style={{ objectPosition: still.position }} /><span>{still.label}</span></div>)}</div></div>;
}

const versions = [
  { action: "Mara sits. Leo keeps the keys.", direction: "", line: "I want the car. And I want the money. Tonight, Leo." },
  { action: "Mara leans across the table.", direction: "(quietly)", line: "The car. The money. Tonight, Leo." },
  { action: "Mara takes the keys. Leo watches.", direction: "", line: "Keep the money. I’m taking the car." },
];

function VersionsMoment() {
  const demo = useProductDemo();
  const [selected, setSelected] = useState<number | null>(null);
  const active = selected ?? (demo?.active ? Math.floor(demo.time / 3) % versions.length : 0);
  const colors = ["#0090ff", "#8e4ec6", "#00a2c7"];
  return <div className="landing-versions" aria-label="Three versions of the same screenplay scene">{versions.map((version, index) => <article key={index} className={active === index ? "is-active" : ""} style={{ "--version-accent": colors[index] } as CSSProperties} data-moment-reveal>
    <button type="button" aria-pressed={active === index} onClick={() => setSelected(index)}><span className="version-label"><i aria-hidden="true" />Version {index + 1}</span>{index === 0 && <span className="version-in-script"><Check size={12} aria-hidden="true" />In script</span>}</button>
    <div className="landing-version-paper"><p className="version-slug">INT. DINER – NIGHT</p><p className="version-action">{version.action}</p><p className="version-character">MARA</p>{version.direction && <p className="version-direction">{version.direction}</p>}<p className="version-dialogue">{version.line}</p></div>
  </article>)}</div>;
}

function FilmMoment({ cut = false }: { cut?: boolean }) {
  const demo = useProductDemo();
  const video = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState(0);
  useEffect(() => {
    const clip = video.current;
    if (!clip) return;
    clip.muted = !demo?.sound;
    if (demo?.active) void clip.play().catch(() => {});
    else clip.pause();
    return () => clip.pause();
  }, [demo?.active, demo?.sound]);
  return <div className="landing-film-app"><div className="landing-demo-bar"><span><Film size={15} />{cut ? "Review takes" : "Scene preview"}</span><span>{cut ? "Take 02" : "Screenplay → Film"}</span></div><div className="landing-film-screen"><video ref={video} controls muted playsInline loop preload="none" poster={cut ? "/video/bakers-dozen-poster.jpg" : "/video/mountain-scene-poster.jpg"} src={cut ? "/video/bakers-dozen.mp4" : "/video/mountain-scene.mp4"} onTimeUpdate={event => setTime(event.currentTarget.currentTime)} aria-label={cut ? "Play the second example take" : "Play the example film"} /><FilmPlate /><HeroScreenplay time={time} videoRef={video} bakers={cut} /></div>{cut && <div className="landing-take-row">{["Take 01", "Take 02", "Selected"].map((label, i) => <span key={label} className={i === 1 ? "is-selected" : ""} data-moment-reveal>{label}{i === 2 ? " ✓" : ""}</span>)}</div>}</div>;
}

export function LandingMoment({ kind }: { kind: MomentKind }) {
  if (kind === "elements") return <WorkspaceMoment />;
  if (kind === "beats") return <div className="landing-beats-app" data-moment-reveal><BeatsPreview /></div>;
  if (kind === "revisions") return <VersionsMoment />;
  if (kind === "together") return <div className="landing-together-app" data-moment-reveal><TogetherPreview /></div>;
  if (kind === "voices") return <div className="landing-cast-app"><VoiceCast /></div>;
  if (kind === "table-read") return <div className="landing-listen-app"><ListenBack /></div>;
  if (kind === "rewrite") return <WriteListenRewrite />;
  if (kind === "sound-film") return <SceneBuilder />;
  if (kind === "immersive") return <ImmersiveStage presentation />;
  if (kind === "storyboard") return <StoryboardMoment />;
  return <FilmMoment cut={kind === "cut"} />;
}
