import type { MetadataRoute } from "next";
import { site } from "@/lib/site/config";
export default function robots(): MetadataRoute.Robots { return { rules: site.indexable ? { userAgent: "*", allow: "/", disallow: ["/api/"] } : { userAgent: "*", disallow: "/" }, sitemap: `${site.url}/sitemap.xml` }; }
