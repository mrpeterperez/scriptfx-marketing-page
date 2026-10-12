import { PageShell, SiteCTA } from "@/components/site/page-shell";
import { pageMetadata } from "@/lib/site/config";
export const metadata = pageMetadata("Screenplay scene template", "Download an original plain-text Fountain scene template and start developing a short screenplay scene.", "/templates");
export default function TemplatesPage() { return <PageShell eyebrow="A place to start" title="The next scene is yours." description="An original, editable scene starter in Fountain plain text. Replace the example with your characters, conflict, and next turn."><div className="site-copy"><pre className="rounded-xl border border-white/15 p-6 whitespace-pre-wrap text-sm" style={{ fontFamily: "Courier New, monospace" }}>{`INT. TRAIN STATION - NIGHT

An empty platform. MARA turns a key over in her palm.

ELI
You said the door would be open.

MARA
It was.`}</pre><a className="site-button justify-self-start" href="/templates/scriptfx-scene.fountain" download>Download scene template ↓</a><h2>Make it your own.</h2><p>Open the file in a text editor or a Fountain-compatible writing tool. Change the title and author, then build a scene around what your character wants, what stands in the way, and what changes by the end.</p><p>This is a plain-text starter, not a typeset production screenplay. Formatting and page layout depend on the software used to render it.</p></div><SiteCTA /></PageShell>; }
