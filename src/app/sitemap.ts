import type { MetadataRoute } from "next";
import { site } from "@/lib/site/config";
import { publicRoutes } from "@/lib/site/routes";
import { getAllPosts } from "@/lib/blog";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!site.indexable) return [];
  return [...publicRoutes.map(path => ({ url: new URL(path, site.url).toString() })), ...getAllPosts().map(post => ({ url: `${site.url}/blog/${post.slug}`, lastModified: post.updated || post.date }))];
}
