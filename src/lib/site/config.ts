import type { Metadata } from "next";

const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
export const site = {
  name: "ScriptFX",
  url: configuredUrl || "http://127.0.0.1:3000",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://scriptfx-web-production.up.railway.app",
  indexable: Boolean(configuredUrl) && process.env.SITE_INDEXABLE === "true" && process.env.VERCEL_ENV !== "preview",
  description: "Write your screenplay. Hear your characters. Find the moments that work. ScriptFX is a place to bring your story to life.",
};
export const productAreas = [
  { slug: "writing", number: "01", title: "Writing", status: "", headline: "Every great film starts here.", description: "Write the scene. Hear your characters. Rewrite the line that never sounded quite right." },
  { slug: "production", number: "02", title: "Production", status: "", headline: "The next chapter of your story.", description: "The page is only the beginning. We’re building the next place to take your story." },
  { slug: "market", number: "03", title: "Market", status: "", headline: "Give the story a future.", description: "Getting a story out into the world is its own story. We’re still figuring out how ScriptFX can help." },
] as const;
export const navigation = [
  { label: "Products", href: "/products" },
  { label: "Solutions", href: "/solutions" },
  { label: "Resources", href: "/resources" },
  { label: "Enterprise", href: "/enterprise" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact Sales", href: "/contact-sales" },
];
export function pageMetadata(title: string, description: string, path: string, index = true): Metadata {
  return { title, description, alternates: { canonical: path },
    robots: { index: site.indexable && index, follow: true },
    openGraph: { title: `${title} | ScriptFX`, description, url: path, type: "website", siteName: site.name, images: ["/opengraph-image"] },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
  };
}
