import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
export type BlogPostMeta = { slug: string; title: string; date: string; updated?: string; description: string; author: string; topic: string; minutes: number };
const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function headingId(text: string) { return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-"); }
export function getPostBySlug(slug: string): { meta: BlogPostMeta; content: string; toc: { title: string; id: string }[] } | null {
  if (!SLUG_RE.test(slug)) return null;
  const file = ["md", "mdx"].map(ext => path.join(BLOG_DIR, `${slug}.${ext}`)).find(file => fs.existsSync(file));
  if (!file) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  if (data.draft === true) return null;
  for (const field of ["title", "date", "description", "author", "topic"]) if (typeof data[field] !== "string" || !data[field].trim()) throw new Error(`Invalid ${field} in ${slug}`);
  const date = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
  if (!date(data.date) || (data.updated && (!date(data.updated) || data.updated < data.date))) throw new Error(`Invalid publication dates in ${slug}`);
  if (Date.parse(data.date) > Date.now()) return null;
  const toc = [...content.replace(/```[\s\S]*?```/g, "").matchAll(/^## (.+)$/gm)].map(match => ({ title: match[1], id: headingId(match[1]) }));
  if (new Set(toc.map(item => item.id)).size !== toc.length) throw new Error(`Duplicate headings in ${slug}`);
  return { meta: { slug, title: data.title, date: data.date, updated: data.updated, description: data.description, author: data.author, topic: data.topic, minutes: Math.max(1, Math.ceil(content.split(/\s+/).length / 220)) }, content, toc };
}
export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR).filter(file => /\.mdx?$/.test(file)).flatMap(file => { const post = getPostBySlug(file.replace(/\.mdx?$/, "")); return post ? [post.meta] : []; }).sort((a,b) => b.date.localeCompare(a.date));
}
