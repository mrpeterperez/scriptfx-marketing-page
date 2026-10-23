"use client";

import { useEffect, useRef, useState } from "react";
import { SpatialBlob } from "./spatial-blob";
import { ImmersiveStage, MoreBento, SceneBuilder, ToolsStory, WriteListenRewrite } from "./feature-showcases";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Bold, Italic, Underline, Strikethrough, ChevronDown, Search, Plus, Users, MessageSquare, LayoutGrid, Check, FileText, MousePointer2, Lock } from "lucide-react";

/** A real-looking screenplay page being written, with the element picker floating over the line in progress. */
function ScreenplayShortcuts() {
  return <div className="basics-script-art" aria-label="A screenplay page in standard format, with Dialogue chosen in the element picker">
    <div className="basics-page">
      <span className="basics-page-number">1.</span>
      <p>FADE IN:</p>
      <p className="basics-slug">INT. DINER – NIGHT</p>
      <p>Rain streaks the glass. MARA (30s), soaked, slides into the booth across from LEO. She doesn’t take off her coat.</p>
      <p className="basics-cue">MARA</p>
      <p className="basics-paren">(quietly)</p>
      <p className="basics-line">I want the car, Leo.<i className="basics-caret" aria-hidden="true" /></p>
      <span className="basics-picker" aria-hidden="true">Dialogue<kbd>⌘5</kbd><ChevronDown size={12}/></span>
    </div>
  </div>;
}

function Skeleton({ rows = 3 }: { rows?: number }) {
  return <div className="platform-skeleton" aria-hidden="true">{Array.from({ length: rows }, (_, i) => <i key={i} />)}</div>;
}

function WritingPartner() {
  return <div className="writing-partner partner-visual"><SpatialBlob/><div className="partner-visual-skeleton" aria-hidden="true"><Skeleton rows={2}/></div></div>;
}

function Workspace({ active: initialActive, toolsOpen, aiOpen }: { active: number; toolsOpen: boolean; aiOpen: boolean }) {
  const [storyMapOpen, setStoryMapOpen] = useState(false);
  const active = toolsOpen && storyMapOpen ? 2 : initialActive;
  return (<div className="platform-window-mat">
      <div className={`platform-shell platform-step-${active}`}>
        <div className="platform-browser" aria-label="ScriptFX app window"><div className="platform-app-titlebar"><div className="platform-traffic" aria-hidden="true"><i/><i/><i/></div><span>ScriptFX</span></div></div>
        <div className="platform-chrome"><div className="platform-identity"><Skeleton rows={1}/><div className="platform-modes"><span className="platform-skeleton-pill"/><span className="selected">Write</span><span className="platform-skeleton-pill"/></div><span className="platform-saved"><i/></span></div><div className="platform-menubar"><Skeleton rows={1}/><Skeleton rows={1}/><Skeleton rows={1}/></div></div>
        <div className="platform-body">
          <aside className="platform-left" aria-hidden={!toolsOpen}>{aiOpen ? <WritingPartner/> : <><div className="platform-panel-title">Navigate <LayoutGrid size={16}/></div><div className="platform-side-inner"><div className="platform-tabs"><span className={active === 2 ? "" : "selected"}>Scenes</span><span className={active === 2 ? "selected" : ""}>Structure</span></div><div className="platform-search"><Search size={16}/><Skeleton rows={1}/></div><strong>Act 1 <ChevronDown size={14}/></strong><div className="platform-scene-selected">01 &nbsp; INT. DINER – DAY</div>{active === 2 && <div className="platform-beats"><span>Opening image</span><span>Theme stated</span><span>Setup</span><span>Catalyst</span><span>Debate</span></div>}<Skeleton rows={5}/><Skeleton rows={3}/></div></>}</aside>
          <div className="platform-main">{toolsOpen && <><div className="platform-version-row"><span>Version #1</span></div><div className="platform-view-tabs" role="group" aria-label="Editor view"><button type="button" aria-pressed={!storyMapOpen} onClick={() => setStoryMapOpen(false)}>Screenplay</button><button type="button" aria-pressed={storyMapOpen} onClick={() => setStoryMapOpen(true)}>Story Map</button></div></>}<div className="platform-toolbar"><div className="platform-format"><Bold size={16}/><Italic size={16}/><Underline size={16}/><Strikethrough size={16}/></div><span className="platform-element">Scene Heading <ChevronDown size={15}/></span></div>
            <div className="platform-canvas">
              <div className={`platform-paper ${active === 2 ? "platform-hidden" : ""}`}>
                {active === 3 && <div className="platform-versions"><span>In script</span><span className="selected">Version 2</span><span>+ New version</span></div>}
                <div className="screenplay-skeleton" role="img" aria-label="Screenplay layout: scene heading, action, indented character cues, parentheticals, and dialogue">
                  <div className="sk-slug"><Skeleton rows={1}/></div><div className="sk-action"><Skeleton rows={2}/></div>
                  <div className="sk-character"><Skeleton rows={1}/></div><div className="sk-parenthetical"><Skeleton rows={1}/></div><div className="sk-dialogue"><Skeleton rows={3}/></div>
                  <div className="sk-character"><Skeleton rows={1}/></div><div className={`sk-dialogue ${active === 5 ? "sk-annotated" : ""}`}><Skeleton rows={2}/></div>
                  <div className="sk-action"><Skeleton rows={2}/></div><div className="sk-character"><Skeleton rows={1}/></div><div className="sk-dialogue"><Skeleton rows={3}/></div>
                  {active === 5 && <div className="platform-collab-overlay" aria-label="Illustrative team cursors and screenplay comments"><div className="team-cursor team-kim"><MousePointer2 size={24}/><span>Kim</span></div><div className="team-cursor team-alex"><MousePointer2 size={24}/><span>Alex</span></div><div className="team-page-note"><span className="team-note-dot"/><strong>Kim</strong><Skeleton rows={2}/></div></div>}
                </div>
                {active === 3 && <div className="platform-use">Original kept.<span>Use in screenplay</span></div>}
              </div>
              {(active === 2) && <div className="platform-story-map"><span className="platform-act-label">ACT I · SETUP</span><div className="platform-map-card"><span>01 / DAY</span><strong>INT. DINER</strong><Skeleton rows={3}/><span className="platform-card-footer"><Skeleton rows={1}/></span></div><div className="platform-map-connector"/><div className="platform-empty-scene"><Plus size={22}/><span>Scene</span></div><div className="platform-map-tools">Select <span>Hand</span><span>Scenes</span><span>Note</span><MessageSquare size={17}/></div></div>}
              {active === 1 && <div className="platform-import"><FileText size={30}/><h3>Import screenplay</h3><p>Baker’s Dozen.fdx</p><div><Check size={18}/> Final Draft screenplay</div><Skeleton rows={2}/><strong>Replace with this screenplay</strong></div>}
            </div><div className="platform-page-status"><Skeleton rows={1}/><span>100% <ChevronDown size={12}/></span></div>
          </div>
          <aside className="platform-right" aria-hidden={!toolsOpen}><div className="platform-panel-title">Tools <span>•••</span></div><div className="platform-side-inner">{active === 5 ? <><h3><MessageSquare size={20}/> Comments</h3><div className="platform-note"><strong><span className="platform-skeleton-avatar"/><Skeleton rows={1}/></strong><Skeleton rows={3}/><Skeleton rows={2}/></div><Skeleton rows={4}/></> : active === 4 ? <><h3><Users size={20}/> Audience</h3><div className="platform-tabs"><span className="selected">This scene</span><span className="platform-skeleton-pill"/></div><div className="platform-viewers">{[0,1,2].map(i => <span key={i}><span className="platform-skeleton-avatar"/><Skeleton rows={1}/></span>)}</div><div className="platform-audience-card"><Users size={24}/><Skeleton rows={2}/><Skeleton rows={3}/></div><div className="platform-analyze"><p>Illustrative AI feedback.</p><span>Analyze scene</span></div></> : <><div className="platform-skeleton-heading"><span className="platform-skeleton-avatar"/><Skeleton rows={1}/></div><div className="platform-skeleton-box"><Skeleton rows={4}/></div><Skeleton rows={5}/><div className="platform-skeleton-box"><Skeleton rows={3}/></div></>}</div></aside>
        </div>
      </div>
      </div>);
}

export function WritingFeatures() {
  const [mode, setMode] = useState<"classic" | "tools" | "ai">("classic");
  const [cycle, setCycle] = useState(0);
  const [paused, setPaused] = useState(false);
  const progressRef = useRef<HTMLSpanElement>(null);
  const toolsOpen = mode !== "classic";
  const previewRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const scope = sectionRef.current;
      if (!scope) return;
      const reveal = (elements: Element[], trigger: Element, stagger = 0.09) => {
        gsap.from(elements, {
          y: 22, opacity: 0, duration: 0.7, stagger, ease: "power2.out",
          scrollTrigger: { trigger, start: "top 88%", once: true },
          clearProps: "transform,opacity",
        });
      };
      const header = scope.querySelector(".writing-basics > header");
      if (header) reveal(Array.from(header.children), header);
      const cards = Array.from(scope.querySelectorAll(".basics-layout article"));
      cards.forEach((card, index) => {
        gsap.from(card, {
          y: 24, opacity: 0, duration: 0.7,
          delay: window.innerWidth > 1000 ? index * 0.09 : 0,
          ease: "power2.out", clearProps: "transform,opacity",
          scrollTrigger: { trigger: card, start: "top 90%", once: true },
        });
      });
    }, sectionRef);
    return () => media.revert();
  }, []);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false, frame = 0, elapsed = 0, previous = 0;
    const tick = (now: number) => {
      if (previous && visible && !document.hidden && !paused && !reduced.matches) elapsed += Math.min(now - previous, 100);
      previous = now;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${elapsed / 8000})`;
      if (elapsed >= 8000) { setMode(current => current === "classic" ? "tools" : current === "tools" ? "ai" : "classic"); return; }
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: .25 });
    observer.observe(preview);
    frame = requestAnimationFrame(tick);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [mode, cycle, paused]);

  return <section ref={sectionRef} className="writing-simple" aria-label="Screenwriting software features">
    <div className={`writing-mode-layout mode-${mode}`}>
      <div className="writing-mode-options" role="group" aria-label="Workspace preview">
        {([
          ["classic", "Classic", "Just you and the page."],
          ["tools", "With tools", "Structure, versions, and feedback."],
          ["ai", "With AI", "You direct. It helps."],
        ] as const).map(([value, title, description]) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => { setMode(value); setCycle(n => n + 1); }}><span className="writing-mode-progress" aria-hidden="true">{mode === value && <span ref={progressRef}/>}</span><strong>{title}</strong><span>{description}</span></button>)}
      </div>
      <div ref={previewRef} className={`writing-simple-demo platform-pinned ${toolsOpen ? "writing-tools-open" : ""} ${mode === "ai" ? "writing-ai-open" : ""}`}><Workspace active={0} toolsOpen={toolsOpen} aiOpen={mode === "ai"}/></div>
        <button className="writing-cycle-control" type="button" onClick={() => setPaused(value => !value)}>{paused ? "Resume preview" : "Pause preview"}</button>

    </div>

    <section className="writing-basics"><header><h2>Everything you expect.</h2><p>None of what you hate.</p></header>
      <div className="basics-layout">
        <article className="basics-script"><ScreenplayShortcuts /><h3>Familiar formatting</h3><p>The same shortcuts as Final Draft. Tab and Enter move you to the next element, and it fills in names and sluglines as you type.</p></article>
        <div className="basics-list">{[
          { art: <span className="grid justify-items-start gap-1"><strong className="text-4xl font-semibold tracking-tight">$0</strong><span className="text-xs text-[#9a9a9a] line-through">Upgrade · $99.99</span></span>, title: "No $99 upgrades", text: "Writing is free forever. Unlimited screenplays." },
          { art: <span className="grid w-full gap-2"><span className="flex gap-1.5 text-xs"><span className="rounded-md px-2 py-1 text-[#9a9a9a]">Draft 2</span><span className="flex items-center gap-1 rounded-md bg-[#f0f0f0] px-2 py-1"><Check size={12}/>Draft 3 · saved</span></span><i className="h-1.5 w-11/12 rounded-full bg-[#ececec]"/><i className="h-1.5 w-3/4 rounded-full bg-[#ececec]"/></span>, title: "Never lose a word", text: "Saves as you type. Every draft kept." },
          { art: <span className="flex flex-wrap justify-center gap-1.5 text-xs">{["Mac", "Windows", "Chromebook"].map(device => <span key={device} className="rounded-full bg-[#f0f0f0] px-2.5 py-1">{device}</span>)}</span>, title: "No license keys", text: "Any browser. No two-computer limit." },
          { art: <span className="flex gap-2">{[".fdx", ".fountain", ".pdf"].map((file, i) => <span key={file} className="grid w-[64px] justify-items-center gap-2 rounded-lg border border-[#e6e6e6] bg-white py-3 text-[11px] shadow-sm" style={{ transform: `rotate(${(i - 1) * 6}deg)` }}><FileText size={18}/>{file}</span>)}</span>, title: "No lock-in", text: "Final Draft, Fountain, and PDF, in and out, with revision colors and notes." },
        ].map(item => <article key={item.title}><div className="basics-tile-art" aria-hidden="true">{item.art}</div><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      </div>
      <p className="basics-promise"><Lock size={16}/>We never train AI on your script.</p>
    </section>
    <WriteListenRewrite />
    <SceneBuilder />
    <ImmersiveStage />
    <ToolsStory />
    <MoreBento />
    <p className="writing-trademark">Illustrative product previews. Save the Cat!® is a trademark of its respective owner. ScriptFX is not affiliated with Save the Cat!.</p>
  </section>;
}
