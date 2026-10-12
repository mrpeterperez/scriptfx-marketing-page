import { notFound } from "next/navigation";
import { solutions } from "@/lib/site/catalog";
import { OfferingPage } from "@/components/site/catalog-page";
import { pageMetadata } from "@/lib/site/config";
export function generateStaticParams() { return solutions.map(item => ({ slug: item.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = solutions.find(item => item.slug === slug);
  if (!item) notFound();
  return pageMetadata(item.title, item.intro, `/solutions/${slug}`);
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = solutions.find(item => item.slug === slug);
  if (!item) notFound();
  return <OfferingPage item={item} base="/solutions" related={solutions} />;
}
