import { solutions } from "@/lib/site/catalog";
import { CatalogOverview } from "@/components/site/catalog-page";
import { pageMetadata } from "@/lib/site/config";
export const metadata = pageMetadata("Solutions", "Explore ScriptFX workflows for screenwriters, filmmakers, audio storytellers, and creative teams.", "/solutions");
export default function Page() { return <CatalogOverview eyebrow="Made for your process" title="Different paths. Great stories." description="A first draft. A short film. A story told entirely through sound. Find a starting point that fits the way you create." items={solutions} base="/solutions" />; }
