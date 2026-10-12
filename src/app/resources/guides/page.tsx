import Link from "next/link";
import { SceneStudy, CatalogCTA } from "@/components/site/catalog-page";
import { pageMetadata } from "@/lib/site/config";
export const metadata = pageMetadata("Writing guides", "Practical ScriptFX guides to building a scene, preparing a table read, and revising dialogue.", "/resources/guides");
const guides = [
  { href: "/blog/from-outline-to-scene", title: "From outline to scene", description: "Turn an idea into a place, a character, and a moment that changes something.", kind: "script" as const },
  { href: "/blog/prepare-a-table-read", title: "Prepare a useful table read", description: "Choose a scene, cast the voices, and decide what you’re listening for.", kind: "audio" as const },
  { href: "/blog/revise-dialogue-by-listening", title: "Revise by listening", description: "Hear the repetition, find the subtext, and give the next draft a clear purpose.", kind: "audio" as const },
];
export default function Page() { return <div className="catalog-page"><header className="catalog-hero"><p className="catalog-kicker">Resources / Guides</p><h1>Make room for<br />the next draft.</h1><p>Practical notes for writing a scene, hearing it clearly, and choosing what to change.</p></header><div className="guide-grid">{guides.map((guide, i) => <Link href={guide.href} key={guide.href}><SceneStudy kind={guide.kind}/><p className="catalog-kicker">Guide 0{i + 1}</p><h2>{guide.title}</h2><p>{guide.description}</p><span className="catalog-text-link">Read the guide</span></Link>)}</div><CatalogCTA /></div>; }
