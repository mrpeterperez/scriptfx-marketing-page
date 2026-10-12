import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { BlogPost } from "@/components/blog";
import { pageMetadata } from "@/lib/site/config";
export const dynamicParams = false;
export function generateStaticParams() { return getAllPosts().map(post => ({ slug: post.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const post = getPostBySlug(slug); return post ? pageMetadata(post.meta.title, post.meta.description, `/blog/${slug}`) : { title: "Post not found", robots: { index: false } }; }
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) { return <BlogPost slug={(await params).slug} />; }
