import { VisualStory } from "@/components/site/visual-story";
import { notFound } from "next/navigation";
import Link from "next/link";
import { features } from "@/lib/site/features";
import { pageMetadata, site } from "@/lib/site/config";
import { PageShell, SiteCTA } from "@/components/site/page-shell";
export const dynamicParams = false;
export function generateStaticParams() { return features.map(feature => ({ slug: feature.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const feature = features.find(item => item.slug === slug);
  return feature ? pageMetadata(feature.title, feature.description, `/features/${slug}`) : {};
}
export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const feature = features.find(item => item.slug === slug);
  if (!feature) notFound();
  const breadcrumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Writing", item: `${site.url}/writing` }, { "@type": "ListItem", position: 2, name: feature.title, item: `${site.url}/features/${slug}` }] };
  return <PageShell eyebrow={`Writing / ${feature.status}`} title={feature.title} description={feature.description} mediaLabel={`${feature.title} / Product overview`} mediaVariant={slug === "screenplay-editor" || slug === "revisions" ? "page" : "sound"}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }} /><VisualStory items={feature.sections.map(([heading, text],index) => ({ title: heading, description: text, media: `${feature.title} / ${heading}`, variant: index === 0 ? "page" : index === 1 ? "frames" : "sound" }))} /><Link href="/writing">← Explore Writing</Link><SiteCTA /></PageShell>;
}
