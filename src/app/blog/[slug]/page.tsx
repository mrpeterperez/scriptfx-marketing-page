import type { Metadata } from "next";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { BlogPost } from "@/components/blog";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Post not found" };

  return {
    title: post.meta.title,
    description: post.meta.description,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return <BlogPost slug={params.slug} />;
}
