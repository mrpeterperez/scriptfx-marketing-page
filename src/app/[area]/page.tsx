import { MediaPlaceholder } from "@/components/site/media-placeholder";
import { notFound } from "next/navigation";
import Link from "next/link";
import { productAreas, pageMetadata } from "@/lib/site/config";
import { features } from "@/lib/site/features";
import { PageShell, SiteCTA } from "@/components/site/page-shell";
export const dynamicParams = false;
export function generateStaticParams() { return productAreas.map(area => ({ area: area.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ area: string }> }) {
  const { area: slug } = await params;
  const area = productAreas.find(item => item.slug === slug);
  return area ? pageMetadata(area.title, area.description, `/${area.slug}`, area.slug === "writing") : {};
}
export default async function AreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area: slug } = await params;
  const area = productAreas.find(item => item.slug === slug);
  if (!area) notFound();
  return <PageShell eyebrow={`${area.title} / ${area.status}`} title={area.headline} description={slug === "writing" ? "Write the scene. Hear the dialogue. Find the next draft." : "Take your story beyond the page."} mediaLabel={`${area.title} / Vision preview`} mediaVariant={slug === "writing" ? "page" : "frames"}>
    {slug === "writing" ? <div className="site-grid">{features.map(feature => <Link className="site-card" key={feature.slug} href={`/features/${feature.slug}`}><MediaPlaceholder label={feature.title} variant={feature.slug === "table-read" || feature.slug === "character-voices" ? "sound" : "page"} /><p className="site-eyebrow">{feature.status}</p><h2>{feature.title}</h2><p>{feature.description}</p><span>Explore</span></Link>)}</div> : <section className="site-copy"><h2>Part of the bigger picture.</h2><p>Explore where {area.title.toLowerCase()} fits into your creative workflow.</p><p>Help shape what comes next.</p><Link href="/contact">Share your workflow</Link></section>}
    <nav className="chapter-nav" aria-label="Product chapters">{productAreas.map(item => <Link aria-current={item.slug === slug ? "page" : undefined} href={`/${item.slug}`} key={item.slug}>{item.number} / {item.title}</Link>)}</nav><SiteCTA />
  </PageShell>;
}
