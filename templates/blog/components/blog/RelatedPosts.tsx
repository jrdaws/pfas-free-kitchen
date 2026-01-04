import Link from "next/link";

interface RelatedPost {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  featuredImage?: string;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
  currentPostSlug: string;
}

export function RelatedPosts({ posts, currentPostSlug }: RelatedPostsProps) {
  const filteredPosts = posts.filter((post) => post.slug !== currentPostSlug).slice(0, 3);

  if (filteredPosts.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold mb-6 dark:text-white">Related Posts</h3>
      
      <div className="grid gap-4">
        {filteredPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex gap-4 p-3 -mx-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            {/* Thumbnail */}
            <div 
              className="w-20 h-16 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0"
              style={post.featuredImage ? {
                backgroundImage: `url(${post.featuredImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              } : undefined}
            />
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 text-sm">
                {post.title}
              </h4>
              <div className="flex gap-2 mt-1">
                <span className="text-xs text-blue-600 dark:text-blue-400">{post.category}</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400">{post.readTime}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

