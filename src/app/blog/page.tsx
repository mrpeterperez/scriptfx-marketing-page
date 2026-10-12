import { BlogIndex } from "@/components/blog";
import { pageMetadata } from "@/lib/site/config";
export const metadata = pageMetadata("Screenwriting journal", "Practical notes on writing scenes, revising dialogue, and preparing a table read.", "/blog");
export default function BlogIndexPage() { return <BlogIndex />; }
