import { Bold, Italic, Underline, ChevronDown, FileText, Check, Plus, MessageSquare, MousePointer2, Hand, ArrowUpRight, StickyNote, Layers } from "lucide-react";
import { bakersCues } from "@/components/home/bakers-screenplay";

function Paper({ short = false }: { short?: boolean }) {
  const lines = short ? bakersCues[0].lines.slice(0, 1).concat(bakersCues[3].lines, bakersCues[4].lines) : bakersCues[0].lines.slice(0, 2).concat(bakersCues[3].lines, bakersCues[4].lines, bakersCues[5].lines);
  return <div className="demo-paper">{lines.map(([kind, text], i) => <p key={i} className={`demo-line demo-line-${kind}`}>{text}</p>)}</div>;
}

function Toolbar() {
  return <div className="demo-toolbar"><strong>Script</strong><div><Bold size={15}/><Italic size={15}/><Underline size={15}/></div><span>Dialogue <ChevronDown size={14}/></span></div>;
}

function SceneCard({ selected = false }: { selected?: boolean }) {
  return <div className={`demo-scene-card ${selected ? "demo-selected" : ""}`}><span>01 <span>DAY</span></span><strong>INT. DINER</strong><p>John and Steve. Eggs, bacon, and an awkward conversation.</p><div className="demo-card-lines"><i/><i/></div></div>;
}

function Map({ comments = false }: { comments?: boolean }) {
  return <div className="demo-map"><div className="demo-map-heading"><span>Story map</span><Layers size={16}/></div><div className="demo-map-section">{comments ? "Scene notes" : "ACT I · SETUP"}</div><div className="demo-map-cards"><SceneCard selected/>{!comments && <div className="demo-next-card"><Plus size={18}/><span>Scene</span></div>}</div>{comments ? <div className="demo-comment demo-reveal"><div><span className="demo-avatar">K</span><strong>Kim</strong><span>Comment</span></div><p>Keep the pause after “What?”</p><div className="demo-comment-reply">Reply…</div></div> : <div className="demo-selection demo-reveal"><span>Open scene</span><span>New variation</span></div>}<div className="demo-map-tools"><MousePointer2 size={17}/><Hand size={17}/><ArrowUpRight size={17}/><span>Scenes</span><StickyNote size={17}/><MessageSquare size={17}/></div></div>;
}

export function WritingPreview({ index }: { index: number }) {
  return <div className="writing-preview demo-shell" role="img" aria-label={`Simplified ScriptFX ${["screenplay editor", "import preview", "story map", "scene versions", "AI audience feedback", "scene comments"][index]} demonstration`}>
    <div className="demo-workspace"><strong>ScriptFX</strong><span>Baker’s Dozen</span><span className="demo-example">Preview</span></div>
    {index === 0 && <><Toolbar/><div className="demo-editor"><Paper/><div className="demo-key-hint demo-reveal"><kbd>Tab</kbd><span>Character → Dialogue</span><Check size={16}/></div></div></>}
    {index === 1 && <div className="demo-import"><div className="demo-file"><FileText size={28}/><div><strong>Baker’s Dozen.fdx</strong><span>Final Draft screenplay</span></div><Check size={18}/></div><div className="demo-import-page"><Paper short/></div><div className="demo-import-bottom demo-reveal"><span>Your current draft stays in Draft history.</span><span className="demo-dark-control">Replace with this screenplay</span></div></div>}
    {index === 2 && <Map/>}
    {index === 3 && <><div className="demo-version-tabs"><span>In script</span><span className="demo-active-tab">Version 2</span><span><Plus size={14}/> New version</span></div><div className="demo-editor"><Paper short/><div className="demo-version-footer demo-reveal"><span>Original kept.</span><span className="demo-dark-control">Use in screenplay</span></div></div></>}
    {index === 4 && <div className="demo-audience"><div className="demo-audience-heading"><strong>Audience</strong><span>Scene 01</span></div><p>Three perspectives on the same scene.</p>{[ ["Genre fan", "The deadpan exchange builds tension."], ["Casual viewer", "I want to know why they’re here."], ["Character-focused", "John’s answer tells me who he is."] ].map(([name, note], i) => <div key={name} className="demo-reader demo-reveal"><span className="demo-avatar">{i + 1}</span><div><strong>{name}</strong><p>{note}</p></div></div>)}<span className="demo-audience-note">Illustrative AI feedback · not a real audience poll.</span></div>}
    {index === 5 && <Map comments/>}
    <div className="demo-status"><span>{["Screenplay", "Import preview", "Story map", "Scene versions", "Audience simulation", "Comments"][index]}</span><span>{String(index + 1).padStart(2, "0")} / 06</span></div>
  </div>;
}
