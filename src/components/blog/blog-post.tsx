import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/blog";

export function BlogPost({ slug }: { slug: string }) {
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="prose prose-zinc max-w-none dark:prose-invert">
      <header className="not-prose mb-10 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{post.meta.title}</h1>
        {post.meta.date ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{post.meta.date}</p>
        ) : null}
        {post.meta.description ? (
          <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">
            {post.meta.description}
          </p>
        ) : null}
      </header>

      <MDXRemote
        source={post.content}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        }}
      />
    </article>
  );
}
