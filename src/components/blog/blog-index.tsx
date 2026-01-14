import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">
          Write posts as Markdown files in <span className="font-medium">content/blog</span>.
          You can use <span className="font-medium">.md</span> (Markdown-only) now, and
          switch to <span className="font-medium">.mdx</span> later if you ever want to embed
          components.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-black/10 p-6 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-300">
          No posts yet. Add a <span className="font-medium">.md</span> file in
          <span className="font-medium"> content/blog</span>.
        </div>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li
              key={post.slug}
              className="rounded-2xl border border-black/10 p-6 dark:border-white/10"
            >
              <div className="flex flex-col gap-1">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-lg font-semibold tracking-tight hover:underline"
                >
                  {post.title}
                </Link>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  {post.date || ""}
                </div>
                {post.description ? (
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {post.description}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
