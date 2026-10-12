import { MediaPlaceholder } from "@/components/site/media-placeholder";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
export function BlogIndex() {
  return <section className="editorial-page"><header className="editorial-heading"><p className="site-eyebrow">ScriptFX Blog</p><h1>A little perspective<br />for the next draft.</h1><p>Practical notes on scenes, dialogue, and hearing your writing in a new way.</p></header><div className="blog-grid">{getAllPosts().map((post, i) => <Link className="blog-card" href={`/blog/${post.slug}`} key={post.slug} data-visual-reveal><MediaPlaceholder label={post.title} variant={(["page", "sound", "frames"] as const)[i % 3]} /><div className="blog-card-copy"><p className="site-eyebrow"><time dateTime={post.date}>{new Date(`${post.date}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</time> · {post.minutes} min read</p><h2>{post.title}</h2><span>Read article</span></div></Link>)}</div></section>;
}
