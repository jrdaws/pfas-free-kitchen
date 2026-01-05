import Link from "next/link";

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  featuredImage?: string;
}

export function BlogCard({
  slug,
  title,
  excerpt,
  author,
  date,
  readTime,
  category,
  featuredImage,
}: BlogCardProps) {
  return (
    <Link href={`/blog/${slug}`} className="block group">
      <article className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        {/* Featured Image */}
        <div 
          className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600"
          style={featuredImage ? { 
            backgroundImage: `url(${featuredImage})`, 
            backgroundSize: "cover",
            backgroundPosition: "center"
          } : undefined}
        />
        
        {/* Content */}
        <div className="p-6">
          {/* Meta */}
          <div className="flex gap-2 mb-3">
            <span className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
              {category}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{readTime}</span>
          </div>
          
          {/* Title */}
          <h2 className="text-xl font-semibold mb-3 leading-snug text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h2>
          
          {/* Excerpt */}
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
            {excerpt}
          </p>
          
          {/* Author */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {author[0]}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{author}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">{date}</div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

