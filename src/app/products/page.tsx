import { productPillars } from "@/lib/site/catalog";
import { CatalogOverview } from "@/components/site/catalog-page";
import { pageMetadata } from "@/lib/site/config";
export const metadata = pageMetadata("Products", "Explore ScriptFX writing, table reads, character voices, and developing tools for audio drama, storyboards, and video.", "/products");
export default function Page() { return <CatalogOverview eyebrow="The ScriptFX toolkit" title="Write it. Hear it. Shoot it." description="Start on the page. Hear your characters. Then see the scene, with you in the director’s chair." items={productPillars.flatMap(pillar => [pillar.lead, ...pillar.more])} base="/products" />; }
