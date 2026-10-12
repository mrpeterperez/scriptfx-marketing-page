import { notFound } from "next/navigation";
import { products } from "@/lib/site/catalog";
import { OfferingPage } from "@/components/site/catalog-page";
import { pageMetadata } from "@/lib/site/config";
export function generateStaticParams() { return products.map(item => ({ slug: item.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = products.find(item => item.slug === slug);
  if (!item) notFound();
  return pageMetadata(item.title, item.intro, `/products/${slug}`);
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = products.find(item => item.slug === slug);
  if (!item) notFound();
  return <OfferingPage item={item} base="/products" related={products} />;
}
