import { products } from "@/lib/site/catalog";
import { CatalogOverview } from "@/components/site/catalog-page";
import { pageMetadata } from "@/lib/site/config";
export const metadata = pageMetadata("Products", "Explore ScriptFX writing, table reads, character voices, and developing tools for audio drama, storyboards, and video.", "/products");
export default function Page() { return <CatalogOverview eyebrow="The ScriptFX toolkit" title="One story. Every possibility." description="Start on the page. Hear your characters. Explore what comes next—with you in the director’s chair." items={products} base="/products" />; }
