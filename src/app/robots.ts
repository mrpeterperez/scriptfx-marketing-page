import type { MetadataRoute } from "next";
export const dynamic = "force-static";
import { site } from "@/lib/site/config";
export default function robots(): MetadataRoute.Robots { return { rules: site.indexable ? { userAgent: "*", allow: "/", disallow: ["/api/"] } : { userAgent: "*", disallow: "/" }, sitemap: `${site.url}/sitemap.xml` }; }
