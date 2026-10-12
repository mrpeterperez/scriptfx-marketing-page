import { MediaPlaceholder } from "@/components/site/media-placeholder";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Children, isValidElement, type ReactNode } from "react";
import { getAllPosts, getPostBySlug, headingId } from "@/lib/blog";
import { site } from "@/lib/site/config";
import { SiteCTA } from "@/components/site/page-shell";
function plainText(node: ReactNode): string { return Children.toArray(node).map(child => isValidElement<{ children?: ReactNode }>(child) ? plainText(child.props.children) : String(child)).join(""); }
export function BlogPost({ slug }: { slug: string }) {
  const post = getPostBySlug(slug); if (!post) notFound();
  const related = getAllPosts().filter(item => item.slug !== slug).sort((a,b) => Number(b.topic === post.meta.topic) - Number(a.topic === post.meta.topic)).slice(0,3);
  const structured = { "@context": "https://schema.org", "@type": "Article", headline: post.meta.title, description: post.meta.description, datePublished: post.meta.date, dateModified: post.meta.updated || post.meta.date, author: { "@type": "Organization", name: post.meta.author, url: `${site.url}/about` }, publisher: { "@type": "Organization", name: "ScriptFX" }, mainEntityOfPage: `${site.url}/blog/${slug}`, image: `${site.url}/opengraph-image` };
  return <article className="site-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g,"\\u003c") }} /><header className="site-page-header"><Link href="/blog" className="site-eyebrow">← Journal / {post.meta.topic}</Link><h1 className="mt-6">{post.meta.title}</h1><p className="site-description">{post.meta.description}</p><p className="mt-6 text-sm text-black/50">{post.meta.author} · <time dateTime={post.meta.date}>{post.meta.date}</time> · {post.meta.minutes} min read{post.meta.updated ? ` · Updated ${post.meta.updated}` : ""}</p></header><MediaPlaceholder label={post.meta.title} wide /><nav className="article-toc" aria-label="In this article"><p>In this article</p>{post.toc.map(item => <a href={`#${item.id}`} key={item.id}>{item.title}</a>)}</nav><div className="article-body"><MDXRemote source={post.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} components={{ h2: ({ children }) => <h2 id={headingId(plainText(children))} className="scroll-mt-28">{children}</h2> }} /></div><SiteCTA />{related.length > 0 && <section className="mt-16"><h2 className="text-2xl mb-6">Keep exploring.</h2><div className="site-grid">{related.map(item => <Link className="site-card" href={`/blog/${item.slug}`} key={item.slug}><h3 className="text-xl">{item.title}</h3><p className="mt-3">{item.description}</p></Link>)}</div></section>}</article>;
}
