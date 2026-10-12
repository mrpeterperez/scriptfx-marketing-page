"use client";

import { useEffect, useRef, useState } from "react";
import { SpatialBlob } from "./spatial-blob";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Bold, Italic, Underline, Strikethrough, ChevronDown, Search, Plus, Users, MessageSquare, LayoutGrid, Check, FileText, MousePointer2 } from "lucide-react";

const features = [
  { label: "Write", title: "Write like you always have.", text: "Familiar. Focused. Out of your way." },
  { label: "Import", title: "Bring your script.", text: "Final Draft. Fountain. Copy and paste." },
  { label: "Structure", title: "See the whole story.", text: "Arrange scenes. Follow Save the Cat!® or your own beats." },
  { label: "Versions", title: "Try another version.", text: "Keep the original. Use the take you like." },
  { label: "Audience", title: "Test the read.", text: "Simulated AI reactions to your scene." },
  { label: "Collaborate", title: "Collaborate with your team.", text: "Annotate. Comment. Keep writing." },
];

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

function FeatureArt({ kind }: { kind: string }) {
  return <div className={`writing-feature-art art-${kind}`} aria-hidden="true">
    {kind === "format" && <div className="feature-mini-paper"><Skeleton rows={2}/><div className="sk-character"><Skeleton rows={1}/></div><div className="sk-dialogue"><Skeleton rows={3}/></div><div className="feature-shortcut"><kbd>Tab</kbd><span>Dialogue</span></div></div>}
    {kind === "import" && <div className="feature-file-stack"><div><FileText size={24}/><strong>.fdx</strong></div><div><FileText size={24}/><strong>.fountain</strong></div></div>}
    {kind === "versions" && <div className="feature-mini-paper"><div className="feature-version-tabs"><span>Original</span><span>Version 2</span></div><Skeleton rows={4}/></div>}
    {kind === "comments" && <div className="feature-mini-paper"><Skeleton rows={4}/><div className="feature-small-note"><span className="team-note-dot"/><Skeleton rows={2}/></div></div>}
    {kind === "structure" && <div className="feature-map"><span>ACT I</span><div className="feature-map-cards">{["Opening image", "Setup", "Catalyst"].map(label => <div key={label}><strong>{label}</strong><Skeleton rows={3}/></div>)}</div><div className="feature-map-footer"><span>Screenplay</span><strong>Story Map</strong></div></div>}
    {kind === "audience" && <div className="feature-audience"><div className="feature-art-heading"><Users size={22}/><strong>Audience</strong></div>{["Genre fan", "Casual viewer", "Character fan"].map(label => <div className="feature-reader" key={label}><span className="platform-skeleton-avatar"/><div><strong>{label}</strong><Skeleton rows={2}/></div></div>)}</div>}
    {kind === "collaborate" && <div className="feature-mini-paper"><Skeleton rows={2}/><div className="sk-character"><Skeleton rows={1}/></div><div className="sk-dialogue sk-annotated"><Skeleton rows={3}/></div><div className="team-cursor team-kim"><MousePointer2 size={24}/><span>Kim</span></div><div className="team-cursor team-alex"><MousePointer2 size={24}/><span>Alex</span></div><div className="feature-small-note"><span className="team-note-dot"/><Skeleton rows={2}/></div></div>}
  </div>;
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
      const cards = Array.from(scope.querySelectorAll(".writing-basics-grid > article"));
      cards.forEach((card, index) => {
        gsap.from(card, {
          y: 24, opacity: 0, duration: 0.7,
          delay: window.innerWidth > 1000 ? index * 0.09 : 0,
          ease: "power2.out", clearProps: "transform,opacity",
          scrollTrigger: { trigger: card, start: "top 90%", once: true },
        });
      });
      scope.querySelectorAll(".writing-simple-rows > article").forEach(row => {
        const copy = row.firstElementChild;
        const art = row.lastElementChild;
        if (copy) reveal(Array.from(copy.children), copy);
        if (art) {
          reveal([art], art);
          const details = art.querySelectorAll(".feature-map-cards > div, .feature-reader, .team-cursor, .feature-small-note");
          gsap.from(details, {
            y: 10, opacity: 0, duration: 0.5, stagger: 0.1, delay: 0.18,
            ease: "power2.out", clearProps: "transform,opacity",
            scrollTrigger: { trigger: art, start: "top 80%", once: true },
          });
        }
      });
      const collaboration = scope.querySelector(".art-collaborate");
      if (collaboration) {
        const kim = collaboration.querySelector(".team-kim");
        const alex = collaboration.querySelector(".team-alex");
        const cursors = gsap.timeline({
          repeat: -1, repeatDelay: 0.8, defaults: { ease: "power2.inOut" },
          scrollTrigger: { trigger: collaboration, start: "top 80%", end: "bottom top", toggleActions: "play pause resume pause" },
        });
        cursors.to(kim, { left: "34%", top: "32%", duration: 1.6 }, 0.7)
          .to(alex, { left: "42%", top: "52%", duration: 1.9 }, 1.3)
          .to(kim, { left: "50%", top: "44%", duration: 1.4 }, 3.4)
          .to(alex, { left: "20%", top: "38%", duration: 1.6 }, 4.2)
          .to(kim, { left: "62%", top: "25%", duration: 1.8 }, 6.2)
          .to(alex, { left: "13%", top: "56%", duration: 1.7 }, 6.9);
      }
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
          ["ai", "With AI", "Talk through ideas. Give it direction."],
        ] as const).map(([value, title, description]) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => { setMode(value); setCycle(n => n + 1); }}><span className="writing-mode-progress" aria-hidden="true">{mode === value && <span ref={progressRef}/>}</span><strong>{title}</strong><span>{description}</span></button>)}
      </div>
      <div ref={previewRef} className={`writing-simple-demo platform-pinned ${toolsOpen ? "writing-tools-open" : ""} ${mode === "ai" ? "writing-ai-open" : ""}`}><Workspace active={0} toolsOpen={toolsOpen} aiOpen={mode === "ai"}/></div>
        <button className="writing-cycle-control" type="button" onClick={() => setPaused(value => !value)}>{paused ? "Resume preview" : "Pause preview"}</button>

    </div>

    <section className="writing-basics"><header><h2>Everything you need to keep writing.</h2><p>Your script. Your shortcuts. A few useful extras.</p></header><div className="writing-basics-grid">{[
      { kind: "format", title: "Familiar formatting", text: "Tab. Enter. Action. Dialogue. You know this." },
      { kind: "import", title: "Bring your script", text: "Import Final Draft or Fountain. Copy and paste, too." },
      { kind: "versions", title: "Keep every version", text: "Try another take. Keep the original." },
      { kind: "comments", title: "Keep notes together", text: "Feedback stays with the scene." },
    ].map(item => <article key={item.kind}><FeatureArt kind={item.kind}/><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>
    <div className="writing-simple-rows">{[
      { kind: "structure", title: "See the whole story.", text: "Move scenes. Find the beats. Use Save the Cat!®, three-act structure, or your own method." },
      { kind: "ai", title: "Talk it through.", text: "Talk through a scene. Explore a beat. Try another direction. You decide what stays." },
      { kind: "audience", title: "Test the read.", text: "Get simulated AI perspectives on pacing, clarity, and character." },
      { kind: "collaborate", title: "Collaborate with your team.", text: "Annotate the screenplay. Leave a comment. Keep everyone on the same page." },
    ].map(item => <article key={item.kind}><div><h2>{item.title}</h2><p>{item.text}</p></div>{item.kind === "ai" ? <div className="writing-feature-art art-ai"><WritingPartner/></div> : <FeatureArt kind={item.kind}/>}</article>)}</div>
    <p className="writing-trademark">Illustrative product previews. Save the Cat!® is a trademark of its respective owner. ScriptFX is not affiliated with Save the Cat!.</p>
  </section>;
}
