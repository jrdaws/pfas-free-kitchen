"use client";

import { cn } from "@/lib/utils";

interface Post {
  title: string;
  excerpt?: string;
  author?: string;
  date?: string;
  category?: string;
}

interface BlogPostListProps {
  posts: Post[];
  columns?: number;
  showExcerpt?: boolean;
  title?: string;
}

export function BlogPostList({
  posts = [],
  columns = 3,
  showExcerpt = true,
  title,
}: BlogPostListProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="w-full px-6 py-16 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto">
        {title && (
          <h2 className="text-3xl font-bold text-white mb-10 text-center">
            {title}
          </h2>
        )}
        <div
          className={cn(
            "grid gap-6",
            columns === 2 && "grid-cols-1 md:grid-cols-2",
            columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          )}
        >
          {posts.map((post, i) => (
            <article
              key={i}
              className="group bg-[#111111] rounded-xl overflow-hidden border border-white/5 hover:border-orange-500/30 transition-all"
            >
              {/* Image Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <div className="p-5">
                {/* Category */}
                {post.category && (
                  <span className="text-orange-400 text-xs font-medium uppercase tracking-wider">
                    {post.category}
                  </span>
                )}

                {/* Title */}
                <h3 className="text-white font-semibold mt-2 mb-2 group-hover:text-orange-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {/* Excerpt */}
                {showExcerpt && post.excerpt && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {post.author && <span>{post.author}</span>}
                  {post.author && post.date && <span>•</span>}
                  {post.date && <span>{post.date}</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

