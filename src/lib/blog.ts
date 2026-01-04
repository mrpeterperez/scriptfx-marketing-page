import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type BlogPostMeta = {
  slug: string;
  title: string;
  date: string;
  description?: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function getPostFilePath(slug: string) {
  const mdx = path.join(BLOG_DIR, `${slug}.mdx`);
  if (fs.existsSync(mdx)) return mdx;

  const md = path.join(BLOG_DIR, `${slug}.md`);
  if (fs.existsSync(md)) return md;

  return null;
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));

  const posts = files
    .map((file) => {
      const slug = file.replace(/\.(md|mdx)$/, "");
      if (!SLUG_RE.test(slug)) return null;

      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
      const { data } = matter(raw);

      const title = typeof data.title === "string" ? data.title : slug;
      const date = typeof data.date === "string" ? data.date : "";
      const description =
        typeof data.description === "string" ? data.description : undefined;

      const post: BlogPostMeta = {
        slug,
        title,
        date,
        ...(description ? { description } : {}),
      };

      return post;
    })
    .filter((post): post is BlogPostMeta => post !== null)
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
    });

  return posts;
}

export function getPostBySlug(slug: string): {
  meta: BlogPostMeta;
  content: string;
} | null {
  if (!SLUG_RE.test(slug)) return null;

  const filePath = getPostFilePath(slug);
  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const title = typeof data.title === "string" ? data.title : slug;
  const date = typeof data.date === "string" ? data.date : "";
  const description =
    typeof data.description === "string" ? data.description : undefined;

  return {
    meta: { slug, title, date, description },
    content,
  };
}
