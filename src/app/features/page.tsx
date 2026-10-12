import Link from "next/link";
import { features } from "@/lib/site/features";
import { pageMetadata } from "@/lib/site/config";
import { MediaPlaceholder } from "@/components/site/media-placeholder";
export const metadata = pageMetadata("Features", "Explore the ScriptFX screenplay editor, table reads, character voices, and scene revisions.", "/features");
export default function FeaturesPage() {
  return <section className="editorial-page"><header className="editorial-heading"><p className="site-eyebrow">Features</p><h1>Your story.<br />Your way.</h1></header><div className="site-grid">{features.map((feature, i) => <Link className="site-card" href={`/features/${feature.slug}`} key={feature.slug}><MediaPlaceholder label={feature.title} variant={i % 2 ? "sound" : "page"} /><h2>{feature.title}</h2><p>{feature.description}</p><span>Explore feature</span></Link>)}</div></section>;
}
